// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PropertyRegistry.sol";
import "./FractionalNFT.sol";

contract Fractionalizer {
    PropertyRegistry public propertyRegistry;
    mapping(uint256 => address) public nftFractions;

    event NFTFractionalized(uint256 indexed propertyId, address indexed fractionContract);

    constructor(address _propertyRegistryAddress) {
        propertyRegistry = PropertyRegistry(_propertyRegistryAddress);
    }

    function fractionalizeNFT(uint256 _propertyId, string memory _name, string memory _symbol, uint256 _totalSupply) public {
        require(propertyRegistry.ownerOf(_propertyId) == msg.sender, "Only the owner of the NFT can fractionalize it.");

        FractionalNFT fractionalNFT = new FractionalNFT(_name, _symbol);
        fractionalNFT.mint(msg.sender, _totalSupply);

        nftFractions[_propertyId] = address(fractionalNFT);

        emit NFTFractionalized(_propertyId, address(fractionalNFT));
    }

    function getFractionalNFT(uint256 _propertyId) public view returns (address) {
        return nftFractions[_propertyId];
    }
}
