// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * ERC20 token representing fractional ownership of a property NFT.
 */
contract FractionalNFT is ERC20, Ownable {
    uint256 public immutable totalShares;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 _totalShares,
        address _owner
    ) ERC20(name_, symbol_) Ownable(_owner) {
        totalShares = _totalShares;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= totalShares, "Exceeds total shares");
        _mint(to, amount);
    }
}
