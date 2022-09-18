import { useState, useCallback, useMemo } from "react";
import { useWeb3React } from "@web3-react/core";
import axios from "axios";
import { ethers } from "ethers";
import { NFT, NFT_STORAGE_TOKEN } from "../constants";
import NFTABI from "../abi/NFT.json"
import { NFTStorage } from "nft.storage";
import { MerkleTree } from "merkletreejs";
import Moralis from "moralis-v1";
import keccak256 from "keccak256";

window.Buffer = window.Buffer || require("buffer").Buffer;

const useNFT = () => {

    const context = useWeb3React();

    const { chainId, account, library } = context

    const contract = useMemo(() => {
        const row = NFT.find(
            (item) => item.chainId === chainId
        );
        if (!account || !library || !row) {
            return;
        }
        const address = row.contractAddress

        return new ethers.Contract(address, NFTABI, library.getSigner());
    }, [account, chainId, library]);

    const generateLeaves = ({
        signers = [],
        accounts = [],
        amounts = []
    }) => {

        if (accounts.length !== amounts.length) {
            throw new Error("Length mismatcn")
        }

        return signers.map((item) => ethers.utils.keccak256(ethers.utils.solidityPack(["address", "uint256"], [item, accounts.includes(item) ? amounts[accounts.indexOf(item)] : 0])))
    }

    const generateMerkleFromBalanceSheet = (balanceSheet, accounts = [], amounts = []) => {

        const signers = balanceSheet.map(item => item[0])

        const leaves = generateLeaves({
            signers,
            accounts,
            amounts
        })

        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
        const root = tree.getHexRoot()

        let proofs = []

        for (let i = 0; i < accounts.length; i++) {
            const proof = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack(["address", "uint256"], [accounts[i], amounts[i]])))
            proofs.push(proof)
        }

        return {
            leaves,
            tree,
            root,
            proofs
        }

    }

    const generateMoralisParams = (chainId) => {
        if ([43113].indexOf(chainId) !== -1) {
            return {
                serverUrl: process.env.REACT_APP_MORALIS_TESTNET_SERVER_URL,
                appId: process.env.REACT_APP_MORALIS_TESTNET_APP_ID,
                masterKey: process.env.REACT_APP_MORALIS_TESTNET_MASTER_KEY
            }
        }
        throw new Error("Chain isn't supported")
    }

    const mintItems = useCallback(async ({
        tokenId,
        currentBalanceSheet,
        updatedBalanceSheet
    }) => {

        if (!account) {
            throw new Error("Wallet not connected");
        }

        const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

        const finalBalanceSheet = updatedBalanceSheet.concat(currentBalanceSheet)

        const blobBalance = new Blob([JSON.stringify(finalBalanceSheet)]);
        const cidBalance = await client.storeBlob(blobBalance);
        const updatedBalanceSheetUri = `https://nftstorage.link/ipfs/${cidBalance}`

        const currentMerkle = generateMerkleFromBalanceSheet(
            currentBalanceSheet,
            currentBalanceSheet.map(item => item[0]),
            currentBalanceSheet.map(item => item[1])
        )

        const updatedMerkle = generateMerkleFromBalanceSheet(
            updatedBalanceSheet,
            updatedBalanceSheet.map(item => item[0]),
            updatedBalanceSheet.map(item => item[1])
        )

        const currentAddresses = currentBalanceSheet.map(item => item[0])

        const tx = await contract.mint(
            updatedBalanceSheet.map(item => item[0]),
            tokenId, // token ID
            updatedBalanceSheet.map(item => 0), // current balances
            updatedBalanceSheet.map(item => []), // current proofs
            updatedBalanceSheet.map(item => 1), // increments
            updatedMerkle.proofs, // updated proofs
            updatedMerkle.root, // updated root
            updatedBalanceSheetUri
        )
        await tx.wait()

    }, [account, contract])

    const getAllTokens = useCallback(async () => {

        await Moralis.start(generateMoralisParams(43113));

        const Table = Moralis.Object.extend("ERC1155TURI");
        const query = new Moralis.Query(Table);

        query.limit(1000);

        const results = await query.find();

        let result = []

        for (let item of results) {

            const tokenId = item.get("uid")

            if (![1].includes(Number(tokenId))) {
                result.push({
                    tokenId: item.get("uid"),
                    uri: item.get("value")

                })
            }

        }

        return result
    }, [contract])

    const getBalanceSheet = useCallback(async (tokenId) => {

        await Moralis.start(generateMoralisParams(43113));

        const Table = Moralis.Object.extend("ERC1155TBALANCE");
        const query = new Moralis.Query(Table);

        query.limit(1000);

        const results = await query.find();

        let result

        for (let item of results) {
            const id = item.get("uid")
            const cid = item.get("cid")
            if (Number(id) === Number(tokenId)) {
                result = cid
            }
        }
        return result
    }, [])

    const firstMint = useCallback(async ({
        title,
        description,
        image,
        tokenId
    }) => {

        const metadata = {
            title,
            name: title,
            description,
            image
        }

        const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

        const str = JSON.stringify(metadata);
        // text/plain;UTF-8
        const blob = new Blob([str]);
        const cid = await client.storeBlob(blob);

        const tokenUri = `https://nftstorage.link/ipfs/${cid}`

        const balanceSheet = [
            [account, 1]
        ]

        const blobBalance = new Blob([JSON.stringify(balanceSheet)]);
        const cidBalance = await client.storeBlob(blobBalance);

        const balanceSheetUri = `https://nftstorage.link/ipfs/${cidBalance}`

        const merkle = generateMerkleFromBalanceSheet(balanceSheet, [account], [1])

        const tx = await contract.mint(
            [account],
            tokenId,
            [0],
            [[]],
            [1],
            merkle.proofs,
            merkle.root,
            balanceSheetUri
        )
        await tx.wait()

        const tx2 = await contract.setURI(tokenId, tokenUri)
        await tx2.wait()


    }, [contract, account])

    return {
        mintItems,
        getAllTokens,
        firstMint,
        getBalanceSheet
    }
}

export default useNFT