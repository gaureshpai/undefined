// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title PropertyRegistry
/// @notice Simple registry to store properties and ownership shares, with functions to register properties,
///         transfer partial shares, and transfer full ownership.
/// @dev This is a basic example. For production, consider access control, upgradeability, and gas optimizations.
contract PropertyRegistry {
    struct Owner {
        address wallet;
        uint256 percentage; // expressed in whole percents (0..100)
    }

    struct Property {
        uint256 id;
        string name;
        Owner[] owners;
        bool exists;
        string partnershipAgreementUrl;
        string maintenanceAgreementUrl;
        string rentAgreementUrl;
        string imageUrl;
    }

    mapping(uint256 => Property) private properties;
    uint256 public propertyCount;

    /* ========== EVENTS ========== */
    event PropertyRegistered(uint256 indexed propertyId, string name);
    event ShareTransferred(uint256 indexed propertyId, address indexed from, address indexed to, uint256 percent);
    event PropertyFullyTransferred(uint256 indexed propertyId, address indexed from, address indexed to);

    /* ========== MODIFIERS ========== */

    modifier propertyExists(uint256 _propertyId) {
        require(properties[_propertyId].exists, "Property does not exist");
        _;
    }

    modifier onlyOwnerOf(uint256 _propertyId) {
        (bool ok, ) = _findOwnerIndex(_propertyId, msg.sender);
        require(ok, "Caller is not an owner of the property");
        _;
    }

    /* ========== PUBLIC / EXTERNAL FUNCTIONS ========== */

    /// @notice Register a new property with owners and their shares (shares must sum to 100).
    /// @param _name Human-readable name for the property.
    /// @param _owners Array of owner addresses.
    /// @param _shares Array of corresponding share percentages (whole numbers). Must sum to 100.
    /// @param _partnershipAgreementUrl URL for the partnership agreement.
    /// @param _maintenanceAgreementUrl URL for the maintenance agreement.
    /// @param _rentAgreementUrl URL for the rent agreement.
    /// @param _imageUrl URL for an image of the property.
    function registerProperty(
        string memory _name,
        address[] memory _owners,
        uint256[] memory _shares,
        string memory _partnershipAgreementUrl,
        string memory _maintenanceAgreementUrl,
        string memory _rentAgreementUrl,
        string memory _imageUrl
    ) public {
        require(bytes(_name).length > 0, "Name required");
        require(_owners.length == _shares.length, "Owners and shares mismatch");
        require(_owners.length > 0, "At least one owner required");

        uint256 total = 0;
        for (uint256 i = 0; i < _owners.length; i++) {
            require(_owners[i] != address(0), "Owner cannot be zero address");
            total += _shares[i];
        }
        require(total == 100, "Total share must be 100");

        propertyCount++;
        Property storage prop = properties[propertyCount];
        prop.id = propertyCount;
        prop.name = _name;
        prop.exists = true;
        prop.partnershipAgreementUrl = _partnershipAgreementUrl;
        prop.maintenanceAgreementUrl = _maintenanceAgreementUrl;
        prop.rentAgreementUrl = _rentAgreementUrl;
        prop.imageUrl = _imageUrl;

        // push owners
        for (uint256 i = 0; i < _owners.length; i++) {
            prop.owners.push(Owner({wallet: _owners[i], percentage: _shares[i]}));
        }

        emit PropertyRegistered(propertyCount, _name);
    }

    /// @notice Transfer a part of caller's share to another address.
    /// @param _propertyId The property identifier.
    /// @param _to Recipient address.
    /// @param _percent Percentage to transfer (whole number > 0).
    function transferShare(
        uint256 _propertyId,
        address _to,
        uint256 _percent
    ) public propertyExists(_propertyId) onlyOwnerOf(_propertyId) {
        require(_to != address(0), "Recipient cannot be zero address");
        require(_to != msg.sender, "Cannot transfer to self");
        require(_percent > 0 && _percent <= 100, "Invalid percent");

        Property storage prop = properties[_propertyId];

        // find index of sender
        (bool foundFrom, uint256 idxFrom) = _findOwnerIndex(_propertyId, msg.sender);
        require(foundFrom, "Sender not found as owner");

        Owner storage fromOwner = prop.owners[idxFrom];
        require(fromOwner.percentage >= _percent, "Not enough share to transfer");

        // decrement sender share
        fromOwner.percentage -= _percent;

        // add or increment recipient
        (bool foundTo, uint256 idxTo) = _findOwnerIndex(_propertyId, _to);
        if (foundTo) {
            prop.owners[idxTo].percentage += _percent;
        } else {
            prop.owners.push(Owner({wallet: _to, percentage: _percent}));
        }

        // if sender share becomes 0, remove them from owners array
        if (fromOwner.percentage == 0) {
            _removeOwnerAtIndex(_propertyId, idxFrom);
        }

        emit ShareTransferred(_propertyId, msg.sender, _to, _percent);
    }

    /// @notice Transfer full ownership (100%) from caller to another single address.
    /// @dev Caller must hold 100% to do a full transfer.
    /// @param _propertyId The property identifier.
    /// @param _to New owner address that will receive 100%.
    function transferFullOwnership(uint256 _propertyId, address _to) public propertyExists(_propertyId) onlyOwnerOf(_propertyId) {
        require(_to != address(0), "Recipient cannot be zero address");
        require(_to != msg.sender, "Cannot transfer to self");

        Property storage prop = properties[_propertyId];

        // ensure caller has 100%
        (bool found, uint256 idx) = _findOwnerIndex(_propertyId, msg.sender);
        require(found, "Caller not owner");
        require(prop.owners[idx].percentage == 100, "Caller must hold 100% to fully transfer");

        // reset owners array to single new owner with 100%
        delete prop.owners;
        prop.owners.push(Owner({wallet: _to, percentage: 100}));

        emit PropertyFullyTransferred(_propertyId, msg.sender, _to);
    }

    /// @notice Get owners (addresses and shares) for a property.
    /// @param _propertyId The property identifier.
    /// @return ownerAddresses Array of owner addresses.
    /// @return ownerShares Array of corresponding shares.
    function getOwners(uint256 _propertyId)
        public
        view
        propertyExists(_propertyId)
        returns (address[] memory ownerAddresses, uint256[] memory ownerShares)
    {
        Property storage prop = properties[_propertyId];
        uint256 len = prop.owners.length;

        ownerAddresses = new address[](len);
        ownerShares = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            ownerAddresses[i] = prop.owners[i].wallet;
            ownerShares[i] = prop.owners[i].percentage;
        }
    }

    /// @notice Read property metadata.
    /// @param _propertyId The property identifier.
    /// @return id Property id.
    /// @return name Property name.
    /// @return ownersCount Number of owners.
    /// @return partnershipAgreementUrl URL for the partnership agreement.
    /// @return maintenanceAgreementUrl URL for the maintenance agreement.
    /// @return rentAgreementUrl URL for the rent agreement.
    /// @return imageUrl URL for an image of the property.
    function getProperty(uint256 _propertyId)
        public
        view
        propertyExists(_propertyId)
        returns (
            uint256 id,
            string memory name,
            uint256 ownersCount,
            string memory partnershipAgreementUrl,
            string memory maintenanceAgreementUrl,
            string memory rentAgreementUrl,
            string memory imageUrl
        )
    {
        Property storage prop = properties[_propertyId];
        return (
            prop.id,
            prop.name,
            prop.owners.length,
            prop.partnershipAgreementUrl,
            prop.maintenanceAgreementUrl,
            prop.rentAgreementUrl,
            prop.imageUrl
        );
    }

    /* ========== INTERNAL / HELPERS ========== */

    /// @dev Find the index of an owner in a property's owners array.
    /// @return found true if owner present, index the index when found (undefined if not found).
    function _findOwnerIndex(uint256 _propertyId, address _owner) internal view returns (bool found, uint256 index) {
        Property storage prop = properties[_propertyId];
        for (uint256 i = 0; i < prop.owners.length; i++) {
            if (prop.owners[i].wallet == _owner) {
                return (true, i);
            }
        }
        return (false, type(uint256).max);
    }

    /// @dev Remove owner at index by swapping with last and popping (gas-efficient for unordered).
    function _removeOwnerAtIndex(uint256 _propertyId, uint256 _index) internal {
        Property storage prop = properties[_propertyId];
        uint256 last = prop.owners.length - 1;
        if (_index != last) {
            prop.owners[_index] = prop.owners[last];
        }
        prop.owners.pop();
    }
}
