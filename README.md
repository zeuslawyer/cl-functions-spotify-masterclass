# Repo for the Chainlink Functions Deep Dive Masterclass
This repo houses code prepared to demonstrate the power of Chainlink Functions. Chainlink Functions is a powerhouse technology that helps blockchain engineers connect their Decentralized Applications to **any** data source or API on Earth. While keeping API keys and secrets secure (through encryption), and having the data returned from decentralized computation run through 
Chainlink's consensul protocol, to ensure that the data returned to your smart contract is
- trust minimized
- verifiably cryptographically truthful

The Masterclass will be held on 2 May 2023, at 5pm EST.  Details can be found [here](https://go.chain.link/masterclass/functions-module-1).


> **Important**
> registration is compulsory!

Chainlink Functions is currently in a closed beta. Request access to use Chainlink Functions at https://functions.chain.link.


## What we are building

This use case showcases how Chainlink Functions can be used to facilitate a digital agreement between a record label and a music artist, with Chainlink Functions being used to obtain the artists streaming numbers from a Spotify wrapper.  You are also provided high level guidance on implementing a system to notify artists of payouts,  using the [Twilio SendGrid Email API](https://www.twilio.com/en-us/sendgrid/email-api)

The `RecordLabel` contract represents an on-chain payment contract between a music artist and the record label. Chainlink Functions is used to poll the latest monthly streaming numbers for the artist, using Soundcharts' Spotify API. The artist is paid in a (demo) Stablecoin called STC.

If the artist has acquired new streams since last measured, the Chainlink Functions code will use the Twilio-Sendgrid email API to send the artist an email informing them that some STC payments are coming their way. The Functions code will also send the latest stream count back to the smart contract so it can be recorded immutably on the blockchain. The returned value is passed through [Chainlink's Off-Chain Reporting consensus mechanism](https://docs.chain.link/architecture-overview/off-chain-reporting/) - which the nodes in the [Decentralized Oracle Network](https://chain.link/whitepaper) that are returning this stream's data achieve a cryptographically verifiable consensus on that returned data!

The smart contract calculates how much STC is payable to the recording artist (in real life, the payment could be in the form of a stablecoin such as USDC). The record label and the artist have an agreed payment rate: for example, the artist gets 1 STC for every 10000 additional streams. This rate is part of the smart contract's code and represents a trust-minimized, verifiable, on-chain record of the agreement.

<img width="540" alt="Messenger" src="https://user-images.githubusercontent.com/8016129/224178418-27f62a67-d44a-4fb4-8e74-c4c967f312dd.png"> <span /><span />

## Instruction Manual
A step by step written manual for the workshop is available [here](https://TODO.com).