// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Song NFT Contract
 * @dev NFT contract for the songs
 */
contract SongNFT is ERC721URIStorage, ERC721Enumerable, AccessControl {
    using Counters for Counters.Counter;

    // Counter to give each NFT a unique ID.
    Counters.Counter public _tokenIds;

    // Role for the track pack contract for minting a song NFT before a token URI flip.
    bytes32 public constant TRACK_PACK_CONTRACT = keccak256("TRACK_PACK_CONTRACT");

    // Mapping to determine number of token IDs per song ID
    mapping(uint256 => uint256) public tokenIdsPerSongId;

    // Mapping of song ID to token IDs
    mapping(uint256 => uint256[]) public songIdToTokenIds;

    // Mapping of token ID to song ID
    mapping(uint256 => uint256) public tokenIdToSongId;

    // Mapping of song ID to token URI
    mapping(uint256 => string) public songIdToTokenURI;

    // Mapping to determine the per NFT royalties accrued for each song.
    mapping(uint256 => uint256) public songIdToRoyaltyPerNFT;

    // Mapping to determine how much each user can claim based on song rewards
    mapping(address => uint256) public addressToFundsCanClaim;

    // Mapping to determine how much each user has claimed
    mapping(address => uint256) public addressToFundsClaimed;

    // Array of song IDs
    uint256[] public songIds;

    // Number of song IDs;
    uint256 public numSongIds;

    // Unassigned token URI for song NFTs that have just been minted and aren't assigned a song yet.
    string public unassignedTokenURI;

    event tokenURIUpdated(uint256 indexed tokenId, string newTokenURI);
    event tokenIdAssignedToSongId(uint256 indexed tokenId, uint256 indexed songId);
    event tokenIdUnassignedFromSongId(uint256 indexed tokenId, uint256 indexed songId);
    event songAdded(uint256 indexed songId);
    event songRemoved(uint256 indexed songId);
    event songRewardsClaimed(address indexed claimer, uint256 amount);
    event rewardsDeposited(uint256 indexed songId, uint256 rewardAmount);
    event rewardsDepositedChunk(uint256 indexed songId, uint256 rewardAmount, uint256 startIndex, uint256 endIndex);

    constructor(string memory _unassignedTokenURI) ERC721("SongNFT", "SNG") {
        unassignedTokenURI = _unassignedTokenURI;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
    * @dev Helper function to mint a new NFT.
    * @param newTokenURI the token URI on IPFS for the NFT metadata
    * @return the ID of the newly minted NFT
    */
    function _createToken(string memory newTokenURI, address receiver) private returns (uint) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(receiver, newItemId);
        _setTokenURI(newItemId, newTokenURI);
        _approve(address(this), newItemId);

        return newItemId;
    }    

    /**
    * @dev Only owner function to mint a new NFT.
    * @param newTokenURI the token URI on IPFS for the NFT metadata
    * @return the ID of the newly minted NFT
     */
    function createToken(string memory newTokenURI) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint) {
        return _createToken(newTokenURI, msg.sender);
    }

    /**
    * @dev Function for track pack contract to mint NFT after track pack burn
    * @param receiver the receiver of the new NFT
    * @return the ID of the newly minted NFT
     */
    function createTokenAfterTrackPackBurn(address receiver) external onlyRole(TRACK_PACK_CONTRACT) returns (uint) {
        return _createToken(unassignedTokenURI, receiver);
    }

    /**
    * @dev Only owner function to add a song ID to the contract.
    * @param songId the new song ID
    * @param songTokenURI the token URI of the song
    */
    function addSongId(uint256 songId, string memory songTokenURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        songIds.push(songId);
        numSongIds = numSongIds + 1;
        songIdToTokenURI[songId] = songTokenURI;
        emit songAdded(songId);
    }

    /**
    * @dev Only owner function to remove a song ID from the contract.
    * @param songIdIndex the index into the song ID array for the song ID to remove
    */
    function removeSongIdByIndex(uint256 songIdIndex) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(songIdIndex < numSongIds, "Invalid song ID index.");
        uint256 songId = songIds[songIdIndex];
        songIds[songIdIndex] = songIds[songIds.length-1];
        songIds.pop();
        tokenIdsPerSongId[songId] = 0;
        numSongIds = numSongIds - 1;
        emit songRemoved(songId);
    }

    /**
    * @dev Only owner function to assign a tokenId to a song ID
    * @param tokenId the ID of the token to assign a song ID to
    * @param songId the song ID to tie to the token ID
    */
    function assignTokenIdToSongId(uint256 tokenId, uint256 songId) external onlyRole(TRACK_PACK_CONTRACT) {
        require(tokenId <= _tokenIds.current(), "Token ID doesn't exist yet.");
        tokenIdToSongId[tokenId] = songId;
        songIdToTokenIds[songId].push(tokenId);
        tokenIdsPerSongId[songId] = tokenIdsPerSongId[songId] + 1;
        emit tokenIdAssignedToSongId(tokenId, songId);
    }

    /**
    * @dev Only owner function to remove a token ID from a song ID.
    * @param tokenIdIndex the index of the token ID that is being removed from the song ID
    * @param songId the song ID that the token ID is being removed from
    */
    function removeTokenIdFromSongIdByIndex(uint256 tokenIdIndex, uint256 songId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 tokenId = songIdToTokenIds[songId][tokenIdIndex];
        tokenIdToSongId[tokenId] = 0;
        songIdToTokenIds[songId][tokenIdIndex] = songIdToTokenIds[songId][songIdToTokenIds[songId].length-1];
        songIdToTokenIds[songId].pop();
        tokenIdsPerSongId[songId] = tokenIdsPerSongId[songId] - 1;
        emit tokenIdUnassignedFromSongId(tokenId, songId);
    }    

    /**
    * @dev Setter function for the token URI of an NFT.
    * @param tokenId the ID of the NFT to update the token URI of
    * @param newTokenURI the token URI to update the NFT with
     */
    function setTokenURI(uint256 tokenId, string memory newTokenURI) external onlyRole(TRACK_PACK_CONTRACT) {
        _setTokenURI(tokenId, newTokenURI);
        emit tokenURIUpdated(tokenId, newTokenURI);
    }

    /**
    @dev Function for NFT holders to claim their song royalty rewards.
    */
    function claimSongRoyaltyRewards() external {
        require(addressToFundsCanClaim[msg.sender] > 0, "You don't have any song royalty rewards to claim! If you have an NFT for one of these songs, please wait until the next reward deposit.");
        
        uint256 claimAmount = addressToFundsCanClaim[msg.sender];
        addressToFundsCanClaim[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: claimAmount}("");
        require(success, "Failed to send funds");

        emit songRewardsClaimed(msg.sender, claimAmount);

        addressToFundsClaimed[msg.sender] = addressToFundsClaimed[msg.sender] + claimAmount;
    }    

    /**
    * @dev Function to deposit rewards for a single song.
    * @param songId the ID of the song the deposit is for
    */
    function depositRewardsForSong(uint256 songId) external payable {
        uint256 tokensForSong = tokenIdsPerSongId[songId];
        require(msg.value >= tokensForSong, "You must deposit enough funds so it can be divided by the number of NFT holders for this song.");
        require(tokensForSong > 0, "No NFTs are assigned to this song ID.");

        for (uint i = 0; i < tokensForSong; i++) {
            address NFTOwner = ownerOf(songIdToTokenIds[songId][i]);
            addressToFundsCanClaim[NFTOwner] = addressToFundsCanClaim[NFTOwner] + (msg.value / tokensForSong);
        }

        songIdToRoyaltyPerNFT[songId] = songIdToRoyaltyPerNFT[songId] + msg.value / tokensForSong;

        emit rewardsDeposited(songId, msg.value);
    }

    /**
    * @dev Function to deposit rewards for a single song in chunks to avoid running out of gas.
    * @param songId the ID of the song the deposit is for
    * @param startIndex the first index to deposit rewards for with this chunk
    * @param endIndex the last index to deposit rewards for with this chunk
    */
    function depositRewardsForSongInChunks(uint256 songId, uint256 startIndex, uint256 endIndex) external payable {
        uint256 tokensForSong = tokenIdsPerSongId[songId];
        if (endIndex > tokensForSong) {
            endIndex = tokensForSong - 1;
        }
        require(endIndex >= startIndex, "endIndex must be greater or equal to than startIndex");
        uint256 numNFTs = endIndex - startIndex + 1;

        require(msg.value >= tokensForSong, "You must deposit enough funds so it can be divided by the number of NFT holders for this song.");
        require(tokensForSong > 0, "No NFTs are assigned to this song ID.");

        for (uint i = startIndex; i <= endIndex; i++) {
            address NFTOwner = ownerOf(songIdToTokenIds[songId][i]);
            addressToFundsCanClaim[NFTOwner] = addressToFundsCanClaim[NFTOwner] + (msg.value / numNFTs);
        }

        songIdToRoyaltyPerNFT[songId] = songIdToRoyaltyPerNFT[songId] + msg.value / tokensForSong;

        emit rewardsDepositedChunk(songId, msg.value, startIndex, endIndex);
    }    

    /**
    * @dev Function to get all token URIs for tokens that a given user owns.
    * @param userAddress the user's address to get token URIs of
    * @return list of token URIs for a user's NFTs
     */
    function getUserTokenURIs(address userAddress) external view returns (string[] memory) {
        uint256 userTokenCount = balanceOf(userAddress);
        uint256 currTokenId = 0;
        string[] memory userNFTTokenURIs = new string[](userTokenCount);

        for (uint256 i; i < userTokenCount; i++) {
            currTokenId = tokenOfOwnerByIndex(userAddress, i);
            userNFTTokenURIs[i] = tokenURI(currTokenId);
        }

        return userNFTTokenURIs;
    }

    /**
    * @dev Function to get all token IDs for tokens that a given user owns.
    * @param userAddress the user's address to get token IDs of
    * @return list of token IDs for a user's NFTs
     */
    function getUserTokenIDs(address userAddress) external view returns (uint256[] memory) {
        uint256 userTokenCount = balanceOf(userAddress);
        uint256[] memory userNFTTokenIDs = new uint256[](userTokenCount);

        for (uint256 i; i < userTokenCount; i++) {
            userNFTTokenIDs[i] = tokenOfOwnerByIndex(userAddress, i);
        }

        return userNFTTokenIDs;
    }    

    /**
    * @dev Function to get all song IDs for tokens that a given user owns.
    * @param userAddress the user's address to get song IDs of
    * @return list of song IDs for a user's NFTs
     */
    function getUserSongIDs(address userAddress) external view returns (uint256[] memory) {
        uint256 userTokenCount = balanceOf(userAddress);
        uint256[] memory userSongIDs = new uint256[](userTokenCount);

        for (uint256 i; i < userTokenCount; i++) {
            userSongIDs[i] = tokenIdToSongId[tokenOfOwnerByIndex(userAddress, i)];
        }

        return userSongIDs;
    }    

    /**
    * @dev Only owner function to update the token URI for a song
    * @param songId the song ID to update the token URI of
    * @param newSongTokenURI the new base token URI
    */
    function updateSongTokenURI(uint256 songId, string memory newSongTokenURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        songIdToTokenURI[songId] = newSongTokenURI;
    }

    /**
    * @dev Only owner function to update the token URI given to songs NFTs before they are assigned a song
    * @param newUnassignedTokenURI the new unassigned token URI
    */
    function updateUnassignedTokenURI(string memory newUnassignedTokenURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        unassignedTokenURI = newUnassignedTokenURI;
    }

    // Override function since both ERC721URIStorage and ERC721Enumerable inherit from ERC721 and so both have a definition for _burn.
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    // Override function since both ERC721URIStorage and ERC721Enumerable inherit from ERC721 and so both have a definition for _beforeTokenTransfer.
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // Override function since both ERC721URIStorage and ERC721Enumerable inherit from ERC721 and so both have a definition for supportsInterface.
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Override function since both ERC721URIStorage and ERC721Enumerable inherit from ERC721 and so both have a definition for tokenURI.
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }    
}