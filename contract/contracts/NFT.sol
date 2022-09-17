
// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "./ERC1155T.sol";

contract NFT is ERC1155T {


    /// @notice mint tokens to multiple accounts at the same time
    function mint(
        address[] memory accounts,
        uint256 _id,
        uint256[] memory _currentBalances,
        bytes32[][] memory _currentProofs,
        uint256[] memory _amountToTopups,
        bytes32[][] memory _updatedProofs,
        bytes32 _rootAfterTopup,
        string memory _balanceSheet
    ) external { 
        _mintBatch(accounts, _id, _currentBalances, _currentProofs, _amountToTopups, _updatedProofs, _rootAfterTopup, _balanceSheet);
    }

     /// @notice set token URI
    function setURI(
        uint256 _id,
        string memory _tokenURI
    ) external {
        _setURI(_id, _tokenURI);
    }

    /// @notice reverse in case of someone put a broken balanace sheet
    function reverse(uint256 _id, bytes32 _root, string memory _balanceSheet) external {
        _reverse(_id, _root, _balanceSheet);
    }

}