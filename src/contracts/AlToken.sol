// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.6.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ILendingPool.sol";


/**
 * @title alToken contract
 * @notice Implements the altoken of the ERC20 token.
 * The alToken represent the liquidity shares of the holder on the ERC20 lending pool.
 * @author Alpha
 **/

contract AlToken is ERC20, Ownable, ReentrancyGuard {
  /**
   * @dev the lending pool of the AlToken
   */
  ILendingPool private lendingPool;
    /**
   * @dev the underlying ERC20 token of the AlToken
   */
  ERC20 public underlyingAsset;


  constructor(
    string memory _name,
    string memory _symbol,
    ILendingPool _lendingPoolAddress,
    ERC20 _underlyingAsset
  ) public ERC20(_name, _symbol) {
    lendingPool = _lendingPoolAddress;
    underlyingAsset = _underlyingAsset;
  }

  /**
   * @dev mint alToken to the address equal to amount
   * @param _account the account address of receiver
   * @param _amount the amount of alToken to mint
   * Only lending pool can mint alToken
   */
  function mint(address _account, uint256 _amount) external onlyOwner {
    _mint(_account, _amount);
  }

  /**
   * @dev burn alToken of the address equal to amount
   * @param _account the account address that will burn the token
   * @param _amount the amount of alToken to burn
   * Only lending pool can burn alToken
   */
  function burn(address _account, uint256 _amount) external onlyOwner {
    _burn(_account, _amount);
  }



  /**
   * @dev  transfer alToken to another account
   * @param _from the sender account address
   * @param _to the receiver account address
   * @param _amount the amount of alToken to burn
   * Lending pool will check the account health of the sender. If the sender transfer alTokens to
   * the receiver then the sender account is not healthy, the transfer transaction will be revert.
   * Also claim the user Alpha rewards and set the new user's latest reward
   */
  function _transfer(
    address _from,
    address _to,
    uint256 _amount
  ) internal override {
    super._transfer(_from, _to, _amount);
    require(lendingPool.isAccountHealthy(_from), "Transfer tokens is not allowed");
  }
}
