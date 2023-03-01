# Chainlink Functions <>  Twilio-Spotify Sample app

This use case showcases how Chainlink Functions can be used to facilitate a digital agreement between a record label and a music artist, with Chainlink Functions being used to obtain the artists streaming numbers, as well as to send them notifications as payments are made using the [Twilio SendGrid Email API](https://www.twilio.com/en-us/sendgrid/email-api) 

The `RecordLabel` contract represents an on-chain payment contract between a music artist and the record label. Chainlink Functions is used to poll the latest monthly streaming numbers for the artist, using Soundcharts' spotify API. 

If the artist has acquired new streams since last measured, the Chainlink Functions code will use the Twilio-Sendgrid email API to send the artist an email informing them that some payments are coming their way.  The Functions code will also send the latest stream count back to the smart contract so it can be recorded immutably on the blockchain. The returned value is passed through [Chainlink's Off Chain Reporting consensus mechanism](https://docs.chain.link/architecture-overview/off-chain-reporting/) - which the nodes in the [Decentralized Oracle Network](https://chain.link/whitepaper) that are returning this streams data achieve a cryptographically verifiable consensus on that returned data!  

The smart contract can then calculate how much payment to send to the artist (the payment could be in the form of a stablecoin such as USDC). The record label and the artist have an agreed payment rate:  for example, the artist gets 1 USDC for every 10000 additional streams for every 1000 additional steams.  This rate is part of the smart contract's code and represents a trust-minimized, verifiable, on-chain record of the agreement. 


Chainlink Functions allows users to request data from almost any API and perform custom computation using JavaScript. This project is currently in a closed beta. Request access to use Chainlink Functions at https://functions.chain.link


If the artist has acquired new streams since last measured, the Chainlink Functions code will use the Twilio-Sendgrid email API to send the artist an email informing them that some payments are coming their way.  

<img width="540" alt="Messenger" src="https://user-images.githubusercontent.com/8016129/222272480-cd09893b-00f5-4104-82f6-3eef34b063d6.png"> <span /><span />

## Instructions to run this sample

1. Get your Twilio Sendgrid API Keys by following [these docs](https://docs.sendgrid.com/for-developers/sending-email/api-getting-started). <b> You cannot use this sample without completing the Sendgrid setup steps!</b> Ensure you follow the verify process for the email address that you intend to send from. Sendgrid needs to approve it.
2. Take a look at the [soundcharts sandbox api](https://doc.api.soundcharts.com/api/v2/doc). Note that the sandbox's API credentials are public for a very limited data set. It's enough for this sample.
3. Clone this repository to your local machine<br><br>
4. Open this directory in your command line, then run `npm install` to install all dependencies.<br><br>
5. Set the required environment variables.
   1. This can be done by copying the file *.env.example* to a new file named *.env*. (This renaming is important so that it won't be tracked by Git.) Then, change the following values:
      - *PRIVATE_KEY* for your development wallet
      - *MUMBAI_RPC_URL* or *SEPOLIA_RPC_URL* for the network that you intend to use
   2. If desired, the *ETHERSCAN_API_KEY* or *POLYGONSCAN_API_KEY* can be set in order to verify contracts, along with any values used in the *secrets* object in *Functions-request-config.js* such as *COINMARKETCAP_API_KEY*.<br><br> You will also need the following additional Environment Variables (please refer to the `.env.example` file). The only ones you need to update for now are the first two.
        
        ARTIST_EMAIL="YOU_CAN_PUT_YOUR_EMAIL_HERE"
        VERIFIED_SENDER="TWILIO VERIFIED SENDER EMAIL"  
        TWILIO_API_KEY="YOUR TWILIO API KEY"
        SOUNDCHART_APP_ID="soundcharts"
        SOUNDCHART_API_KEY="soundcharts"


6. Study the file `./Twilio-Spotify-Functions-Source-Example.js`. Ensure you fill in the `VERIFIED_SENDER` constant with your Sendgrid Twilio-verified sender email address.  
7. Test an end-to-end request and fulfillment locally by simulating it using:<br>`npx hardhat functions-simulate`<br><br>
8. Deploy and verify the RecordLabel contract to an actual blockchain network by running:<br>`npx hardhat functions-deploy-client --network network_name_here --verify true`<br>**Note**: Make sure *ETHERSCAN_API_KEY* or *POLYGONSCAN_API_KEY* are set if using `--verify true`, depending on which network is used.<br><br> Network_name_here should be replaced with the network you are deploying to (Sepolia or Mumbai) in this step, as well as all steps after this one
9. Create, fund & authorize a new Functions billing subscription by running:<br> `npx hardhat functions-sub-create --network network_name_here --amount LINK_funding_amount_here --contract 0xDeployed_client_contract_address_here`<br>**Note**: Ensure your wallet has a sufficient LINK balance before running this command.  Testnet LINK can be obtained at <a href="https://faucets.chain.link/">faucets.chain.link</a>.<br><br> A suitable amount of LINK to fund for most requests is 0.5 - 1 LINK. You should replace 0xDeployed_client_contract_address_here with your deployed contract address from the previous step.
10. Make an on-chain request by running:<br>`npx hardhat functions-request --network network_name_here --contract 0xDeployed_client_contract_address_here --subid subscription_id_number_here`, replacing subscription_id_number_here with the subscription ID you received from the previous step
11. Read the result in the on-chain smart contract by running :<br>`npx hardhat functions-read --contract 0xDeployed_client_contract_address_here`<br>

The smart contract can then calculate how much payment to send to the artist (the payment could be in the form of a stablecoin such as USDC). The record label and the artist have an agreed payment rate:  for example, the artist gets 1 USDC for every 10000 additional streams for every 1000 additional steams.  This rate is part of the smart contract's code and represents a trust-minimized, verifiable, on-chain record of the agreement. 


## Functions CLI Tool
This sample uses the tooling in [this repo](https://github.com/smartcontractkit/functions-hardhat-starter-kit).  To get a full list of commands available using the Chainlink Functions CLI tool please visit the README on that repo.


## Before you Start...
### Setup

1. Get your Twilio Sendgrid API Keys by following [these docs](https://docs.sendgrid.com/for-developers/sending-email/api-getting-started). <b> You cannot use this sample without completing the Sendgrid setup steps!</b>

2. Ensure you follow the [verify process](https://docs.sendgrid.com/ui/sending-email/sender-verification) for the email address that you intend to send from. Sendgrid needs to approve it.

3. Take a look at the [soundcharts sandbox api](https://doc.api.soundcharts.com/api/v2/doc). Note that the sandbox's API credentials are public for a very limited data set. It's enough for this sample.

4. Get your RPC URL with API key for Sepolia or Mumbai - from [Infura](https://infura.io) or [Alchemy](https://alchemy.com).

5. Get your network's token (Sepolia Eth ) or [Mumbai Matic](https://faucet.polygon.technology/) and, after connecting your Metamask wallet to the right testnet, get some LINK token(faucets.link.com) into your Metamask or other browser wallet.

6. Make sure you have your testnet node RPC URLs in the `./env` file. If necessary, use infura.io or alchemy.com to get your testnet node RPC URL.

7. Create a `.env` file in the project's root (please refer to the `.env.example` file):.  Make sure you have at least the following:

      > :warning: DO NOT COMMIT YOUR .env FILE! The .gitignore file excludes .env but NOT .env.example
        
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

8. Update the `../../hardhat.config.js` in the project's root file to include your private keys for a second wallet account We will pretend this is the artist's wallet address.

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


9. Study the file `./samples/twilio-spotify/Twilio-Spotify-Functions-Source-Example.js`. 

4. Study the `RecordLabel` contract in `../../contracts/sample-apps/RecordLabel.sol` which makes the request and receives the results sent by the Functions source code example. The request is initiated via `executeRequest()` and the DON will return the output of your custom code in the `fulfillRequest()` callback.  

5. Copy the value of the variable `requestConfig` in `./samples/twilio-spotify/twilio-spotify-requestConfig.js`. Paste/replace that object as the new value of `requestConfig` in `../../Functions-request-config.js`.  Note that this example uses Off Chain Secrets.  Follow the instructions in [the upstream README](https://github.com/smartcontractkit/functions-hardhat-starter-kit#off-chain-secrets) on how to use Off Chain Secrets.




### Executing your Chainlink Functions Custom Code via CLI commands

1. All commands are documented in the [upstream repo's command glossary](https://github.com/smartcontractkit/functions-hardhat-starter-kit#command-glossary). We will run through the main commands here. Note that for this twilio-spotify example, the tasks are custom made in the `tasks/Sample-apps-tasks` folder. 

2.  > :warning: **Update the Functions Consumer Contract in code**:When you're ready to run the CLI scripts described in the main README file, make sure you update the references to the client smart contract correctly. 

    When running the CLI commands (which are Hardhat [tasks](https://hardhat.org/hardhat-runner/docs/guides/tasks-and-scripts)), be sure to find the script that implements the task in `/tasks` directory, and change the Contract name in the line that looks like this `const clientFactory = await ethers.getContractFactory("FunctionsConsumer")`. In the Twilio-spotify sample, the contract in this line will read as `const clientFactory = await ethers.getContractFactory("RecordLabel")`.  Replace all references to `await ethers.getContractFactory("FunctionsConsumer")`  in `./tasks/...` to `await ethers.getContractFactory("RecordLabel")`.


3. First deploy the SimpleStableCoin contract to the testnet of your choice
`npx hardhat functions-deploy-stablecoin --network <<network name>>`

4. Then deploy the RecordLabel Smart Contract (referred to as "FunctionsConsumer")
` npx hardhat functions-deploy-recordlabel --network <<network name>> --stc-contract <<address of the SimpleStableCoin contract>>`

5. Create a Chainlink subscription, fund it with LINK (decimals accepted), and add your RecordLabel contract as an authorized consumer / client of Chainlink Functions services.
`npx hardhat functions-sub-create --network <<network name>> --amount 2.5 --contract <<0x-RecordLabel-address>>`
    This will print out information on the subscription ID created, and the details of your LINK balance and which contracts are authorised consumers.


// TODO :Zubin remove this below
```
npx hardhat functions-simulate-twilio --gaslimit 300000 // set the max gas limit to run the computations in the RecorLabel's fulfillRequest() method

// When ready to deploy to testnets, first deploy the mock stablecoin SimpleStableCoin ERC20 contract
yhh function-deploy-stablecoin --network <<network name>>


```
{
  error: true,
  message (may be undefined): String containing error message,
  code (may be undefined): String containing an error code,
  response (may be undefined): Object containing response sent from the server,
}
```

This library also exposes functions for encoding JavaScript values into Buffers which represent the bytes that a returned on-chain.

- `Functions.encodeUint256` takes a positive JavaScript integer number and returns a Buffer of 32 bytes representing a `uint256` type in Solidity.
- `Functions.encodeInt256` takes a JavaScript integer number and returns a Buffer of 32 bytes representing a `int256` type in Solidity.
- `Functions.encodeString` takes a JavaScript string and returns a Buffer representing a `string` type in Solidity.

Remember, it is not required to use these encoding functions.  The JavaScript code must only return a Buffer which represents the `bytes` array that is returned on-chain.

## Modifying Contracts

Client contracts which initiate a request and receive a fulfillment can be modified for specific use cases. The only requirements are that the contract successfully calls *sendRequest* in the *FunctionsOracle* contract and correctly implements their own *handleOracleFulfillment* function.  At this time, the maximum amount of gas that *handleOracleFulfillment* can use is 300,000. See *FunctionsClient.sol* for details.

## Simulating Requests

An end-to-end request initiation and fulfillment can be simulated for the default *FunctionsConsumer* contract using the `functions-simulate` command. This command will report the total estimated gas use.
If the *FunctionsConsumer* client contract is modified, this task must also be modified to accomodate the changes. See `tasks/Functions-client/simulate` for details.

**Note:** The actual gas use on-chain can vary, so it is recommended to set a higher fulfillment gas limit when making a request to account for any differences.

## Off-chain Secrets

Instead of using encrypted secrets stored directly on the blockchain, encrypted secrets can also be hosted off-chain and be fetched by DON nodes via HTTP when a request is initiated.

Off-chain secrets also enable a separate set of secrets to be assigned to each node in the DON. Each node will not be able to decrypt the set of secrets belonging to another node. Optionally, a set of default secrets encrypted with the DON public key can be used as a fallback by any DON member who does not have a set of secrets assigned to them. This handles the case where a new member is added to the DON, but the assigned secrets have not yet been updated.

To use per-node assigned secrets, enter a list of secrets objects into `perNodeOffchainSecrets` in *Functions-request-config.js* before running the `functions-build-offchain-secrets` command. The number of objects in the array must correspond to the number of nodes in the DON. Default secrets can be entered into the `globalOffchainSecrets` parameter of `Functions-request-config.js`. Each secrets object must have the same set of entries, but the values for each entry can be different (ie: `[ { apiKey: '123' }, { apiKey: '456' }, ... ]`). If the per-node secrets feature is not desired, `perNodeOffchainSecrets` can be left empty and a single set of secrets can be entered for `globalOffchainSecrets`.

To generate the encrypted secrets JSON file, run the command `npx hardhat functions-build-offchain-secrets --network network_name_here`. This will output the file *offchain-secrets.json* which can be uploaded to S3, Github, or another hosting service that allows the JSON file to be fetched via URL.
Once the JSON file is uploaded, set `secretsLocation` to `Location.Remote` in *Functions-request-config.js* and enter the URL(s) where the JSON file is hosted into `secretsURLs`. Multiple URLs can be entered as a fallback in case any of the URLs are offline. Each URL should host the exact same JSON file. The tooling will automatically pack the secrets URL(s) into a space-separated string and encrypt the string using the DON public key so no 3rd party can view the URLs. Finally, this encrypted string of URLs is used in the `secrets` parameter when making an on-chain request.

URLs which host secrets must be available ever time a request is executed by DON nodes. For optimal security, it is recommended to expire the URLs when the off-chain secrets are no longer in use.

# Automation Integration

Chainlink Functions can be used with Chainlink Automation in order to automatically trigger a Functions request.

1. Create & fund a new Functions billing subscription by running:<br>`npx hardhat functions-sub-create --network network_name_here --amount LINK_funding_amount_here`<br>**Note**: Ensure your wallet has a sufficient LINK balance before running this command.<br><br>
2. Deploy the *AutomationFunctionsConsumer* client contract by running:<br>`npx hardhat functions-deploy-auto-client --network network_name_here --subid subscription_id_number_here --interval time_between_requests_here --verify true`<br>**Note**: Make sure `ETHERSCAN_API_KEY` or `POLYGONSCAN_API_KEY` environment variables are set. API keys for these services are freely available to anyone who creates an EtherScan or PolygonScan account.<br><br>
3. Register the contract for upkeep via the Chainlink Automation web app here: [https://automation.chain.link/](https://automation.chain.link/)
   - Be sure to set the `Gas limit` for the *performUpkeep* function to a high enough value.  The recommended value is 1,000,000.
   - Find further documentation for working with Chainlink Automation here: [https://docs.chain.link/chainlink-automation/introduction](https://docs.chain.link/chainlink-automation/introduction)

Once the contract is registered for upkeep, check the latest response or error with the commands `npx hardhat functions-read --network network_name_here --contract contract_address_here`.

For debugging, use the command `npx hardhat functions-check-upkeep --network network_name_here --contract contract_address_here` to see if Automation needs to call *performUpkeep*.
To manually trigger a request, use the command `npx hardhat functions-perform-upkeep --network network_name_here --contract contract_address_here`.


# Sample Apps

> :warning: **Functions is in Beta**: Some of these use cases are solely to educate developers on functionality, current and proposed, in the rollout of Chainlink Functions. While several of these sample apps demonstrate posting data to external APIs, this functionality is under active development and is not yet recommended for production use. 

*Notes to Repo Developers*:
- Currently, we follow this [workflow for forks & syncing](https://www.atlassian.com/git/tutorials/git-forks-and-upstreams). These instructions use the same terminology from that article regarding "origin" and "upstream" repos. Please add the `upstream` repo as indicated in the article.
- Please make sure the `main` branch of this repo is synced to `main` of its [upstream repo](https://github.com/smartcontractkit/functions-hardhat-starter-kit) before pulling and adding any code.
- once you have synced to `main` of upstream, create  a new local branch on your machine with `git checkout -b <<YOUR DEV BRANCH NAME>>`
- As you develop locally, the `main` branch in the upstream may progress, so make sure you sync this fork via the Github UI and the `git pull` into your `main` branch. To get those changes patched into your dev branch, change to your dev branch and then run `git rebase main`.  This will apply all your changes "on top of" the latest syncs.
- Ideally do not push your dev branch to this repo until you're ready to submit a PR. Complete your development, and rebase your dev branch onto `main` before you push and request a PR   :warning: **If you have already pushed and have more changes your local branch and the remove will have a "has diverged" error.** You may need to follow the `git merge` workflow referred to in article mentioned above, to resolve conflicts.
- All sample app use case code goes into the `/samples`directory. Take a look at `/samples/twilio-spotify` to see how to write a sample app.
- Please add sample-specific instructions to a separate README inside your sample app directory.  For example `./samples/twilio-spotify/README.md`
- when submitting a PR for approval :warning: **make sure you set the base repo to this samples repo and NOT the upstream. Make sure you set the base branch as `main`**

### How to run a sample app

When running a sample app: 
- Take a look at the README file inside the sample app's directory in the `./samples/...` path.
- always make sure you comment out the existing `requestConfig` object in the `./Functions-request-config.js` file 
- Replace it with a correctly set up request configuration object that is specific to your app.  For example, for the twilio-spotify example, the config object for that use case is specified in `./samples/twilio-spotify/twilio-spotify-requestConfig.js`. That object is copied and pasted into `./Functions-request-config.js` to replace the default object.
- when running the CLI commands (which are Hardhat [tasks](https://hardhat.org/hardhat-runner/docs/guides/tasks-and-scripts)), be sure to find the script that implements the task in `/tasks` directory, and change the Contract name in the line that looks like this `const clientFactory = await ethers.getContractFactory("FunctionsConsumer")`. In the Twilio-spotify sample, the contract in this line will read as `const clientFactory = await ethers.getContractFactory("RecordLabel")`
