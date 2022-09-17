const { ethers } = require("hardhat")
const { MerkleTree } = require('merkletreejs')
const keccak256 = require("keccak256")
const Hash = require('pure-ipfs-only-hash')




exports.randomSigners = (amount) => {
    const signers = []
    for (let i = 0; i < amount; i++) {
        signers.push(ethers.Wallet.createRandom())
    }
    return signers
}

exports.generateLeaves = ({
    signers = [],
    accounts = [],
    amounts = []
}) => {

    if (accounts.length !== amounts.length) {
        throw new Error("Length mismatcn")
    }

    return signers.map((item) => ethers.utils.keccak256(ethers.utils.solidityPack(["address", "uint256"], [item.address, accounts.includes(item.address) ? amounts[accounts.indexOf(item.address)] : 0])))
}

exports.generateMerkleTree = ({
    signers = [],
    accounts = [],
    amounts = []
}) => {

    if (accounts.length !== amounts.length) {
        throw new Error("Length mismatcn")
    }

    const leaves = this.generateLeaves({
        signers,
        accounts,
        amounts
    })

    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
    const root = tree.getHexRoot()

    let proofs = []

    for (let i = 0; i < accounts.length ; i++) {
        const proof = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack(["address","uint256" ], [ accounts[i], amounts[i]])))
        proofs.push(proof)
    }

    return {
        leaves,
        tree,
        root,
        proofs
    }
}