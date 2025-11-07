// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PropertyRegistry {
    struct Owner {
        address wallet;
        uint256 percentage;
    }

    struct Property {
        uint256 id;
        string name;
        Owner[] owners;
    }

    mapping(uint256 => Property) public properties;
    uint256 public propertyCount;

    function registerProperty(
        string memory _name,
        address[] memory _owners,
        uint256[] memory _shares
    ) public {
        require(_owners.length == _shares.length, "Owners and shares mismatch");
        propertyCount++;
        Property storage newProp = properties[propertyCount];
        newProp.id = propertyCount;
        newProp.name = _name;
        uint256 total = 0;
        for (uint i = 0; i < _owners.length; i++) {
            newProp.owners.push(Owner(_owners[i], _shares[i]));
            total += _shares[i];
        }
        require(total == 100, "Total share must be 100%");
    }
}
