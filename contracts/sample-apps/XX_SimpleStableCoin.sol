// SPDX-License-Identifier: MIT

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @notice simple ERC Token to demonstrat stablecoin usage. Does NOT implement stablecoin algorithms.
 * @notice NOT FOR PRODUCTION USE
 * @dev this will inheri the interface as describe in https://docs.openzeppelin.com/contracts/2.x/api/token/erc20#IERC20
 * @dev 1 STC has 18 decimal places.
 */
contract SimpleStableCoin is ERC20 {
  address private s_owner;

  constructor() ERC20("SimpleSTC", "STC") {
    s_owner = msg.sender;
    _mint(msg.sender, 1000000000000000000000000); // 1 Million STC minted to the deployer.
  }

  function owner() public view returns (address) {
    return s_owner;
  }
}
