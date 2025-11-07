// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyRegistry is ERC721, Ownable {
    uint256 private _propertyCount;

    struct Property {
        uint256 id;
        string name;
        string partnershipAgreementUrl;
        string maintenanceAgreementUrl;
        string rentAgreementUrl;
        string imageUrl;
        bool isFractionalized;
    }

    mapping(uint256 => Property) private properties;

    event PropertyRegistered(uint256 indexed propertyId, string name, address indexed owner);
    event PropertyFractionalized(uint256 indexed propertyId, address fractionalContract);

    constructor() ERC721("RealEstateNFT", "RENT") Ownable(msg.sender) {}

    function registerProperty(
        string memory _name,
        address _owner,
        string memory _partnershipAgreementUrl,
        string memory _maintenanceAgreementUrl,
        string memory _rentAgreementUrl,
        string memory _imageUrl
    ) external onlyOwner {
        require(bytes(_name).length > 0, "Name required");
        require(_owner != address(0), "Invalid owner");

        _propertyCount++;
        uint256 newId = _propertyCount;

        _safeMint(_owner, newId);
        properties[newId] = Property({
            id: newId,
            name: _name,
            partnershipAgreementUrl: _partnershipAgreementUrl,
            maintenanceAgreementUrl: _maintenanceAgreementUrl,
            rentAgreementUrl: _rentAgreementUrl,
            imageUrl: _imageUrl,
            isFractionalized: false
        });

        emit PropertyRegistered(newId, _name, _owner);
    }

    function getProperty(uint256 _id)
        external
        view
        returns (Property memory)
    {
        // ✅ FIX: use ownerOf() instead of _exists()
        require(ownerOf(_id) != address(0), "Property not found");
        return properties[_id];
    }

    function propertyCount() external view returns (uint256) {
        return _propertyCount;
    }

    function markFractionalized(uint256 _propertyId, address _fractionalContract) external onlyOwner {
        // ✅ FIX: use ownerOf() instead of _exists()
        require(ownerOf(_propertyId) != address(0), "Invalid property ID");
        properties[_propertyId].isFractionalized = true;
        emit PropertyFractionalized(_propertyId, _fractionalContract);
    }
}
