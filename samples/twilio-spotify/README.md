# Sample Twilio-Spotify Sample app


## Use Case Description

This use case creates a `RecordLabel` smart contract. This contract represents an on-chain payment contract between a music artist and the record label.

Chainlink Functions is used to poll the latest monthly streaming numbers for the artist, using Soundcharts' spotify API. 

If the artist has acquired new streams since last measured, the Chainlink Functions code will use the Twilio-Sendgrid email API to send the artist an email informing them that some payments are coming their way.  The Functions code will also send the latest stream count back to the smart contract so it can be recorded immutably on the blockchain. The returned value is passed through [Chainlink's Off Chain Reporting consensus mechanism](https://docs.chain.link/architecture-overview/off-chain-reporting/) - which the nodes in the [Decentralized Oracle Network](https://chain.link/whitepaper) that are returning this streams data achieve a cryptographically verifiable consensus on that returned data!  

The smart contract can then calculate how much payment to send to the artist (the payment could be in the form of a stablecoin such as USDC). The record label and the artist have an agreed payment rate:  for example, the artist gets 1 USDC for every 10000 additional streams for every 1000 additional steams.  This rate is part of the smart contract's code and represents a trust-minimized, verifiable, on-chain record of the agreement. 

## Instructions to run this sample

### Setup

1. Get your Twilio Sendgrid API Keys by following [these docs](https://docs.sendgrid.com/for-developers/sending-email/api-getting-started). <b> You cannot use this sample without completing the Sendgrid setup steps!</b>

2. Ensure you follow the [verify process](https://docs.sendgrid.com/ui/sending-email/sender-verification) for the email address that you intend to send from. Sendgrid needs to approve it.

3. Take a look at the [soundcharts sandbox api](https://doc.api.soundcharts.com/api/v2/doc). Note that the sandbox's API credentials are public for a very limited data set. It's enough for this sample.

4. Get your network's token (Sepolia Eth) or [Mumbai Matic](https://faucet.polygon.technology/) and, after connecting your Metamask wallet to the right testnet, get some LINK token(faucets.link.com).

5. Make sure you have your testnet node RPC URLs in the `./env` file. If necessary, use infura.io or alchemy.com to get your testnet node RPC URL.

// TODO Zubin resume

### Tooling/Code

1. Set your Environment Variables in a `.env` file this repo's root directory.  You would need the Environment Variables (please refer to the `.env.example` file):
> :warning: DO NOT COMMIT YOUR .env FILE! The .gitignore file excludes .env but NOT .env.example
        
        ARTIST_EMAIL="YOU_CAN_PUT_YOUR_EMAIL_HERE" 
        TWILIO_API_KEY="YOUR TWILIO API KEY"
        SOUNDCHART_APP_ID="soundcharts"
        SOUNDCHART_API_KEY="soundcharts"

        # and 

        MUMBAI_RPC_URL="https://polygon-mumbai.g.alchemy.com/v2/ExampleKey"  # OR
        SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/ExampleKey"  # and
        PRIVATE_KEY="EVM wallet private key (Example: 6c0d*********************************************ac8da9)"


2. Update the `../../hardhat.config.js` in the project's root file to include your private keys for a second wallet account We will pretend this is the artist's wallet address.

```
accounts: process.env.PRIVATE_KEY
        ? [
            {
              privateKey: process.env.PRIVATE_KEY,
              balance: "10000000000000000000000",
            },
// Add this....
            {
              privateKey: process.env.SECOND_PRIVATE_KEY,
              balance: "10000000000000000000000",
            },
          ]
        : [],
```

3. Study the file `./Twilio-Spotify-Functions-Source-Example.js`. Ensure you fill in the `VERIFIED_SENDER` constant.  

4. Study the `RecordLabel` contract in `../../contracts/sample-apps/RecordLabel.sol` which makes the request and receives the results sent by the Functions source code example.  

5. Copy the value of the variable `requestConfig` in `./twilio-spotify-requestConfig.js` and replace the value of `requestConfig` in `../../Functions-request-config.js`.  Note that this example uses Off Chain Secrets.  Follow the instructions in the Main README on how to use Off Chain Secrets.

6. For the twilio-spotify example, the tasks are custom made in the `tasks/Sample-apps-tasks` folder.  The Tasks available for the sample apps are:

```
npx hardhat functions-simulate-twilio --gaslimit 300000 // set the max gas limit to run the computations in the RecorLabel's fulfillRequest() method

// When ready to deploy to testnets, first deploy the mock stablecoin STC ERC20 contract
yhh samples-deploy-stablecoin --network <<network name>>


```

### Running other Tasks

7. > :warning: **Update the Functions Consumer Contract in code**:When you're ready to run the CLI scripts described in the main README file, make sure you update the references to the client smart contract correctly. 

    When running the CLI commands (which are Hardhat [tasks](https://hardhat.org/hardhat-runner/docs/guides/tasks-and-scripts)), be sure to find the script that implements the task in `/tasks` directory, and change the Contract name in the line that looks like this `const clientFactory = await ethers.getContractFactory("FunctionsConsumer")`. In the Twilio-spotify sample, the contract in this line will read as `const clientFactory = await ethers.getContractFactory("RecordLabel")`


