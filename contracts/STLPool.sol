// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract STLPool is Ownable{
    uint256 public rewardsCount;

    using SafeERC20 for IERC20;
    IERC20 public immutable token;

    uint256 public poolAmount;
    uint256 public totalStakers;

    struct Deposit{
        uint256 amount;
        uint256 prevRewardsId;
        bool status;
    }

    struct Reward {
        uint256 amount;
        uint256 stakers;
        uint256 tempPoolAmount;
    }

    mapping(address => Deposit) public deposits;
    mapping(uint256 => Reward) public rewards;

    event LogAddLiquidity(address _sender, uint256 _amount);
    event LogAddRewards(address _sender, uint256 _id, uint256 _amount);
    event LogWithdraw(address _sender, uint256 _amountToWithdraw);

    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "address zero!");
        token = IERC20(_token);
    }
    
    function addLiquidity(uint256 _amount) external {
        require(!deposits[msg.sender].status, "Already staked!");
        require(_amount <= token.balanceOf(msg.sender), "not enough balance");
        require(_amount > 0, "amount equals zero");

        deposits[msg.sender].amount += _amount;
        deposits[msg.sender].prevRewardsId = rewardsCount;
        deposits[msg.sender].status = true;

        totalStakers++;
        poolAmount += _amount;

        token.safeTransferFrom(msg.sender, address(this), _amount);
        emit LogAddLiquidity(msg.sender, _amount);
    }

    function addRewards(uint256 _amount) external onlyOwner{
        require(_amount <= token.balanceOf(msg.sender), "not enough balance");
        require(_amount > 0, "amount equals zero");

        uint256 rewardsId = rewardsCount++;
        rewards[rewardsId].amount = _amount;
        rewards[rewardsId].stakers = totalStakers;
        rewards[rewardsId].tempPoolAmount = poolAmount;

        token.safeTransferFrom(msg.sender, address(this), _amount);

        emit LogAddRewards(msg.sender, rewardsId, _amount);
    }

    function withdraw() external {
        uint256 balance = deposits[msg.sender].amount;
        require(balance > 0 , "balance equals zero");

        uint256 amountToWithdraw  = balance + getShares(balance);

        poolAmount -= balance;
       
        deposits[msg.sender].status = false;
        deposits[msg.sender].amount = 0;

        token.safeTransfer(msg.sender, amountToWithdraw);
        emit LogWithdraw(msg.sender, amountToWithdraw);
    }

    function getShares(uint256 _balance) public view returns(uint256 shares) {
         
        uint256 prevRewardID = deposits[msg.sender].prevRewardsId;

        for(uint256 i = rewardsCount; i > prevRewardID; i--){
            uint256 tempPoolAmount = rewards[i-1].tempPoolAmount;
            uint256 pendingRewards = rewards[i-1].amount;

            shares += _balance * pendingRewards/tempPoolAmount;
        }
    }
    // This function is used to recover tokens deposited by mistake.
    function recover(address _to, address _token) external onlyOwner {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        require(balance > 0, "Funds not available!");

        token.safeTransfer(_to, balance);
    }
}
