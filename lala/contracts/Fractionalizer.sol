// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PropertyRegistry.sol";
import "./FractionalNFT.sol";

/**
 * Handles fractionalization of NFTs into ERC20 share tokens.
 */
contract Fractionalizer {
    PropertyRegistry public propertyRegistry;
    mapping(uint256 => address) public fractionalContracts;

    event NFTFractionalized(uint256 indexed propertyId, address indexed fractionalToken);

    constructor(address _propertyRegistryAddress) {
        propertyRegistry = PropertyRegistry(_propertyRegistryAddress);
    }

    function fractionalizeNFT(
        uint256 _propertyId,
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _totalShares
    ) external {
        require(propertyRegistry.ownerOf(_propertyId) == msg.sender, "Not the property owner");
        require(fractionalContracts[_propertyId] == address(0), "Already fractionalized");

        // Deploy new ERC20 token for the property
        FractionalNFT fractionalToken = new FractionalNFT(_tokenName, _tokenSymbol, _totalShares, msg.sender);

        // Mint all shares to the owner initially
        fractionalToken.mint(msg.sender, _totalShares);

        // Save reference
        fractionalContracts[_propertyId] = address(fractionalToken);

        emit NFTFractionalized(_propertyId, address(fractionalToken));
    }

    function getFractionalContract(uint256 _propertyId) external view returns (address) {
        return fractionalContracts[_propertyId];
    }
}
