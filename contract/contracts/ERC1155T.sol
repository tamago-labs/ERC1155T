// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "./interfaces/IERC1155T.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title Low-cost ERC-1155 for mass-airdrop
 */

contract ERC1155T is Context, ERC165, IERC1155T {
    using Address for address;

    // Mapping from tokenID => latest CID represents ID for each balance sheet or Tx occurs on specifc token ID
    mapping(uint256 => uint256) internal _balanceSheetId;
    // Balance sheet must be stored on IPFS, tokenId => Balance Sheet ID => IPFS's CID
    mapping(uint256 => mapping(uint256 => string)) internal _balances;
    // Mapping from token ID to balances in Merkle trees, tokenId => Balance Sheet ID => Merkle Tree Root
    mapping(uint256 => mapping(uint256 => bytes32)) internal _roots;

    // Mapping from account to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC1155T).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IERC1155MetadataURI-uri}.
     *
     * This implementation returns the same URI for *all* token types. It relies
     * on the token type ID substitution mechanism
     * https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the EIP].
     *
     * Clients calling this function must replace the `\{id\}` substring with the
     * actual token type ID.
     */
    function uri(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        string memory tokenURI = _tokenURIs[tokenId];
        return tokenURI;
    }

    /// @dev return the IPFS's CID to be fetched the current balance sheet of the given token ID
    function balanceOf(uint256 id)
        public
        view
        virtual
        override
        returns (string memory)
    {
        return _balances[id][_balanceSheetId[id]];
    }

    // @dev return the IPFS's CID for the given token ID and balance sheet ID
    function balanceSheet(uint256 id, uint256 balanceSheetId)
        public
        view
        returns (string memory)
    {
        return _balances[id][balanceSheetId];
    }

    /// @dev return the IPFS's CID to be fetched the current balance sheet of the given token ID in batch
    function balanceOfBatch(uint256[] memory ids)
        public
        view
        virtual
        override
        returns (string[] memory)
    {
        string[] memory batchBalances = new string[](ids.length);

        for (uint256 i = 0; i < ids.length; ++i) {
            batchBalances[i] = _balances[ids[i]][_balanceSheetId[ids[i]]];
        }

        return batchBalances;
    }

    /// @dev return the IPFS's CID for the given token ID and balance sheet ID in batch
    function balanceOfBatch(
        uint256[] memory ids,
        uint256[] memory balanceSheetIds
    ) public view returns (string[] memory) {
        require(ids.length == balanceSheetIds.length, "Invalid length");

        string[] memory batchBalances = new string[](ids.length);

        for (uint256 i = 0; i < ids.length; ++i) {
            batchBalances[i] = _balances[ids[i]][balanceSheetIds[i]];
        }

        return batchBalances;
    }

    /**
     * @dev See {IERC1155-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved)
        public
        virtual
        override
    {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev See {IERC1155-isApprovedForAll}.
     */
    function isApprovedForAll(address account, address operator)
        public
        view
        virtual
        override
        returns (bool)
    {
        return _operatorApprovals[account][operator];
    }

    /**
     * @dev See {IERC1155-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256[] memory _currentBalances,
        bytes32[][] memory _currentProofs,
        uint256 amount,
        bytes32[][] memory _updatedProofs,
        bytes32 _rootAfterTransfer,
        string memory _updatedBalanceSheet
    ) public virtual override {
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: caller is not token owner or approved"
        );
        _safeTransferFrom(
            from,
            to,
            id,
            _currentBalances,
            _currentProofs,
            amount,
            _updatedProofs,
            _rootAfterTransfer,
            _updatedBalanceSheet
        );
    }

    // reverse balances in case of someone put a broken balanace sheet
    function _reverse(
        uint256 _id,
        bytes32 _root,
        string memory _balanceSheet
    ) internal virtual {
        require(_roots[_id][_balanceSheetId[_id]] == _root, "");

        _balances[_id][_balanceSheetId[_id]] = _balanceSheet;

        emit BalanceSheetUpdated(_balanceSheet, _id);
    }

    /**
     * @dev Creates `amount` tokens of token type `id`, and assigns them to `to`.
     *
     * Emits a {TransferSingle} event.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the
     * acceptance magic value.
     */
    function _mint(
        address _to,
        uint256 _id,
        uint256 _currentBalance,
        bytes32[] memory _currentProof,
        uint256 _amountToTopup,
        bytes32[] memory _updatedProof,
        bytes32 _rootAfterTopup,
        string memory _updatedBalanceSheet
    ) internal virtual {
        require(_to != address(0), "ERC1155: mint to the zero address");

        address operator = _msgSender();

        bytes32 currentLeaf = keccak256(abi.encodePacked(_to, _currentBalance));

        // check if the current balance is correct
        if (_roots[_id][_balanceSheetId[_id]] != (0)) {
            require(
                MerkleProof.verify(
                    _currentProof,
                    _roots[_id][_balanceSheetId[_id]],
                    currentLeaf
                ),
                "Current proof is invalid"
            );
        }

        bytes32 updateLeaf = keccak256(
            abi.encodePacked(_to, _currentBalance + _amountToTopup)
        );

        // check the updated balance
        require(
            MerkleProof.verify(_updatedProof, _rootAfterTopup, updateLeaf),
            "Updated proof is invalid"
        );

        _balanceSheetId[_id] += 1;
        _roots[_id][_balanceSheetId[_id]] = _rootAfterTopup;
        _balances[_id][_balanceSheetId[_id]] = _updatedBalanceSheet;

        emit BalanceSheetUpdated(_updatedBalanceSheet, _id);

        emit TransferSingle(operator, address(0), _to, _id, _amountToTopup);
    }

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_mint}.
     *
     * Emits a {TransferBatch} event.
     *
     * Requirements:
     *
     * - `ids` and `amounts` must have the same length.
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155BatchReceived} and return the
     * acceptance magic value.
     */
    function _mintBatch(
        address[] memory _recipients,
        uint256 _id,
        uint256[] memory _currentBalances,
        bytes32[][] memory _currentProofs,
        uint256[] memory _amountToTopups,
        bytes32[][] memory _updatedProofs,
        bytes32 _rootAfterTopup,
        string memory _updatedBalanceSheet
    ) internal virtual {
        require(
            _recipients.length == _currentBalances.length,
            "ERC1155: length mismatch"
        );

        address operator = _msgSender();

        for (uint256 i = 0; i < _recipients.length; ) {
            bytes32 currentLeaf = keccak256(
                abi.encodePacked(_recipients[i], _currentBalances[i])
            );

            // check if the current balance is correct
            if (_currentBalances[i] != 0) {
                require(
                    MerkleProof.verify(
                        _currentProofs[i],
                        _roots[_id][_balanceSheetId[_id]],
                        currentLeaf
                    ),
                    "One of current proof is invalid"
                );
            }

            bytes32 updateLeaf = keccak256(
                abi.encodePacked(
                    _recipients[i],
                    _currentBalances[i] + _amountToTopups[i]
                )
            );

            // check the updated balance
            require(
                MerkleProof.verify(
                    _updatedProofs[i],
                    _rootAfterTopup,
                    updateLeaf
                ),
                "One of updated proof is invalid"
            );
            unchecked {
                i++;
            }
        }

        _balanceSheetId[_id] += 1;
        _roots[_id][_balanceSheetId[_id]] = _rootAfterTopup;
        _balances[_id][_balanceSheetId[_id]] = _updatedBalanceSheet;

        emit BalanceSheetUpdated(_updatedBalanceSheet, _id);

        emit TransferBatch(
            operator,
            address(0),
            _recipients,
            _id,
            _amountToTopups
        );
    }

    /**
     * @dev Transfers `amount` tokens of token type `id` from `from` to `to`.
     *
     * Emits a {TransferSingle} event.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `from` must have a balance of tokens of type `id` of at least `amount`.
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the
     * acceptance magic value.
     */
    function _safeTransferFrom(
        address from,
        address to,
        uint256 _id,
        uint256[] memory _currentBalances,
        bytes32[][] memory _currentProofs,
        uint256 amount,
        bytes32[][] memory _updatedProofs,
        bytes32 _rootAfterTransfer,
        string memory _updatedBalanceSheet
    ) internal virtual {
        require(to != address(0), "ERC1155: transfer to the zero address");
        require(
            _currentBalances.length == 2,
            "_currentBalances length must be 2"
        );

        // verify current balance
        bytes32 currentLeafFrom = keccak256(
            abi.encodePacked(from, _currentBalances[0])
        );
        require(
            MerkleProof.verify(
                _currentProofs[0],
                _roots[_id][_balanceSheetId[_id]],
                currentLeafFrom
            ),
            "Current proof 0 is invalid"
        );
        bytes32 currentLeafTo = keccak256(
            abi.encodePacked(to, _currentBalances[1])
        );
        require(
            MerkleProof.verify(
                _currentProofs[1],
                _roots[_id][_balanceSheetId[_id]],
                currentLeafTo
            ),
            "Current proof 1 is invalid"
        );

        require(
            _currentBalances[0] >= _currentBalances[1],
            "ERC1155: insufficient balance for transfer"
        );

        // update sender
        bytes32 senderLeaf = keccak256(
            abi.encodePacked(from, _currentBalances[0] - amount)
        );
        require(
            MerkleProof.verify(
                _updatedProofs[0],
                _rootAfterTransfer,
                senderLeaf
            ),
            "Updated sender proof is invalid"
        );
        // update recipient
        bytes32 recipientLeaf = keccak256(
            abi.encodePacked(to, _currentBalances[1] + amount)
        );
        require(
            MerkleProof.verify(
                _updatedProofs[1],
                _rootAfterTransfer,
                recipientLeaf
            ),
            "Updated recipient proof is invalid"
        );

        _balanceSheetId[_id] += 1;
        _roots[_id][_balanceSheetId[_id]] = _rootAfterTransfer;
        _balances[_id][_balanceSheetId[_id]] = _updatedBalanceSheet;

        emit BalanceSheetUpdated(_updatedBalanceSheet, _id);

        emit TransferSingle(msg.sender, from, to, _id, amount);
    }

    /**
     * @dev Sets `tokenURI` as the tokenURI of `tokenId`.
     */
    function _setURI(uint256 tokenId, string memory tokenURI) internal virtual {
        _tokenURIs[tokenId] = tokenURI;
        emit URI(uri(tokenId), tokenId);
    }

    /**
     * @dev Approve `operator` to operate on all of `owner` tokens
     *
     * Emits an {ApprovalForAll} event.
     */
    function _setApprovalForAll(
        address owner,
        address operator,
        bool approved
    ) internal virtual {
        require(owner != operator, "ERC1155: setting approval status for self");
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }
}
