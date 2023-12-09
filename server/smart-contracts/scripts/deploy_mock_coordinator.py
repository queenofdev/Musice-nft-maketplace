#!/usr/bin/python3
from brownie import (
    MockVRFCoordinatorV2,
    config,
    network,
    Contract,
)
from scripts.helpers import get_account

BASE_FEE = 0
GAS_FEE_IN_LINK = 0

def deploy_mock_coordinator():
    account = get_account()

    print(f"Deploying to {network.show_active()}")

    # Deploys the song NFT contract.
    mockCoordinator = MockVRFCoordinatorV2.deploy(BASE_FEE, GAS_FEE_IN_LINK, {"from": account}, publish_source=False)

    return mockCoordinator

def main():
    deploy_mock_coordinator()