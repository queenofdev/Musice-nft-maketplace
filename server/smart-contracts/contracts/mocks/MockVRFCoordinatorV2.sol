// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol";

/**
 * @title Mock VRF Coordinator V2 for testing the TrackPackNFT and SongNFT contracts.
 * @dev Testing not needed, this is used entirely to test the other contracts and isn't deployed to production.
 */
contract MockVRFCoordinatorV2 is VRFCoordinatorV2Mock {
    constructor(uint96 _baseFee, uint96 _gasPriceLink) VRFCoordinatorV2Mock(_baseFee, _gasPriceLink) {}
}