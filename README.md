# Chainlink Functions <>  Music Artist - Record Label Contract

Chainlink Functions allows users to get data from any API, even with API secrets, and perform custom/heavy computations using code logic that you provide. Chainlink Functions is currently in a closed beta. Request access to use Chainlink Functions at https://functions.chain.link.

This use case showcases how Chainlink Functions can be used to facilitate a digital agreement between a record label and a music artist, with Chainlink Functions being used to obtain the artists streaming numbers from a Spotify wrapper, as well as sending them notifications as payments are made using the [Twilio SendGrid Email API](https://www.twilio.com/en-us/sendgrid/email-api) 

The `RecordLabel` contract represents an on-chain payment contract between a music artist and the record label. Chainlink Functions is used to poll the latest monthly streaming numbers for the artist, using Soundcharts' Spotify API. The artist is paid in a (demo) Stablecoin called STC.

If the artist has acquired new streams since last measured, the Chainlink Functions code will use the Twilio-Sendgrid email API to send the artist an email informing them that some STC payments are coming their way.  The Functions code will also send the latest stream count back to the smart contract so it can be recorded immutably on the blockchain. The returned value is passed through [Chainlink's Off-Chain Reporting consensus mechanism](https://docs.chain.link/architecture-overview/off-chain-reporting/) - which the nodes in the [Decentralized Oracle Network](https://chain.link/whitepaper) that are returning this stream's data achieve a cryptographically verifiable consensus on that returned data!  

The smart contract calculates how much STC is payable to the recording artist (in real life, the payment could be in the form of a stablecoin such as USDC). The record label and the artist have an agreed payment rate:  for example, the artist gets 1 USDC for every 10000 additional streams.  This rate is part of the smart contract's code and represents a trust-minimized, verifiable, on-chain record of the agreement. 

<img width="540" alt="Messenger" src="https://user-images.githubusercontent.com/8016129/224178418-27f62a67-d44a-4fb4-8e74-c4c967f312dd.png"> <span /><span />

## Instructions to run this sample

Before you get started we recommend you read the README in [the repo](https://github.com/smartcontractkit/functions-hardhat-starter-kit) carefully to understand how this sample is designed, under the hood. Then...

1. Get your Twilio Sendgrid API Keys by following [these docs](https://docs.sendgrid.com/for-developers/sending-email/api-getting-started). <b> You cannot use this sample without completing the Sendgrid setup steps!</b> Ensure you follow the verify process for the email address that you intend to send from. Sendgrid needs to approve it. Note: it can take up to 48 hours to get verified!<br><br>

2. Take a look at the [soundcharts sandbox api](https://doc.api.soundcharts.com/api/v2/doc). Note that the sandbox's API credentials are public for a very limited data set. It's enough for this sample.<br><br>

3. Clone this repository to your local machine.<br><br>

4. Take a look at the [soundcharts sandbox api](https://doc.api.soundcharts.com/api/v2/doc). Note that the sandbox's API credentials are public for a very limited data set. It's enough for this sample.<br><br>

5. Get your RPC URL with API key for Sepolia or Mumbai - from [Infura](https://infura.io) or [Alchemy](https://alchemy.com).  Also, get your network's token (Sepolia Eth ) or [Mumbai Matic](https://faucet.polygon.technology/) and, after connecting your Metamask wallet to the right testnet, get some LINK token(faucets.link.com) into your Metamask or other browser wallet.<br><br>

6. Open this directory in your command line, then run `npm install` to install all dependencies.<br><br>

7. Set the required environment variables. This can be done by copying the file *.env.example* to a new file named *.env*. (This renaming is important so that it won't be tracked by Git.)  

**NOTE:** This example requires a second wallet private key!
  > :warning: DO NOT COMMIT YOUR .env FILE! The .gitignore file excludes .env but NOT .env.example 

  Make sure you have at least the following:
          
          ARTIST_EMAIL="PRETEND_YOUR_EMAIL_IS_THE_ARTISTS" 
          VERIFIED_SENDER="THE_EMAIL_VERIFIED_BY_TWILIO" 
          
          TWILIO_API_KEY="YOUR TWILIO API KEY"
          SOUNDCHART_APP_ID="soundcharts"
          SOUNDCHART_API_KEY="soundcharts"


          MUMBAI_RPC_URL="https://polygon-mumbai.g.alchemy.com/v2/ExampleKey"  # OR
          SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/ExampleKey"  
          
          # and
          PRIVATE_KEY="EVM wallet private key (Example: 6c0d*********************************************ac8da9)"
          SECOND_PRIVATE_KEY="SECONDWALLET KEY HERE"
   If you want to verify smart contracts using the `--verify` flag, the *ETHERSCAN_API_KEY* or *POLYGONSCAN_API_KEY* must be set in your .env file so their values can be read in `Functions-request-config.js`.<br><br> 

8. Study the file `./Twilio-Spotify-Functions-Source-Example.js`. Note how it accesses and uses arguments that you pass in, including the `VERIFIED_SENDER` constant.  Then study the `RecordLabel` contract in `../../contracts/sample-apps/RecordLabel.sol` which makes the request and receives the results sent by the Functions source code example. The request is initiated via `executeRequest()` and the DON will return the output of your custom code in the `fulfillRequest()` callback.  <br><br> 

9. Update the `../../hardhat.config.js` in the project's root file to include your private keys for a second wallet account We will pretend this is the artist's wallet address.

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


10. You can test an end-to-end request and fulfillment locally by simulating it using:<br>`npx hardhat functions-simulate-twilio --gaslimit 300000`.  This will spin up a local hardhat network and then deploy contracts and mock contracts to it, and run and e2e series of commands. Each of these commands is broken down below<br><br>

**Note:**  Steps specific to this use case are contained in `./tasks/Functions-client-twilio-spotify/<STEP #>_<<TASK NAME>>.js`.   The rest are contained in other domain-specific folders in `./tasks`.<br><br>


11.  Step 1: run the task to deploy the STC contract for payouts.  `npx hardhat functions-deploy-stablecoin --network sepolia --verify true` <br><br>

12. Step 2: Deploy the RecordLabel smart contract.
`npx hardhat functions-deploy-recordlabel --network sepolia --stc-contract <<0x-contract-address>>  --verify true` <br><br>

13. Step 3: Approve the RecordLabel contract to spend the StableCoin deployer's token balance to pay artists
`npx hardhat functions-approve-spender --network sepolia --client-contract <<0x-contract-address>>   --stc-contract <<0x-contract-address>>` <br><br>

14. Step 4: initialize artist data so the artist has a wallet address we can send payouts to.
`npx hardhat functions-initialize-artist --network sepolia --client-contract <<0x-contract-address>>`<br><br>

15. Step 5: Create a Subscription and fund it with 3 to 5 LINK (network spikes can cause LINK-ETH exchange rates to fluctuate, so more tokens protects against that weird errors!). Add the RecordLabel client as an authorised consumer
`npx hardhat functions-sub-create --network sepolia --amount 1.5 --contract <<0x-client-contract-address>>`<br><br>

16. Step 6:  Setup your Twilio and Soundchart API keys using Chainlink Off-Chain Secrets by following <a href="https://github.com/smartcontractkit/functions-hardhat-starter-kit#off-chain-secrets" target="_blank">this guidance in the CLI Tool's README.</a> Using off-chain secrets, your secrets are encrypted and then loadable from a URL rather than being passed onto the blockchain. Make sure you've added your secrets to your `.env` file and in your`Functions-request-config.js` file. Then to generate the encrypted secrets JSON file, run the command `npx hardhat functions-build-offchain-secrets --network sepolia` <br><br>

17. Step 7: send the code in `./Twilio-Spotify-Functions-Source-Example.js` to the RecordLabel Contract to initiate Chainlink Functions execution!
`npx hardhat functions-request --network sepolia --contract <<0x-client-contract-address>> --subid <__<__Subscription Id from previous step__>> --gaslimit 300000`.  <br><br>
The tool will log helpful information on each step.  Note that unless you pass the flag `--simulate false` this command automatically invokes the local simulation once before commencing on-chain transactions. This means the email API will be hit once, as part of the simulation!<br><br>

    At the end of it, you can check the wallet address that corresponds to your `process.env.SECOND_PRIVATE_KEY` and open it in the network's block explore. You should see STC tokens showing up, proving that your second address was paid out (because we pretended your second wallet address is the artist's, remember?)

<img width="540" alt="Messenger" src="https://user-images.githubusercontent.com/8016129/224178593-e0dcf724-0d38-402c-8d28-84ab9f85dca1.png"> <span /><span />



**Note**: Ensure your wallet has a sufficient LINK balance before running this command.


17. Check out the [CLI Tool's](#functions-cli-tool) README for a full list of commands.  For example, ,you can read/retrieve of the last result computed and stored on-chain in the RecordLabel smart contract by running :<br>`npx hardhat functions-read --contract 0xDeployed_client_contract_address_here`<br>


## Functions CLI Tool
This sample uses the Chainlink Functions tooling forked from [this repo](https://github.com/smartcontractkit/functions-hardhat-starter-kit).  

To get a full list of powerful and flexible commands available using the Chainlink Functions CLI tool, please visit the [ repo's command glossary](https://github.com/smartcontractkit/functions-hardhat-starter-kit#command-glossary). 


