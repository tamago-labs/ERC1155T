
const { expect } = require("chai")
const { ethers } = require("hardhat")
const { MerkleTree } = require('merkletreejs')
const keccak256 = require("keccak256")
const Hash = require('pure-ipfs-only-hash')

const { randomSigners, generateLeaves, generateMerkleTree } = require("./Helpers")

let nft

let signers
let admin
let alice
let bob
let charlie

// ERC1155T NFT


describe("ERC1155T NFT", () => {

    beforeEach(async () => {

        signers = await ethers.getSigners()

        admin = signers[0]
        alice = signers[1]
        bob = signers[2]
        charlie = signers[3]

        const NFT = await ethers.getContractFactory("NFT");

        nft = await NFT.deploy()

    })

    it("Mint 10 Units of NFT#1 to Admin, Alice, Bob, Charlle", async function () {

        // contruct Merkle trees
        const merkle = generateMerkleTree({
            signers,
            accounts: [admin.address],
            amounts: [1] // admin should have 1 token
        })

        // first mint
        await nft.connect(admin).mint(
            [admin.address],
            1,
            [0],
            [[]],
            [1],
            merkle.proofs,
            merkle.root,
            "https://nftstorage.link/ipfs/bafybeifx7famfkg7yhveoh3mkwfu5v7ah3qg2wjbrnxr3mrll56zifssza" // <-- Fake IPFS's CID
        )

        expect(await nft.balanceOf(1)).to.equal("https://nftstorage.link/ipfs/bafybeifx7famfkg7yhveoh3mkwfu5v7ah3qg2wjbrnxr3mrll56zifssza")

        await nft.setURI(1, "https://api.cryptokitties.co/kitties/1")
        expect(await nft.uri(1)).to.equal("https://api.cryptokitties.co/kitties/1")

        const updatedMerkle = generateMerkleTree({
            signers,
            accounts: [admin.address, alice.address, bob.address, charlie.address], // updated balances
            amounts: [1, 3, 3, 3]
        })

        // 3 units for each
        await nft.connect(admin).mint(
            [alice.address, bob.address, charlie.address],
            1, // token ID
            [0, 0, 0], // current balances
            [[], [], []], // current proofs
            [3, 3, 3], // increments
            [updatedMerkle.proofs[1], updatedMerkle.proofs[2], updatedMerkle.proofs[3]], // updated proofs
            updatedMerkle.root, // updated root
            "" // <-- Balance Sheet
        )

        const transferedMerkle = generateMerkleTree({
            signers,
            accounts: [admin.address, alice.address, bob.address, charlie.address], // updated balances
            amounts: [1, 0, 6, 3]
        })

        // transfers 3 NFT from Alice to Bob
        await nft.connect(alice).safeTransferFrom(
            alice.address,  // From 
            bob.address, // To
            1,  // token ID
            [3, 3], // current balances
            [updatedMerkle.proofs[1], updatedMerkle.proofs[2]], // current proofs
            3, // amount to send
            [transferedMerkle.proofs[1], transferedMerkle.proofs[2]], // update proof
            transferedMerkle.root, // updated root
            "" // <-- Balance Sheet
        )

    })

})