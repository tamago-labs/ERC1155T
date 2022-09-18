const hre = require("hardhat");

async function main() {

    const wait = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, 10000)
        })
    }

    const NFT = await hre.ethers.getContractFactory("NFT")

    const nft = await NFT.deploy()

    console.log("nft deployed to:", nft.address);

    await wait()

    await hre.run("verify:verify", {
        address: nft.address,
        constructorArguments: [],
    });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
