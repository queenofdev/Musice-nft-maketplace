#!/usr/bin/python3
from brownie import TrackPackNFT, SongNFT, config, network, Contract
from scripts.deploy_mock_coordinator import deploy_mock_coordinator
from scripts.helpers import get_account, LOCAL_BLOCKCHAIN_ENVIRONMENTS, VERIFY_NETWORKS
import json
import sys

NUM_SONGS_PER_TRACK_PACK = 1

# Chainlink VRF V2 Coordinator address on Goerli Testnet: 0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D
# Keyhash for the Goerli testnet: 0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15
# brownie run scripts/deploy.py deploy --network goerli unassignedSongTokenURI=UnassignedTokenURI vrfCoordinatorAddress=0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D usdcAddress=0x7d3D15c8BC53f374066e37035C5E58CEB44bFa24 trackPackTokenURI=TrackPackTokenURI maxTrackPackNFTs=100 trackPackPriceInUSDC=1000000 numSongsPerTrackPack=3 keyHash=0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15


def deploy(
    unassignedSongTokenURI=None,
    vrfCoordinatorAddress=None,
    usdcAddress=None,
    trackPackTokenURI=None,
    maxTrackPackNFTs=None,
    trackPackPriceInUSDC=None,
    numSongsPerTrackPack=None,
    keyHash=None,
    vrfSubscriptionId=None,
):
    account = get_account()
    account2 = get_account(2)

    print(f"Deploying to {network.show_active()}")

    for arg in sys.argv:
        if "unassignedSongTokenURI=" in arg:
            unassignedSongTokenURI = arg.split("=")[1]
        if "vrfCoordinatorAddress=" in arg:
            vrfCoordinatorAddress = arg.split("=")[1]
        if "usdcAddress=" in arg:
            usdcAddress = arg.split("=")[1]
        if "trackPackTokenURI=" in arg:
            trackPackTokenURI = arg.split("=")[1]
        if "maxTrackPackNFTs=" in arg:
            maxTrackPackNFTs = int(arg.split("=")[1])
        if "trackPackPriceInUSDC=" in arg:
            trackPackPriceInUSDC = int(arg.split("=")[1])
        if "numSongsPerTrackPack=" in arg:
            numSongsPerTrackPack = int(arg.split("=")[1])
        if "keyHash=" in arg:
            keyHash = arg.split("=")[1]
        if "vrfSubscriptionId=" in arg:
            vrfSubscriptionId = arg.split("=")[1]

    if not unassignedSongTokenURI:
        print("Unassigned snog token URI is required!")
        return

    if not usdcAddress:
        print("USDC address is required!")
        return

    if not trackPackTokenURI:
        print("TrackPack TokenURI is required!")
        return

    if not maxTrackPackNFTs:
        print("Maximum number of Track Packs is required!")
        return

    if not trackPackPriceInUSDC:
        print("Track Pack price in USDC is required!")
        return

    if not keyHash:
        print("keyHash is required!")
        return

    if not numSongsPerTrackPack:
        numSongsPerTrackPack = NUM_SONGS_PER_TRACK_PACK

    # Deploys the song NFT contract.
    songNFT = SongNFT.deploy(
        unassignedSongTokenURI,
        {"from": account},
        publish_source=network.show_active() in VERIFY_NETWORKS,
    )

    # Deploys the mock coordinator if testing
    coordinator = None
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        coordinator = deploy_mock_coordinator()
    else:
        if not vrfCoordinatorAddress:
            print("VRF Coordinator address is required!")
            return

        with open("abis/VRFCoordinatorV2.json", "r") as coordinatorABIFile:
            coordinatorJson = json.load(coordinatorABIFile)

        coordinator = Contract.from_abi(
            "VRFCoordinator", vrfCoordinatorAddress, coordinatorJson["abi"]
        )

    if not vrfSubscriptionId:
        vrfSubscriptionId = coordinator.createSubscription.call({"from": account})
        vrfSubscriptionIdTx = coordinator.createSubscription({"from": account})
        vrfSubscriptionIdTx.wait(1)

        # if "return_value" in dir(vrfSubscriptionId):
        #     vrfSubscriptionId.wait(1)
        #     vrfSubscriptionId = vrfSubscriptionId.return_value

    print(f"VRF Subscription ID is: {vrfSubscriptionId}")

    # Deploys the mock NFT contract for the Track Pack.
    trackPackNFT = TrackPackNFT.deploy(
        songNFT.address,
        numSongsPerTrackPack,
        usdcAddress,
        coordinator.address,
        keyHash,
        vrfSubscriptionId,
        trackPackTokenURI,
        maxTrackPackNFTs,
        trackPackPriceInUSDC,
        {"from": account},
        publish_source=network.show_active() in VERIFY_NETWORKS,
    )

    # Gives the TRACK_PACK_CONTRACT role to the mock NFT contract.
    songNFT.grantRole(
        songNFT.TRACK_PACK_CONTRACT(), trackPackNFT.address, {"from": account}
    )
    # Adds the Track Pack NFT contract as a consumer of the VRF for the created subscription ID
    coordinator.addConsumer(vrfSubscriptionId, trackPackNFT.address, {"from": account})
    coordinator.addConsumer(vrfSubscriptionId, account.address, {"from": account})

    return songNFT, trackPackNFT, coordinator


def main():
    deploy()
