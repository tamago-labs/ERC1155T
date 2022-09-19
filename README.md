# ERC1155T

## Motivation

We have a specialized NFT marketplace for derivative NFT (https://tamagonft.xyz), the first use case is to let's anyone make their own fan-made of blue-chip / famous NFT and airdrop the whitelist NFT in ERC1155 to those holders in order to claim the fan-made NFT. We realized that dropping ERC1155 to a large list of users is costly and painful. And then we need to find the solution to make our markerplace sustains in the long-run.

## Problem & Solution

ERC1155T is an experiment NFT standard utilized Merkle Tree to verify off-chain user balances on IPFS helps reduce the gas cost during the mass airdrop / creation of game items to massive users. It works by a combination of off-chain and on-chain resources, anyone can update the balance and link them to the EVM-based blockchain via the Merkle tree root's hash.

Because of ERC1155 is uses a smart contract to track user balances in a multi-dimentional array thus update balances on behalf of users require spending a lot of gas. Alternatively, we can use a immutable database to be a single of truth and only a 32-bits string of merkle hash is being uploaded to a smart contract and can be represented a whole balance sheet. A tricky part is when we need to update the balance or mint tokens we need to generate proofs and the merkle root of the current and updated balance sheets on the client side, a smart contract will verify through the incremenation of values against the given proof. 

![2](https://user-images.githubusercontent.com/18402217/190935577-112bf7c4-8b24-46d5-a21f-9d6cd2a61ed9.png)

![3](https://user-images.githubusercontent.com/18402217/190936178-93b4bdea-2908-4b37-9c00-b47bf42063e4.png)

A balance sheet need to be contructed by the client and in a following format:
```
[
["0x50D0aD29e0dfFBdf5DAbf4372a5a1A1C1d28A6b1",1],
["0x754954df478fa93c26de3273701d3973dd822f38",100]
]
```

One of the example balance sheet: 
https://bafkreia6d5uefhs32jvqllkln2nfzpmqde4jiqqax5rz3livmvvstkinme.ipfs.nftstorage.link/

The user is obligate to provide a correct balance sheet unless the update can be reverted by anyone. However, in the long-run version we would need to find better mechanism to handle this.

```
// reverse balances in case of someone put a broken balanace sheet
function _reverse(uint256 _id, bytes32 _root, string memory _balanceSheet
) internal virtual {
        require(_roots[_id][_balanceSheetId[_id]] == _root, "");
        _balances[_id][_balanceSheetId[_id]] = _balanceSheet;
        emit BalanceSheetUpdated(_balanceSheet, _id);
 }
```

## Test

The test is attached where we can simulate transactions without to deploy a contract to the network.

```
cd contract
yan
npx hardhat test
```

The frontend made by `create-react-app` and live at https://erc1155t.tamagonft.xyz


## Deployment

### Avalanche Fuji Testnet (Chain id : 43113)

Contract Name | Contract Address 
--- | ---  
NFT | 0x216ecf2825a654849D4076f7A616B9Caaf0C6E04


## License

[MIT](./LICENSE)

