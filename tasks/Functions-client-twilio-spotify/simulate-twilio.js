const {
  simulateRequest,
  buildRequest,
  getDecodedResultLog,
  getRequestConfig,
} = require("../../FunctionsSandboxLibrary")
const { networkConfig } = require("../../network-config")

task("functions-simulate-twilio", "Simulates an end-to-end fulfillment locally for the FunctionsConsumer contract")
  .addOptionalParam(
    "gaslimit",
    "Maximum amount of gas that can be used to call fulfillRequest in the client contract (defaults to 100,000)"
  )
  .setAction(async (taskArgs, hre) => {
    // Simulation can only be conducted on a local fork of the blockchain
    if (network.name !== "hardhat") {
      throw Error('Simulated requests can only be conducted using --network "hardhat"')
    }

    // Check to see if the maximum gas limit has been exceeded
    const gasLimit = parseInt(taskArgs.gaslimit ?? "100000")
    if (gasLimit > 300000) {
      throw Error("Gas limit must be less than or equal to 300,000")
    }

    // Recompile the latest version of the contracts
    console.log("\n__Compiling Contracts__")
    await run("compile")

    // deploy SimpleStableCoin
    console.log("\n__Deploying Demo Stable Coin__")
    const stableCoinFactory = await ethers.getContractFactory("SimpleStableCoin")
    const stableCoinContract = await stableCoinFactory.deploy()
    await stableCoinContract.deployTransaction.wait(1)

    // Deploy a mock oracle & registry contract to simulate a fulfillment
    const { oracle, registry, linkToken } = await deployMockOracle()

    // Deploy the client contract
    console.log("\n__Deploying Demo RecordLabel Contract__")
    const clientContractFactory = await ethers.getContractFactory("RecordLabel")
    const clientContract = await clientContractFactory.deploy(oracle.address, stableCoinContract.address)
    await clientContract.deployTransaction.wait(1)

    const accounts = await ethers.getSigners()
    const deployer = accounts[0]

    // Add the wallet initiating the request to the oracle allowlist to authorize a simulated fulfillment.
    const allowlistTx = await oracle.addAuthorizedSenders([deployer.address])
    await allowlistTx.wait(1)

    //  Approve RecordLabel as spender of the tokens belonging to the deployer of the Demo Stable Coin
    const deployerTokenBalance = await stableCoinContract.balanceOf(deployer.address)
    const payer = clientContract.address
    await stableCoinContract.approve(payer, deployerTokenBalance)

    // Create & fund a subscription
    const createSubscriptionTx = await registry.createSubscription()
    const createSubscriptionReceipt = await createSubscriptionTx.wait(1)
    const subscriptionId = createSubscriptionReceipt.events[0].args["subscriptionId"].toNumber()
    const juelsAmount = ethers.utils.parseUnits("10")
    await linkToken.transferAndCall(
      registry.address,
      juelsAmount,
      ethers.utils.defaultAbiCoder.encode(["uint64"], [subscriptionId])
    )
    // Authorize the client contract to use the subscription
    await registry.addConsumer(subscriptionId, clientContract.address)

    // Build the parameters to make a request from the client contract
    const unvalidatedRequestConfig = require("../../Functions-request-config.js")
    const requestConfig = getRequestConfig(unvalidatedRequestConfig)
    // Fetch the mock DON public key
    const DONPublicKey = await oracle.getDONPublicKey()
    // Remove the preceding 0x from the DON public key
    requestConfig.DONPublicKey = DONPublicKey.slice(2)
    const request = await buildRequest(requestConfig)

    // Add Artist data (wallet address) to the RecordLabel contract.
    if (!accounts[1])
      throw new Error("Artist Wallet Address missing - you may need to add a second private key to hardhat config.")

    const artistAddress = accounts[1].address // This pretends your deployer wallet is the artist's.
    if (!artistAddress || !ethers.utils.isAddress(artistAddress)) {
      throw new Error("Invalid Second Wallet Address. Please check SECOND_PRIVATE_KEY in env vars.")
    }

    const artistId = request.args[0]
    const artistCurrentBalance = await stableCoinContract.balanceOf(artistAddress)

    try {
      const setArtistDataTx = await clientContract.setArtistData(
        artistId,
        request.args[1], // Artist Name
        request.args[3], // Artist email
        request.args[2], // Last Listener Count
        0, //last paid amount - 18 decimal places
        0, // total paid till date - 18 decimal places
        artistAddress
      )
      await setArtistDataTx.wait(1)
    } catch (error) {
      console.log(
        `\nError writing artist data for ${requestConfig.args[0]} at address ${accounts[1]} to the Record Label: ${error}`
      )
      throw error
    }

    // Make a request & simulate a fulfillment
    await new Promise(async (resolve) => {
      // Initiate the request from the client contract
      const requestTx = await clientContract.executeRequest(
        request.source,
        request.secrets ?? [],
        request.args ?? [],
        subscriptionId,
        gasLimit
      )
      const requestTxReceipt = await requestTx.wait(1)
      const requestId = requestTxReceipt.events[2].args.id
      const requestGasUsed = requestTxReceipt.gasUsed.toString()

      // Simulating the JavaScript code locally
      console.log("\nExecuting JavaScript request source code locally...")

      const { success, result, resultLog } = await simulateRequest(requestConfig)
      console.log(`\n${resultLog}`)

      // Simulate a request fulfillment
      const accounts = await ethers.getSigners()
      const dummyTransmitter = accounts[0].address
      const dummySigners = Array(31).fill(dummyTransmitter)
      let i = 0
      try {
        const fulfillTx = await registry.fulfillAndBill(
          requestId,
          success ? result : "0x",
          success ? "0x" : result,
          dummyTransmitter,
          dummySigners,
          4,
          100_000,
          500_000,
          {
            gasLimit: 500_000,
          }
        )
        await fulfillTx.wait(1)
      } catch (fulfillError) {
        // Catch & report any unexpected fulfillment errors
        console.log("\nUnexpected error encountered when calling fulfillRequest in client contract.")
        console.log(fulfillError)
        resolve()
      }

      // Listen for the ArtistPaid event & log the simulated response returned to the client contract
      clientContract.on("ArtistPaid", async (artistId, amountDue) => {
        console.log("\n__Simulated On-Chain Response - Artist Paid__\n")
        if (artistId !== requestConfig.args[0]) {
          throw new Error(`ArtistIds don\'t match ${requestConfig.args[0]} is not equal to ${artistId}`)
        }
        // Check for & log a successful payment
        if (amountDue.toString()) {
          console.log(`\nArtist was paid ${amountDue / 1e18} STC\n`)
        }
        const artistNewBalance = await stableCoinContract.balanceOf(artistAddress)
        console.log(
          `\nArtist ${artistId}'s balance has been updated from ${artistCurrentBalance} to ${artistNewBalance}\n`
        )
      })

      // Listen for the OCRResponse event & log the simulated response returned to the client contract
      clientContract.on("OCRResponse", async (eventRequestId, result, err) => {
        console.log("__Simulated On-Chain Response__")
        if (eventRequestId !== requestId) {
          throw new Error(`${eventRequestId} is not equal to ${requestId}`)
        }
        // Check for & log a successful request
        if (result !== "0x") {
          console.log(
            `Response returned to client contract represented as a hex string: ${result}\n${getDecodedResultLog(
              requestConfig,
              result
            )}`
          )
        }
        // Check for & log a request that returned an error message
        if (err !== "0x") {
          console.log(`Error message returned to client contract: "${Buffer.from(err.slice(2), "hex")}"\n`)
        }
      })

      // Listen for the BillingEnd event & log the estimated billing data
      registry.on(
        "BillingEnd",
        async (
          eventRequestId,
          eventSubscriptionId,
          eventSignerPayment,
          eventTransmitterPayment,
          eventTotalCost,
          eventSuccess
        ) => {
          if (requestId == eventRequestId) {
            // Check for a successful request & log a message if the fulfillment was not successful
            if (!eventSuccess) {
              console.log(
                "\nError encountered when calling fulfillRequest in client contract.\n" +
                  "Ensure the fulfillRequest function in the client contract is correct and the --gaslimit is sufficient.\n"
              )
            }

            const fulfillGasUsed = await getGasUsedForFulfillRequest(success, result)
            console.log(`Gas used by sendRequest: ${requestGasUsed}`)
            console.log(`Gas used by client callback function: ${fulfillGasUsed}`)
            return resolve()
          }
        }
      )
    })
  })

const getGasUsedForFulfillRequest = async (success, result) => {
  const accounts = await ethers.getSigners()
  const deployer = accounts[0]
  const simulatedRequestId = "0x0000000000000000000000000000000000000000000000000000000000000001"

  const clientFactory = await ethers.getContractFactory("FunctionsConsumer")
  const client = await clientFactory.deploy(deployer.address)
  client.addSimulatedRequestId(deployer.address, simulatedRequestId)
  await client.deployTransaction.wait(1)

  let txReceipt
  if (success) {
    txReceipt = await client.handleOracleFulfillment(simulatedRequestId, result, [])
  } else {
    txReceipt = await client.handleOracleFulfillment(simulatedRequestId, [], result)
  }
  const txResult = await txReceipt.wait(1)

  return txResult.gasUsed.toString()
}

const deployMockOracle = async () => {
  // Deploy a mock LINK token contract
  const linkTokenFactory = await ethers.getContractFactory("LinkToken")
  const linkToken = await linkTokenFactory.deploy()
  const linkEthFeedAddress = networkConfig["hardhat"]["linkEthPriceFeed"]
  // Deploy proxy admin
  await upgrades.deployProxyAdmin()
  // Deploy the oracle contract
  const oracleFactory = await ethers.getContractFactory("contracts/dev/functions/FunctionsOracle.sol:FunctionsOracle")
  const oracleProxy = await upgrades.deployProxy(oracleFactory, [], {
    kind: "transparent",
  })
  await oracleProxy.deployTransaction.wait(1)
  // Set the secrets encryption public DON key in the mock oracle contract
  await oracleProxy.setDONPublicKey("0x" + networkConfig["hardhat"]["functionsPublicKey"])
  // Deploy the mock registry billing contract
  const registryFactory = await ethers.getContractFactory(
    "contracts/dev/functions/FunctionsBillingRegistry.sol:FunctionsBillingRegistry"
  )
  const registryProxy = await upgrades.deployProxy(
    registryFactory,
    [linkToken.address, linkEthFeedAddress, oracleProxy.address],
    {
      kind: "transparent",
    }
  )
  await registryProxy.deployTransaction.wait(1)
  // Set registry configuration
  const config = {
    maxGasLimit: 300_000,
    stalenessSeconds: 86_400,
    gasAfterPaymentCalculation: 39_173,
    weiPerUnitLink: ethers.BigNumber.from("5000000000000000"),
    gasOverhead: 519_719,
    requestTimeoutSeconds: 300,
  }
  await registryProxy.setConfig(
    config.maxGasLimit,
    config.stalenessSeconds,
    config.gasAfterPaymentCalculation,
    config.weiPerUnitLink,
    config.gasOverhead,
    config.requestTimeoutSeconds
  )
  // Set the current account as an authorized sender in the mock registry to allow for simulated local fulfillments
  const accounts = await ethers.getSigners()
  const deployer = accounts[0]
  await registryProxy.setAuthorizedSenders([oracleProxy.address, deployer.address])
  await oracleProxy.setRegistry(registryProxy.address)
  return { oracle: oracleProxy, registry: registryProxy, linkToken }
}
