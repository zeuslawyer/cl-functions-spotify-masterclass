const { types } = require("hardhat/config")
const { VERIFICATION_BLOCK_CONFIRMATIONS, networkConfig } = require("../../network-config")

task("functions-initialize-artist", "Seed RecordLabel with Artist Data")
  .addParam("clientContract", "Contract address for RecordLabel")
  .setAction(async (taskArgs) => {
    if (network.name === "hardhat") {
      throw Error(
        'This command cannot be used on a local hardhat chain.  Specify a valid network or simulate a RecordLabel request locally with "npx hardhat functions-simulate".'
      )
    }
    const recordLabelAddress = taskArgs.clientContract

    if (!ethers.utils.isAddress(recordLabelAddress))
      throw Error("Please provide a valid contract address for the SimpleStableCoin contract")

    const requestConfig = require("../../Functions-request-config.js")
    const accounts = await ethers.getSigners()

    if (!accounts[1])
      throw new Error("Artist Wallet Address missing - you may need to add a second private key to hardhat config.")

    // Pretend your second wallet address is the Artist's wallet, and setup ArtistData on RecordLabel to point to your address.
    const artistAddress = accounts[1].address // This pretends your deployer wallet is the artist's.

    if (!artistAddress || !ethers.utils.isAddress(artistAddress)) {
      throw new Error("Invalid Second Wallet Address. Please check SECOND_PRIVATE_KEY in env vars.")
    }

    const [artistId, artistName, artistListenerCount, artistEmail] = requestConfig.args
    console.log(
      "\n Adding following artist data to RecordLabel: ",
      artistId,
      artistName,
      artistListenerCount,
      artistEmail
    )

    const clientContractFactory = await ethers.getContractFactory("RecordLabel")
    const clientContract = await clientContractFactory.attach(recordLabelAddress)

    try {
      const setArtistDataTx = await clientContract.setArtistData(
        artistId,
        artistName,
        artistEmail,
        artistListenerCount,
        0, //last paid amount: 18 decimal places
        0, // total paid till date: 18 decimal places
        artistAddress
      )
      await setArtistDataTx.wait(1)
    } catch (error) {
      console.log(
        `\nError writing artist data for ${artistId} at address ${artistAddress} to the Record Label: ${error}`
      )
      throw error
    }

    console.log(`\nSeeded initial Artist Data for ${artistName} and assigned them wallet address ${artistAddress}.`)
  })
