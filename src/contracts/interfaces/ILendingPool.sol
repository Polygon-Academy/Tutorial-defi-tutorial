pragma solidity 0.6.11;


/**
 * @title ILendingPool interface
 * @notice The interface for the lending pool contract.
 * @author Alpha
 **/

interface ILendingPool {
  /**
   * @notice Returns the health status of account.
   **/
  function isAccountHealthy(address _account) external view returns (bool);

}
