#!/usr/bin/python3
from brownie import (
    SongNFT,
    TrackPackNFT,
    config,
    network,
    Contract,
)
from scripts.deploy import deploy
from scripts.deploy_mock_token import deploy_mock_token
from scripts.helpers import get_account
from web3 import Web3

NUM_SONGS_PER_TRACK_PACK = 1
TRACK_PACK_TOKEN_URI = "Track Pack Token URI"
MAX_TRACK_PACK_NFTS = 20
TRACK_PACK_PRICE_IN_USDC = 100
KEY_HASH = "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15"

def deploy_contracts(unassignedSongTokenURI, vrfCoordinatorAddress, usdcAddress, numSongsPerTrackPack, trackPackTokenURI, maxTrackPackNFTs, trackPackPriceInUSDC):
    songNFT, trackPackNFT, mockCoordinator = deploy( 
        unassignedSongTokenURI=unassignedSongTokenURI,
        vrfCoordinatorAddress=vrfCoordinatorAddress, 
        usdcAddress=usdcAddress, 
        numSongsPerTrackPack=numSongsPerTrackPack,
        trackPackTokenURI=trackPackTokenURI,
        maxTrackPackNFTs=maxTrackPackNFTs,
        trackPackPriceInUSDC=trackPackPriceInUSDC,
        keyHash=KEY_HASH
    )

    return songNFT, trackPackNFT, mockCoordinator 

# Largest test here - more of an integration test than unit test
def test_user_can_claim_royalty_rewards():
    # Arrange
    account = get_account()
    account2 = get_account(2)

    # Deploys the NFT contracts.
    songNFT, trackPackNFT, mockCoordinator = deploy_contracts(
        "Unassigned Token URI", None, account2.address,
        NUM_SONGS_PER_TRACK_PACK, TRACK_PACK_TOKEN_URI,
        MAX_TRACK_PACK_NFTS, TRACK_PACK_PRICE_IN_USDC
    )

    # Act / Assert
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
        if i in [1, 2, 3, 4, 5]:
            # Burns the Track Pack NFT
            requestId = trackPackNFT.openTrackPackNFT(trackPackNFT.tokenOfOwnerByIndex(account2.address, 0), {"from": account2})

            if "return_value" in dir(requestId):
                requestId.wait(1)
                requestId = requestId.return_value

            fulfillRandomWordsTx = mockCoordinator.fulfillRandomWords(requestId, trackPackNFT.address, {"from": account})
            fulfillRandomWordsTx.wait(1)

        # Calling get_new_entries() removes new entries form the stack, storing new entries for processing
        new_events = event_filter.get_new_entries()
        for event in new_events:
            if event["event"] == "RequestFulfilled":
                numSongs = songNFT.numSongIds()
                owner = event["args"]["owner"]
                randomNumbers = event["args"]["randomWords"]
                tokenIds = event["args"]["tokenIds"]

                assert songNFT._tokenIds() == trackPackNFT.songsPerTrackPack() * i
                assert owner == account2.address
                assert len(randomNumbers) == 1
                assert len(tokenIds) == 1
                assert tokenIds[0] == i

        i += 1

    # Assert
    for i in range(songNFT.tokenIdsPerSongId(1)):
        assert songNFT.songIdToTokenIds(1, i) == i + 1

    # Act / Assert
    songId = 1
    depositValue = 1000
    songNFT.depositRewardsForSong(songId, {"from": account, "value": depositValue})
    
    assert songNFT.addressToFundsCanClaim(account2.address) == depositValue

    preClaimBalance = account2.balance()
    songNFT.claimSongRoyaltyRewards({"from": account2})

    assert account2.balance() == preClaimBalance + depositValue
    assert songNFT.addressToFundsCanClaim(account2.address) == 0
    assert songNFT.addressToFundsClaimed(account2.address) == depositValue
    assert songNFT.songIdToRoyaltyPerNFT(songId) == depositValue / 2

    songId = 1
    depositValue = 1000
    songNFT.depositRewardsForSongInChunks(songId, 0, 0, {"from": account, "value": depositValue / 2})
    songNFT.depositRewardsForSongInChunks(songId, 1, 10, {"from": account, "value": depositValue / 2})
    
    assert songNFT.addressToFundsCanClaim(account2.address) == depositValue

    preClaimBalance = account2.balance()
    songNFT.claimSongRoyaltyRewards({"from": account2})

    assert account2.balance() == preClaimBalance + depositValue
    assert songNFT.addressToFundsCanClaim(account2.address) == 0
    assert songNFT.addressToFundsClaimed(account2.address) == depositValue * 2
    assert songNFT.songIdToRoyaltyPerNFT(songId) == depositValue

    
def test_user_can_mint_trackpack():
    # Arrange
    account = get_account()
    account2 = get_account(2)

    # Deploys the NFT contracts and mock token for USDC.
    usdc = deploy_mock_token()
    songNFT, trackPackNFT, mockCoordinator = deploy_contracts(
        "Unassigned Token URI", None, usdc.address,
        NUM_SONGS_PER_TRACK_PACK, TRACK_PACK_TOKEN_URI,
        MAX_TRACK_PACK_NFTS, TRACK_PACK_PRICE_IN_USDC
    )

    # Transfers some USDC to account2
    numTrackPacksToMint = 5
    usdc.transfer(account2.address, TRACK_PACK_PRICE_IN_USDC * numTrackPacksToMint, {"from": account})

    # Act
    usdc.approve(trackPackNFT.address, TRACK_PACK_PRICE_IN_USDC * numTrackPacksToMint, {"from": account2})
    trackPackNFT.mintTrackPackNFT(numTrackPacksToMint, {"from": account2})

    # Assert
    assert trackPackNFT._tokenIds() == numTrackPacksToMint
    assert trackPackNFT.ownerOf(numTrackPacksToMint) == account2.address

    
def test_owner_can_withdraw_trackpack_funds():
    # Arrange
    account = get_account()
    account2 = get_account(2)

    # Deploys the NFT contracts and mock token for USDC.
    usdc = deploy_mock_token()
    songNFT, trackPackNFT, mockCoordinator = deploy_contracts(
        "Unassigned Token URI", None, usdc.address,
        NUM_SONGS_PER_TRACK_PACK, TRACK_PACK_TOKEN_URI,
        MAX_TRACK_PACK_NFTS, TRACK_PACK_PRICE_IN_USDC
    )

    # Transfers some USDC to account2
    numTrackPacksToMint = 5
    usdc.transfer(account2.address, TRACK_PACK_PRICE_IN_USDC * numTrackPacksToMint, {"from": account})

    # Act
    usdc.approve(trackPackNFT.address, TRACK_PACK_PRICE_IN_USDC * numTrackPacksToMint, {"from": account2})
    trackPackNFT.mintTrackPackNFT(numTrackPacksToMint, {"from": account2})
    preWithdrawBalance = usdc.balanceOf(account.address)
    trackPackNFT.withdrawTrackPackFunds({"from": account})

    # Assert
    assert usdc.balanceOf(account.address) == preWithdrawBalance + TRACK_PACK_PRICE_IN_USDC * numTrackPacksToMint

    
def test_user_can_mint_and_burn_track_pack():
    # Arrange
    account = get_account()
    account2 = get_account(2)

    # Deploys the NFT contracts and mock token for USDC.
    usdc = deploy_mock_token()
    songNFT, trackPackNFT, mockCoordinator = deploy_contracts(
        "Unassigned Token URI", None, usdc.address,
        NUM_SONGS_PER_TRACK_PACK, TRACK_PACK_TOKEN_URI,
        MAX_TRACK_PACK_NFTS, TRACK_PACK_PRICE_IN_USDC
    )

    # Transfers some USDC to account2
    numTrackPacksToMint = 5
    usdc.transfer(account2.address, TRACK_PACK_PRICE_IN_USDC * numTrackPacksToMint, {"from": account})

    # Act
    usdc.approve(trackPackNFT.address, TRACK_PACK_PRICE_IN_USDC * numTrackPacksToMint, {"from": account})
    usdc.approve(trackPackNFT.address, TRACK_PACK_PRICE_IN_USDC * numTrackPacksToMint, {"from": account2})
    trackPackNFT.mintTrackPackNFT(numTrackPacksToMint, {"from": account})
    trackPackNFT.mintTrackPackNFT(numTrackPacksToMint, {"from": account2})

    for acc in [account, account2]:
        for i in range(numTrackPacksToMint):
            # Burns the Track Pack NFT
            requestId = trackPackNFT.openTrackPackNFT(trackPackNFT.tokenOfOwnerByIndex(acc.address, 0), {"from": acc})

            if "return_value" in dir(requestId):
                requestId.wait(1)
                requestId = requestId.return_value

            fulfillRandomWordsTx = mockCoordinator.fulfillRandomWords(requestId, trackPackNFT.address, {"from": account})
            fulfillRandomWordsTx.wait(1)

    # Assert
    assert songNFT._tokenIds() == numTrackPacksToMint * 2

    for i in range(numTrackPacksToMint):
        assert songNFT.ownerOf(i + 1) == account.address

    for i in range(numTrackPacksToMint, numTrackPacksToMint * 2):
        assert songNFT.ownerOf(i + 1) == account2.address

    
def test_owner_can_add_songs():
    # Arrange
    account = get_account()
    account2 = get_account(2)

    # Deploys the NFT contracts and mock token for USDC.
    usdc = deploy_mock_token()
    songNFT, trackPackNFT, mockCoordinator = deploy_contracts(
        "Unassigned Token URI", None, usdc.address,
        NUM_SONGS_PER_TRACK_PACK, TRACK_PACK_TOKEN_URI,
        MAX_TRACK_PACK_NFTS, TRACK_PACK_PRICE_IN_USDC
    )

    # Act
    songIds = [4, 5, 10]
    for songId in songIds:
        songNFT.addSongId(songId, f"Song {songId}", {"from": account})

    # Assert
    assert songNFT.numSongIds() == len(songIds)

    for i in range(len(songIds)):
        assert songNFT.songIds(i) == songIds[i]

    
def test_owner_can_delete_songs():
    # Arrange
    account = get_account()
    account2 = get_account(2)

    # Deploys the NFT contracts and mock token for USDC.
    usdc = deploy_mock_token()
    songNFT, trackPackNFT, mockCoordinator = deploy_contracts(
        "Unassigned Token URI", None, usdc.address,
        NUM_SONGS_PER_TRACK_PACK, TRACK_PACK_TOKEN_URI,
        MAX_TRACK_PACK_NFTS, TRACK_PACK_PRICE_IN_USDC
    )

    # Act
    songIds = [4, 5, 10]
    for songId in songIds:
        songNFT.addSongId(songId, f"Song {songId}", {"from": account})

    songNFT.removeSongIdByIndex(1, {"from": account})

    # Assert
    assert songNFT.numSongIds() == len(songIds) - 1

    assert songNFT.songIds(0) == 4
    assert songNFT.songIds(1) == 10

    
def test_track_pack_can_assign_songs_to_nfts():
    # Arrange
    account = get_account()
    account2 = get_account(2)

    # Deploys the NFT contracts and mock token for USDC.
    usdc = deploy_mock_token()
    songNFT, trackPackNFT, mockCoordinator = deploy_contracts(
        "Unassigned Token URI", None, usdc.address,
        NUM_SONGS_PER_TRACK_PACK, TRACK_PACK_TOKEN_URI,
        MAX_TRACK_PACK_NFTS, TRACK_PACK_PRICE_IN_USDC
    )

    # Act
    songIds = [4, 5, 10]
    for songId in songIds:
        songNFT.addSongId(songId, f"Song {songId}", {"from": account})

    songNFT.grantRole(songNFT.TRACK_PACK_CONTRACT(), account.address, {"from": account})

    songNFT.createToken("Test Token", {"from": account})
    songNFT.createToken("Test Token", {"from": account})
    songNFT.createToken("Test Token", {"from": account})

    songNFT.assignTokenIdToSongId(1, 4, {"from": account})
    songNFT.assignTokenIdToSongId(2, 10, {"from": account})
    songNFT.assignTokenIdToSongId(3, 10, {"from": account})

    # Assert
    assert songNFT.tokenIdToSongId(1) == 4 
    assert songNFT.tokenIdToSongId(2) == 10
    assert songNFT.tokenIdToSongId(3) == 10

    assert songNFT.songIdToTokenIds(4, 0) == 1
    assert songNFT.songIdToTokenIds(10, 0) == 2
    assert songNFT.songIdToTokenIds(10, 1) == 3

    assert songNFT.tokenIdsPerSongId(4) == 1
    assert songNFT.tokenIdsPerSongId(10) == 2

    
def test_owner_can_remove_nfts_from_songs():
    # Arrange
    account = get_account()
    account2 = get_account(2)

    # Deploys the NFT contracts and mock token for USDC.
    usdc = deploy_mock_token()
    songNFT, trackPackNFT, mockCoordinator = deploy_contracts(
        "Unassigned Token URI", None, usdc.address,
        NUM_SONGS_PER_TRACK_PACK, TRACK_PACK_TOKEN_URI,
        MAX_TRACK_PACK_NFTS, TRACK_PACK_PRICE_IN_USDC
    )

    # Act
    songIds = [4, 5, 10]
    for songId in songIds:
        songNFT.addSongId(songId, f"Song {songId}", {"from": account})

    songNFT.grantRole(songNFT.TRACK_PACK_CONTRACT(), account.address, {"from": account})

    songNFT.createToken("Test Token", {"from": account})
    songNFT.createToken("Test Token", {"from": account})
    songNFT.createToken("Test Token", {"from": account})

    songNFT.assignTokenIdToSongId(1, 4, {"from": account})
    songNFT.assignTokenIdToSongId(2, 10, {"from": account})
    songNFT.assignTokenIdToSongId(3, 10, {"from": account})

    songNFT.removeTokenIdFromSongIdByIndex(0, 10, {"from": account})

    # Assert
    assert songNFT.tokenIdToSongId(1) == 4 
    assert songNFT.tokenIdToSongId(2) == 0
    assert songNFT.tokenIdToSongId(3) == 10

    assert songNFT.songIdToTokenIds(4, 0) == 1
    assert songNFT.songIdToTokenIds(10, 0) == 3

    assert songNFT.tokenIdsPerSongId(4) == 1
    assert songNFT.tokenIdsPerSongId(10) == 1