// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.5.0;

import './RWD.sol';
import './Tether.sol';

contract PlayBank {
  string public name = 'Play Bank';
  address public owner;
  Tether public tether;
  RWD public rwd;

  address[] public stakers;

  mapping(address => uint256) public stakingBalance;
  mapping(address => bool) public hasStaked;
  mapping(address => bool) public isStaking;

  constructor(RWD _rwd, Tether _tether) public {
    rwd = _rwd;
    tether = _tether;
    owner = msg.sender;
  }

  function depositTokens(uint256 _amount) public {
    // require staking amount to be greater than zero
    require(_amount > 0, 'amount cannot be 0');

    // Transfer mUSDT tokens to this contract address for staking
    tether.transferFrom(msg.sender, address(this), _amount);

    // Update Staking Balance
    stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

    if (!hasStaked[msg.sender]) {
      stakers.push(msg.sender);
    }

    // Update Staking Balance
    isStaking[msg.sender] = true;
    hasStaked[msg.sender] = true;
  }

  // Issue Rewards
  function issueTokens() public {
    // require the owner to issue tokens only
    require(msg.sender == owner, 'Caller must be the owner');

    for (uint256 i = 0; i < stakers.length; i++) {
      address recipient = stakers[i];
      uint256 balance = stakingBalance[recipient] / 9; // / 9 to create percentage incentive for stakers
      if (balance > 0) {
        rwd.transfer(recipient, balance);
      }
    }
  }

  // Unstake Tokens
  function unstakeTokens() public {
    uint256 balance = stakingBalance[msg.sender];
    // Require the amount to be greater then zero
    require(balance > 0, 'staking balance cannot be less than zero');

    // Transfer the tokens to the specified contract address from our bank
    tether.transfer(msg.sender, balance);

    // Reset Staking Balance
    stakingBalance[msg.sender] = 0;

    // Update Staking Status
    isStaking[msg.sender] = false;
  }
}
