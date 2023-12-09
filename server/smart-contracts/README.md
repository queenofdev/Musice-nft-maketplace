# Track Pack and Song NFT Smart Contracts

The Track Pack and Song NFT smart contracts are the core contracts for the Mosh.gg platform. Users mint Track Pack NFTs by paying USDC and can
then open their Track Pack NFT for one or more song NFTs by burning their Track Pack NFT. When users receive song NFTs by opening their Track Pack
NFT, their song NFTs are assigned randomly to a song. When royalties are deposited into the smart contract for those songs, users can then claim
their portion of the royalties in the native coin based on the percentage of NFTs assigned to the songs they hold. The song selection and the number
of songs a user receives when opening a Track Pack NFT is determined by the current drop where each drop is a new Track Pack NFT and Song NFT contract pair.

# Development Environment Setup

To set up the Brownie development environment for testing and any further development, follow the instructions here provided in the Brownie documentation:

https://eth-brownie.readthedocs.io/en/stable/install.html

It's key to note here that Brownie has two requirements before the development environment is fully set up:

Python3 - https://www.python.org/downloads/release/python-368/

Ganache-CLI - https://github.com/trufflesuite/ganache-cli

# Project Information

The Track Pack and Song NFT smart contracts were developed using the eth-brownie Python web3 framework. This repository contains the smart contract code, the
configuration for testing/deployments, the scripts used to test both contracts, and the scripts used to deploy the contracts.

Once the development environment is set up, to compile the smart contract code, run the command:

``brownie compile``

To run the tests for the smart contract code, run the command:

``brownie test``

To get more verbose output when running the smart contract tests, run the command:

``brownie test -v -s``

To run just a single smart contract test, run the command:

``brownie test -v -s -k [test function name]``

# Contract Deployment Commands

To deploy the Track Pack and Song NFT smart contracts, run the command (and more instructions below):

``brownie run scripts/deploy.py deploy --network [network name] unassignedSongTokenURI=[Unassigned Song Token URI] vrfCoordinatorAddress=[VRF Coordinator Address] usdcAddress=[USDC Address] trackPackTokenURI=[Track Pack Token URI] maxTrackPackNFTs=[Max Track Pack NFTs] trackPackPriceInUSDC=[Track Pack USDC Price 1000000 for 1 USDC] numSongsPerTrackPack=[Number of Songs Per Track Pack Opening] keyHash=[Gas Lane]``

The network name can be determined or set with the network commands detailed at the end of this README. 

As far as the script parameters, here is an explanation for each:

**unassignedSongTokenURI** - The token URI assigned to a song NFT right as it is minted after a Track Pack NFT burn. There is a small period of time between
when a song NFT is minted and when the Chainlink VRF returns a random number to the Track Pack NFT contract so the song NFT can be assigned a song ID
and thus a real song NFT token URI. This URI is the placeholder users will see for the first few minutes after opening a Track Pack.

**vrfCoordinatorAddress** - The address of the Chainlink VRF Coordinator which is where the Track Pack NFT connects to to request random numbers from Chainlink.
Visit this page to see the VRF Coordinator addresses for all supported networks: https://docs.chain.link/vrf/v2/subscription/supported-networks#ethereum-mainnet

**usdcAddress** - The address for USDC on the network deploying to.

**trackPackTokenURI** - The token URI for all Track Pack NFTs for the current drop.

**maxTrackPackNFTs** - The maximum number of Track Pack NFTs that can be minted for this drop.

**trackPackPriceInUSDC** - The Track Pack NFT mint price in USDC. Keep in mind that this value includes the decimals for USDC which is 6. So if
a Track Pack NFT costs 100 USDC, this value needs to be 100000000 (it's like wei but USDC has 6 decimals not the usual 18).

**numSongsPerTrackPack** - The number of song NFTs that are minted for a user when they open a Track Pack NFT.

**keyHash** - The gas lane to use which depends on the network.
Visit this page to see the gas lane to use based on the network: https://docs.chain.link/vrf/v2/subscription/supported-networks#ethereum-mainnet

To deploy the contracts to an actual blockchain (versus a local blockchain spun up with Ganache), you'll need to create a .env file at the root of the project and add the line:

``export PRIVATE_KEY=[Private key for the address you're deploying with]``

This is how Brownie is able to use your account to transact on whatever blockchain you're deploying to. To learn how to export your private key from MetaMask, visit this link:

https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key

If you want to verify the contracts on the explorer, and if you are deploying to a network with Infura, you also need to add these lines to the .env file:

``export ETHERSCAN_TOKEN=[token for the explorer you are verifying on - the name of this variable changes depending on the network]``

``export WEB3_INFURA_PROJECT_ID=[Infura project ID]``

Also use the .env.example file for a reference when creating the .env file. For more inforamation on setting up an Infura project to get the Infura ID, check out:

https://docs.infura.io/infura/getting-started

To deploy a mock token to use in place of USDC on the testnet, run the command:

``brownie run deploy_mock_token --network [network name]``

To view the list of possible networks that can be used for the deployment and upgrade scripts, run the command:

``brownie networks list true``

To add a new network to the eth-brownie environment, run the command:

``brownie networks add [environment] [id] host=[host] chainid=[chainid] explorer=[explorer]``

View more information on eth-brownie network management here:
https://eth-brownie.readthedocs.io/en/stable/network-management.html
