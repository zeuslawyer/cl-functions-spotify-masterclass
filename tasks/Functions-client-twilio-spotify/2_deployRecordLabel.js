const { types } = require("hardhat/config")
const { VERIFICATION_BLOCK_CONFIRMATIONS, networkConfig } = require("../../network-config")

task("functions-deploy-recordlabel", "Deploys the RecordLabel contract")
  .addParam("stcContract", "Contract address for the Simple Stable Coin")
  .addOptionalParam("verify", "Set to true to verify client contract", false, types.boolean)
  .setAction(async (taskArgs) => {
    if (network.name === "hardhat") {
      throw Error(
        'This command cannot be used on a local hardhat chain.  Specify a valid network or simulate a RecordLabel request locally with "npx hardhat functions-simulate".'
      )
    }

    console.log(`Deploying RecordLabel contract to ${network.name}`)

    const oracleAddress = networkConfig[network.name]["functionsOracleProxy"]
    const stcAddress = taskArgs.stcContract

    if (!ethers.utils.isAddress(stcAddress))
      throw Error("Please provide a valid contract address for the SimpleStableCoin contract")

    console.log("\n__Compiling Contracts__")
    await run("compile")

    const accounts = await ethers.getSigners()

    // Deploy RecordLabel
    const clientContractFactory = await ethers.getContractFactory("RecordLabel")
    const clientContract = await clientContractFactory.deploy(oracleAddress, stcAddress)

    console.log(
      `\nWaiting ${VERIFICATION_BLOCK_CONFIRMATIONS} blocks for transaction ${clientContract.deployTransaction.hash} to be confirmed...`
    )
    await clientContract.deployTransaction.wait(VERIFICATION_BLOCK_CONFIRMATIONS)

    // Verify the RecordLabel Contract
    const verifyContract = taskArgs.verify

    if (verifyContract && (process.env.POLYGONSCAN_API_KEY || process.env.ETHERSCAN_API_KEY)) {
      try {
        console.log("\nVerifying contract...")
        await clientContract.deployTransaction.wait(Math.max(6 - VERIFICATION_BLOCK_CONFIRMATIONS, 0))
        await run("verify:verify", {
          address: clientContract.address,
          constructorArguments: [oracleAddress, stcAddress],
        })
        console.log("RecordLabel verified")
      } catch (error) {
        if (!error.message.includes("Already Verified")) {
          console.log("Error verifying contract.  Try delete the ./build folder and try again.")
          console.log(error)
        } else {
          console.log("Contract already verified")
        }
      }
    } else if (verifyContract) {
      console.log("\nPOLYGONSCAN_API_KEY or ETHERSCAN_API_KEY missing. Skipping contract verification...")
    }

    console.log(`\nRecordLabel contract deployed to ${clientContract.address} on ${network.name}`)
  })
