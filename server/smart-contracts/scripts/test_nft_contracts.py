#!/usr/bin/python3
from brownie import (
    SongNFT,
    TrackPackNFT,
    config,
    network,
    Contract,
)
from scripts.deploy import deploy
from scripts.helpers import get_account
from web3 import Web3

NUM_SONGS_PER_TRACK_PACK = 1
TRACK_PACK_TOKEN_URI = "Track Pack Token URI"
MAX_TRACK_PACK_NFTS = 20
TRACK_PACK_PRICE_IN_USDC = 100

def test_nft_contracts():
    account = get_account()
    account2 = get_account(2)

    print(f"Deploying to {network.show_active()}")

    # Deploys the NFT contracts.
    songNFT, trackPackNFT, mockCoordinator = deploy( 
        unassignedSongTokenURI="Unassigned Token URI",
        vrfCoordinatorAddress=None, 
        usdcAddress=account2.address, 
        numSongsPerTrackPack=NUM_SONGS_PER_TRACK_PACK,
        trackPackTokenURI=TRACK_PACK_TOKEN_URI,
        maxTrackPackNFTs=MAX_TRACK_PACK_NFTS,
        trackPackPriceInUSDC=TRACK_PACK_PRICE_IN_USDC
    )

    for i in range(5):
        trackPackNFT.createToken(f"Track Pack NFT {i}", {"from": account})
        trackPackNFT.transferFrom(account.address, account2.address, trackPackNFT.tokenOfOwnerByIndex(account.address, 0), {"from": account})
        songNFT.addSongId(i + 1, f"Song NFT {i + 1}", {"from": account})

    web3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
    web3_contract = web3.eth.contract(address=trackPackNFT.address,
                                    abi=TrackPackNFT.abi)
    event_filter = web3_contract.events["RequestFulfilled"].createFilter(fromBlock='latest')   

    i = 0
    while i < 1000:
        if i in [2, 10, 20, 50, 100]:
            # Burns the Track Pack NFT
            '''
            try:
                requestId = trackPackNFT.openTrackPackNFT(trackPackNFT.tokenOfOwnerByIndex(account2.address, 0), {"from": account2})
            except:
                i += 1 
                continue
            '''

            requestId = trackPackNFT.openTrackPackNFT(trackPackNFT.tokenOfOwnerByIndex(account2.address, 0), {"from": account2})

            if "return_value" in dir(requestId):
                requestId.wait(1)
                requestId = requestId.return_value

            fulfillRandomWordsTx = mockCoordinator.fulfillRandomWords(requestId, trackPackNFT.address, {"from": account})
            print(fulfillRandomWordsTx.events)
            fulfillRandomWordsTx.wait(1)

        # Calling get_new_entries() removes  new entries form the stack, storing new entries for processing
        new_events = event_filter.get_new_entries()
        for event in new_events:
            if event["event"] == "RequestFulfilled":
                numSongs = songNFT.numSongIds()
                owner = event["args"]["owner"]
                randomNumbers = event["args"]["randomWords"]
                tokenIds = event["args"]["tokenIds"]

                '''
                for i in range(len(tokenIds)):
                    tokenId = tokenIds[i]
                    if songNFT.tokenURI(tokenId) == "":
                        ### Set the mapping in the song contract for song ID to token ID ###
                        randomNumber = randomNumbers[i] % numSongs if randomNumbers[i] >= numSongs else randomNumbers[i]
                        songNFT.assignTokenIdToSongId(tokenId, randomNumber, {"from": account})

                        print(f"Assigned token ID {tokenId} to random number: {randomNumber}")

                        ### Flip token URI in Pinata here and assign to NFT ###
                        songNFT.setTokenURI(tokenId, f"{songNFT.baseTokenURI()}{tokenId}", {"from": account})
                '''

                print("Track Pack NFT Burnt")

        i += 1

    for i in range(songNFT.tokenIdsPerSongId(1)):
        print(songNFT.songIdToTokenIds(1, i))

    print(f"Song NFT 1 token URI is: {songNFT.tokenURI(1)}")

def main():
    test_nft_contracts()