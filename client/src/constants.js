import { InjectedConnector } from "@web3-react/injected-connector"

export const injected = new InjectedConnector()

export const SUPPORT_CHAINS = [43113, 43114]

export const NETWORK = [
    {
        chainId: '0xA86A',
        chainName: 'Avalanche',
        icon: "https://raw.githubusercontent.com/sushiswap/icons/master/network/avalanche.jpg",
        nativeCurrency: {
            name: 'Avalanche',
            symbol: 'AVAX',
            decimals: 18,
        },
        rpcUrls: ['https://bsc-dataseed1.binance.org'],
        blockExplorerUrls: ['https://bscscan.com'],
    },
    {
        chainId: "0xa869",
        chainName: "Avalanche Fuji Testnet",
        icon: "https://raw.githubusercontent.com/sushiswap/icons/master/network/avalanche.jpg",
        nativeCurrency: {
            name: "AVAX",
            symbol: "AVAX",
            decimals: 18,
        },
        rpcUrls: ["https://matic-mainnet.chainstacklabs.com/"],
        blockExplorerUrls: ["https://polygonscan.com"],
    }
]


export const Connectors = [
    {
        name: "Connect with MetaMask",
        connector: injected
    }
]

export const FACTORY = [
    {
        chainId: 43113,
        contractAddress: "0x9e3Ada39d457386221424785Cf7Ad79Ad34c33c2",
    }
]

export const NFT = [
    {
        chainId: 43113,
        contractAddress: "0x216ecf2825a654849D4076f7A616B9Caaf0C6E04"
    }
]

export const NFT_STORAGE_TOKEN = process.env.REACT_APP_NFT_STORAGE_TOKEN