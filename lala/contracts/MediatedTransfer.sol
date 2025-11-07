// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PropertyRegistry.sol";

contract MediatedTransfer {
    PropertyRegistry public propertyRegistry;

    struct TransferProposal {
        uint256 propertyId;
        address mediator;
        address[] currentOwners;
        address[] nextOwners;
        bool isApprovedByMediator;
        bool isExecuted;
    }

    mapping(uint256 => TransferProposal) public transferProposals;
    mapping(uint256 => mapping(address => bool)) public approvals;

    event TransferProposed(uint256 indexed propertyId, address indexed mediator);
    event TransferApprovedByOwner(uint256 indexed propertyId, address indexed owner);
    event TransferApprovedByMediator(uint256 indexed propertyId, address indexed mediator);
    event TransferExecuted(uint256 indexed propertyId);
    event TransferRejected(uint256 indexed propertyId, address indexed mediator);

    constructor(address _propertyRegistryAddress) {
        propertyRegistry = PropertyRegistry(_propertyRegistryAddress);
    }

    function proposeTransfer(
        uint256 _propertyId,
        address _mediator,
        address[] memory _nextOwners
    ) public {
        (address[] memory currentOwners, ) = propertyRegistry.getOwners(_propertyId);
        require(currentOwners.length > 0, "Property has no owners");

        bool isOwner = false;
        for (uint i = 0; i < currentOwners.length; i++) {
            if (currentOwners[i] == msg.sender) {
                isOwner = true;
                break;
            }
        }
        require(isOwner, "Only an owner can propose a transfer");

        transferProposals[_propertyId] = TransferProposal({
            propertyId: _propertyId,
            mediator: _mediator,
            currentOwners: currentOwners,
            nextOwners: _nextOwners,
            isApprovedByMediator: false,
            isExecuted: false
        });

        emit TransferProposed(_propertyId, _mediator);
    }

    function approveTransfer(uint256 _propertyId) public {
        TransferProposal storage proposal = transferProposals[_propertyId];
        require(proposal.propertyId != 0, "Transfer not proposed");

        bool isOwner = false;
        for (uint i = 0; i < proposal.currentOwners.length; i++) {
            if (proposal.currentOwners[i] == msg.sender) {
                isOwner = true;
                break;
            }
        }
        require(isOwner, "Only an owner can approve");

        approvals[_propertyId][msg.sender] = true;
        emit TransferApprovedByOwner(_propertyId, msg.sender);
    }

    function approveTransferByMediator(uint256 _propertyId) public {
        TransferProposal storage proposal = transferProposals[_propertyId];
        require(proposal.propertyId != 0, "Transfer not proposed");
        require(msg.sender == proposal.mediator, "Only mediator can approve");

        proposal.isApprovedByMediator = true;
        emit TransferApprovedByMediator(_propertyId, msg.sender);
    }

    function executeTransfer(uint256 _propertyId) public {
        TransferProposal storage proposal = transferProposals[_propertyId];
        require(proposal.propertyId != 0, "Transfer not proposed");
        require(!proposal.isExecuted, "Transfer already executed");
        require(proposal.isApprovedByMediator, "Mediator has not approved");

        for (uint i = 0; i < proposal.currentOwners.length; i++) {
            require(approvals[_propertyId][proposal.currentOwners[i]], "All owners must approve");
        }

        // Assuming the property is fully owned by the current owners
        // and will be fully owned by the next owners.
        // This will transfer 100% of the ownership to the first owner of the next owners
        require(proposal.nextOwners.length > 0, "No next owners specified");
        propertyRegistry.transferFullOwnership(_propertyId, proposal.nextOwners[0]);

        proposal.isExecuted = true;
        emit TransferExecuted(_propertyId);
    }

    function rejectTransfer(uint256 _propertyId) public {
        TransferProposal storage proposal = transferProposals[_propertyId];
        require(proposal.propertyId != 0, "Transfer not proposed");
        require(msg.sender == proposal.mediator, "Only mediator can reject");

        delete transferProposals[_propertyId];
        emit TransferRejected(_propertyId, msg.sender);
    }
}