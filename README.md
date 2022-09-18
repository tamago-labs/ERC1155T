# ERC1155T

## Motivation

We have a specialized NFT marketplace for derivative NFT (https://tamagonft.xyz), the first use case is to let's anyone make their own fan-made of blue-clip / famous NFT and airdrop the whitelist NFT in ERC1155 to those holders in order to claim the fan-made NFT. We realized that dropping ERC1155 to a large list of users is costly and painful. And then we need to find the solution to make our markerplace sustains in the long-run.

## What it does

ERC1155T is an experiment NFT standard utilized Merkle Tree to verify off-chain user balances on IPFS helps reduce the gas cost during the mass airdrop / creation of game items to massive users. It works by a combination of off-chain and on-chain resources, anyone can update the balance and link them to the EVM-based blockchain via the Merkle tree root's hash.

## Deployment

### Avalanche Fuji Testnet (Chain id : 43113)

Contract Name | Contract Address 
--- | ---  
NFT | 0x216ecf2825a654849D4076f7A616B9Caaf0C6E04
