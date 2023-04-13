const { types } = require("hardhat/config")
const { VERIFICATION_BLOCK_CONFIRMATIONS, networkConfig } = require("../../network-config")

task("functions-approve-spender", "Approves RecordLabel to pay STC to artist")
  .addParam("stcContract", "Contract address for the Simple Stable Coin")
  .addParam("clientContract", "Contract address for RecordLabel")
  .addOptionalParam("verify", "Set to true to verify client contract", false, types.boolean)
  .setAction(async (taskArgs) => {
    if (network.name === "hardhat") {
      throw Error(
        'This command cannot be used on a local hardhat chain.  Specify a valid network or simulate a RecordLabel request locally with "npx hardhat functions-simulate".'
      )
    }

    console.log("\n__Compiling Contracts__")
    await run("compile")

    const oracleAddress = networkConfig[network.name]["functionsOracleProxy"]
    const stcAddress = taskArgs.stcContract
    const recordLabelAddress = taskArgs.clientContract

    if (!ethers.utils.isAddress(stcAddress))
      throw Error("Please provide a valid contract address for the SimpleStableCoin contract")

    if (!ethers.utils.isAddress(recordLabelAddress))
      throw Error("Please provide a valid contract address for the RecordLabel contract")

    //  Approve RecordLabel as spender of the tokens belonging to the deployer of the Demo Stable Coin
    const [deployer] = await ethers.getSigners()
    console.log(
      `\nApproving RecordLabel to spend the balance of the SimpleStableCoin deployer ("${deployer.address}") as payments to artists...`
    )

    const stableCoinFactory = await ethers.getContractFactory("SimpleStableCoin")
    const stableCoinContract = await stableCoinFactory.attach(stcAddress)
    const deployerTokenBalance = await stableCoinContract.balanceOf(deployer.address)

    await stableCoinContract.approve(recordLabelAddress, deployerTokenBalance)

    console.log("\nRecordLabel is now approved to pay artists...")
  })
