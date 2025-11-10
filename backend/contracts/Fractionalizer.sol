// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PropertyRegistry.sol";
import "./FractionalNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * Handles fractionalization of NFTs into ERC20 share tokens.
 */
contract Fractionalizer is Ownable, IERC721Receiver {
    PropertyRegistry public propertyRegistry;
    mapping(uint256 => address) public fractionalContracts;

    event NFTFractionalized(uint256 indexed propertyId, address indexed fractionalToken);

    constructor() Ownable(msg.sender) {
    }

    function setPropertyRegistryAddress(address _propertyRegistryAddress) external onlyOwner {
        require(address(propertyRegistry) == address(0), "PropertyRegistry address already set");
        propertyRegistry = PropertyRegistry(_propertyRegistryAddress);
    }

    modifier onlyPropertyRegistry() {
        require(msg.sender == address(propertyRegistry), "Only PropertyRegistry contract can call this function");
        _;
    }

    function fractionalizeNFT(
        uint256 _propertyId,
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _totalShares
    ) external onlyPropertyRegistry {
        require(fractionalContracts[_propertyId] == address(0), "Already fractionalized");

        // Get property owners and their percentages
        (address[] memory owners, uint256[] memory percentages) = propertyRegistry.getPropertyOwners(_propertyId);
        require(owners.length > 0, "No owners defined");

        // Deploy new ERC20 token - mint all to this contract first
        FractionalNFT fractionalToken = new FractionalNFT(_tokenName, _tokenSymbol, _totalShares, address(this));

        // Distribute tokens to each owner based on their percentage
        for (uint256 i = 0; i < owners.length; i++) {
            uint256 ownerShares = (_totalShares * percentages[i]) / 10000; // percentages in basis points
            require(fractionalToken.transfer(owners[i], ownerShares), "Token transfer failed");
        }

        // Save reference
        fractionalContracts[_propertyId] = address(fractionalToken);

        emit NFTFractionalized(_propertyId, address(fractionalToken));
    }

    function getFractionalContract(uint256 _propertyId) external view returns (address) {
        return fractionalContracts[_propertyId];
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        // This contract is designed to receive ERC721 tokens (Property NFTs)
        // We simply accept the token and return its selector
        return IERC721Receiver.onERC721Received.selector;
    }
}