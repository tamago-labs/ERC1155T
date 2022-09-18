import { useState, useCallback } from "react";
import { useWeb3React } from "@web3-react/core";
import axios from "axios";
import { ethers } from "ethers";
import { FACTORY } from "../constants";
import FactoryABI from "../abi/Factory.json"

const useFactory = () => {

    const context = useWeb3React();

    const { chainId, account, library } = context

    const deploy = useCallback(async (name) => {

        if (!account) {
            throw new Error("Wallet not connected");
        }

        let contractAddress

        console.log("chainId --> ", chainId, FACTORY)

        if (
            FACTORY.filter((item) => item.chainId === chainId)
                .length === 0
        ) {
            throw new Error("Factory contract is not available on given chain");
        }
        const row = FACTORY.find(
            (item) => item.chainId === chainId
        );
        contractAddress = row.contractAddress

        const factoryContract = new ethers.Contract(
            contractAddress,
            FactoryABI,
            library.getSigner()
        );

        const tx = await factoryContract.deploy(name)
        await tx.wait();
        // const nftAddress = res.events[2].args["nft"];
        // return nftAddress
    }, [account, chainId, library])

    return {
        deploy
    }
}

export default useFactory