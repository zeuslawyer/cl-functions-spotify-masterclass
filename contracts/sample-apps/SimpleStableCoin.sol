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
        _mint(msg.sender, 1000000000000000000000000);  // 1 Million STC minted to the deployer.
    }


    function owner() public view returns (address) {
        return s_owner;
    }
}

// TODO @zubin cleanup
// pragma solidity ^0.8.7;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
// import "@openzeppelin/contracts/security/Pausable.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
// contract StableCoin is ERC20, ERC20Burnable, Pausable, Ownable, ERC20Permit {
//     constructor() ERC20("StableCoin", "STC") ERC20Permit("StableCoin") {}

//     function pause() public onlyOwner {
//         _pause();
//     }

//     function unpause() public onlyOwner {
//         _unpause();
//     }

//     function mint(address to, uint256 amount) public onlyOwner {
//         _mint(to, amount);
//     }

//     function _beforeTokenTransfer(address from, address to, uint256 amount)
//         internal
//         whenNotPaused
//         override
//     {
//         super._beforeTokenTransfer(from, to, amount);
//     }
// }