// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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
    }

    mapping(uint256 => Property) private properties;

    event PropertyRegistered(uint256 indexed propertyId, string name, address indexed owner);

    constructor() ERC721("RealEstateNFT", "RENT") Ownable(msg.sender) {}

    function registerProperty(
        string memory _name,
        address _owner,
        string memory _partnershipAgreementUrl,
        string memory _maintenanceAgreementUrl,
        string memory _rentAgreementUrl,
        string memory _imageUrl
    ) public onlyOwner {
        require(bytes(_name).length > 0, "Name required");
        require(_owner != address(0), "Owner cannot be zero address");

        _propertyCount++;
        uint256 newItemId = _propertyCount;
        _mint(_owner, newItemId);

        properties[newItemId] = Property({
            id: newItemId,
            name: _name,
            partnershipAgreementUrl: _partnershipAgreementUrl,
            maintenanceAgreementUrl: _maintenanceAgreementUrl,
            rentAgreementUrl: _rentAgreementUrl,
            imageUrl: _imageUrl
        });

        emit PropertyRegistered(newItemId, _name, _owner);
    }

    function getProperty(uint256 _propertyId)
        public
        view
        returns (
            uint256 id,
            string memory name,
            string memory partnershipAgreementUrl,
            string memory maintenanceAgreementUrl,
            string memory rentAgreementUrl,
            string memory imageUrl
        )
    {
        require(ownerOf(_propertyId) != address(0), "Property does not exist");
        Property storage prop = properties[_propertyId];
        return (
            prop.id,
            prop.name,
            prop.partnershipAgreementUrl,
            prop.maintenanceAgreementUrl,
            prop.rentAgreementUrl,
            prop.imageUrl
        );
    }

    function propertyCount() public view returns (uint256) {
        return _propertyCount;
    }
}