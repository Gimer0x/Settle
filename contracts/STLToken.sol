// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract STLToken is ERC20, Ownable{
    uint256 constant public MAX_SUPPLY = 1_000_000 ether;

    event LogNewMint(address _sender, address _receiver, uint256 _amount);

    constructor(string memory _name, string memory _symbol) 
        ERC20(_name, _symbol)
        Ownable(msg.sender)
    {}

    function mint(address _to, uint256 _amount) public onlyOwner {
        require(_to != address(0), "Zero address!");
        require(totalSupply() + _amount <= MAX_SUPPLY, "Max supply reached!");

        _mint(_to, _amount);

        emit LogNewMint(msg.sender, _to, _amount);
    }
}
