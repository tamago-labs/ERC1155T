import styled from "styled-components";
import { useState, useRef, useCallback, useReducer, useMemo, useEffect } from "react";
import { Flex, Box } from "reflexbox";
import { useWeb3React } from "@web3-react/core"
import { Puff } from 'react-loading-icons'
import Papa from "papaparse"
import {
    Label,
    Input,
    Select,
    Textarea,
    Radio,
    Checkbox,
} from '@rebass/forms'
import { Button } from "../button"
import InfoModal from "../modals/InfoModal";
import FileSelector from "../fileSelector";
import useNFT from "../../hooks/useNFT"
import axios from "axios"

const Container = styled.div`

`

const Item = styled.div`
    text-align: center;
    padding: 30px;
    border: 2px dashed rgba(255, 255, 255, 0.2);
    border-radius: 20px; 
    height: 250px;
     

    img { 
         width: 60%;
         max-height: 100px;
        object-fit: cover;
    }

`

const TokenItem = ({ uri, tokenId }) => {

    const [wallets, setWallets] = useState()
    const [data, setData] = useState()
    const [loading, setLoading] = useState()
    const [errorMessage, setErrorMessage] = useState()
    const { getBalanceSheet, mintItems } = useNFT()
    const [balanceSheet, setBalanceSheet] = useState([])

    const [saving, setSaving] = useState(false)
    const [visible, setVisible] = useState()

    const toggle = () => setVisible(!visible)

    const { account } = useWeb3React()

    const inputFile = useRef(null)

    const onButtonClick = () => {
        inputFile.current.click();
    };

    useEffect(() => {
        if (uri) {
            axios.get(uri).then(
                ({ data }) => {
                    setData(data)
                }
            )
        }
    }, [uri])

    useEffect(() => {
        tokenId && getBalanceSheet(tokenId).then(
            (uri) => {
                if (uri) {
                    axios.get(uri).then(
                        ({ data }) => {
                            setBalanceSheet(data)
                        }
                    )
                }
            }
        )
    }, [tokenId])

    const onFileUpload = async (event) => {
        // Passing file data (event.target.files[0]) to parse using Papa.parse
        Papa.parse(event.target.files[0], {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const { data } = results
                const parsed = data.map(item => item['HolderAddress']).filter(item => !["0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000001", "0x000000000000000000000000000000000000dead"].includes(item.toLowerCase()))

                setWallets(parsed.reduce((output, value, index) => {
                    return `${output + value}${index !== (parsed.length - 1) ? "\n" : ""}`
                }, ""))
            },
        });
    }

    const splitLines = str => str.split(/\r?\n/)

    const onMintItems = useCallback(async () => {

        setErrorMessage()

        if (!wallets) {
            return
        }

        if (balanceSheet && balanceSheet.length === 0) {
            setErrorMessage("Invalid Balance Sheet")
            return
        }

        let arrays = splitLines(wallets)

        arrays = arrays.map(item => item.replace(/\s/g, ""))

        for (let item of arrays) {

            if (item.length !== 42) {
                setErrorMessage("Invalid Data")
                return
            }

        }

        setLoading(true)

        try {

            let newBalanceSheet = []

            for (let wallet of arrays) {
                const exist = balanceSheet.find(item => item[0] === wallet)
                if (exist) {
                    const current = exist[1]
                    newBalanceSheet.push([wallet, current+1])
                } else {
                    newBalanceSheet.push([wallet, 1])
                }
            }

            await mintItems({
                currentBalanceSheet: balanceSheet,
                updatedBalanceSheet: newBalanceSheet,
                tokenId : tokenId
            })

            // setWallets()

        } catch (e) {

            const message =
                e && e.data && e.data.message
                    ? e.data.message
                    : e.message;

            alert(message)
        }

        setLoading(false)



    }, [wallets, tokenId, balanceSheet, mintItems])

    const lines = wallets ? splitLines(wallets).length : 0

    const balance = useMemo(() => {
        if (account && balanceSheet && balanceSheet.length > 0) {
            return balanceSheet.find(item => item[0] === account) ? balanceSheet.find(item => item[0] === account)[1] : 0
        }
        return 0
    }, [account, balanceSheet])

    return (
        <>
            <InfoModal
                visible={visible}
                toggle={toggle}
                title="Mint Items"
                width="600px"
            >
                <>
                    <Flex pb={2}>
                        <Box pb={2} width={1} >
                            <Label pb={2} htmlFor='addresses'>
                                Addresses to be Droped ({lines})
                            </Label>
                            <Textarea
                                style={{ fontSize: "14px", height: "300px" }}
                                value={wallets}
                                id='addresses'
                                name='addresses'
                                onChange={(e) => setWallets(e.target.value)}
                            />
                        </Box>
                    </Flex>
                    <div style={{ textAlign: "center" }}>
                        <Button onClick={onButtonClick} className="btn btn-success">
                            <div style={{ display: "flex", flexDirection: "row" }}>
                                <div>
                                    Upload CSV from Etherscan
                                </div>
                            </div>
                        </Button>
                        <input type="file" accept=".csv" ref={inputFile} style={{ display: 'none' }} onChange={onFileUpload} name="file-selector" id="file-selector" />
                    </div>
                    <hr style={{ borderColor: "white" }} />
                    {errorMessage && (
                        <p style={{ textAlign: "center", fontWeight: "600" }}>
                            {errorMessage}
                        </p>
                    )}
                    <div style={{ textAlign: "center" }}>
                        <Button disabled={loading} onClick={onMintItems} className="btn btn-primary">
                            <div style={{ display: "flex", flexDirection: "row" }}>
                                {loading && (
                                    <Puff height="24px" stroke="black" style={{ marginRight: "5px" }} width="24px" />
                                )}
                                <div>
                                    ++ Mint
                                </div>
                            </div>
                        </Button>
                    </div>
                </>
            </InfoModal>
            <Item>
                <div>
                    <img src={data && data.image} />
                    <div style={{ padding: "0px", paddingTop: "7px", paddingBottom: "7px", fontSize: "16px" }}>{data && data.title}</div>
                    <div style={{ padding: 0, fontSize: "14px" }}>
                        Balance : {balance}
                    </div>
                    <div style={{ fontSize: "12px", padding: "10px" }}>
                        <Button onClick={toggle}>+ Mint</Button>
                        {/* {` `}<Button>- Send</Button> */}
                    </div>
                </div>
            </Item>
        </>

    )
}

const TokenList = ({
}) => {

    const [saving, setSaving] = useState(false)
    const { getAllTokens, firstMint } = useNFT()
    const { account } = useWeb3React()
    const [tokens, setTokens] = useState([])
    const [tick, setTick] = useState()

    useEffect(() => {
        getAllTokens().then(setTokens)
    }, [tick])

    const [values, dispatch] = useReducer(
        (curVal, newVal) => ({ ...curVal, ...newVal }),
        {
            title: "",
            description: "",
            image: ""
        }
    )

    const [errors, setErrors] = useReducer(
        (curVal, newVal) => ({ ...curVal, ...newVal }),
        {
            title: undefined,
            description: undefined,
            image: undefined
        }
    )

    const { title, description, image } = values

    const [visible, setVisible] = useState()

    const toggle = () => setVisible(!visible)

    const handleTextChange = (e) => {
        let { name, value } = e.target
        value = value.length > 600 ? value.slice(0, 600) : value
        dispatch({ [name]: value })
    }

    const handleImageChange = (imageUrl) => {
        dispatch({ image: imageUrl })
    }

    const onRemoveImage = () => {
        dispatch({ image: "" })
    }

    const onAddToken = useCallback(async () => {

        setErrors({
            title: undefined,
            description: undefined,
            image: undefined
        })

        if (!title) {
            setErrors({ title: "Please provide title" })
            return
        }

        if (!description) {
            setErrors({ description: "Please provide description" })
            return
        }

        if (!image) {
            setErrors({ image: "Please provide a file" })
            return
        }

        setSaving(true)

        try {

            await firstMint({
                title,
                description,
                image,
                tokenId: tokens.length + 1
            })

            alert("Completed")
            toggle()
            setTick(tick + 1)

        } catch (e) {
            console.log(e);
        }

        setSaving(false)

    }, [title, description, image, tokens, tick])


    return (
        <>
            <InfoModal
                visible={visible}
                toggle={toggle}
                title="New Token"
                width="600px"
            >

                <>
                    <Flex pt={2} pb={2}>
                        <Box pb={2} width={1} >
                            <Label pb={2} htmlFor='title'>Title</Label>
                            <Input
                                value={title}
                                id='title'
                                name='title'
                                type='text'
                                style={{ borderColor: errors['title'] && "red" }}
                                onChange={handleTextChange}
                            />
                        </Box>
                    </Flex>
                    <Flex pb={2}>
                        <Box pb={2} width={1} >
                            <Label pb={2} htmlFor='description'>Description</Label>
                            <Textarea
                                value={description}
                                id='description'
                                name='description'
                                style={{ borderColor: errors['description'] && "red" }}
                                onChange={handleTextChange}
                            />
                        </Box>
                    </Flex>
                    <Flex pb={2}>
                        <Box pb={2} width={1} >
                            <Label pb={2} htmlFor='category'>Upload Image File</Label>
                            <FileSelector
                                image={image}
                                onChange={handleImageChange}
                                onRemove={onRemoveImage}
                                text={"PNG, JPEG file no more than 1 MB"}
                            />
                        </Box>
                    </Flex>
                    <p style={{ textAlign: "center" }}>Metamask will be poped up twice, for first mint & set token URI</p>
                    <hr style={{ borderColor: "white" }} />

                    {errors && Object.keys(errors).map((key, index) => {
                        return (
                            <p style={{ textAlign: "center", fontWeight: "600" }} key={index}>
                                {errors[key]}
                            </p>
                        )
                    })}
                    <div style={{ textAlign: "center" }}>
                        <Button disabled={saving} onClick={onAddToken} className="btn btn-primary">
                            <div style={{ display: "flex", flexDirection: "row" }}>
                                {saving && (
                                    <Puff height="24px" stroke="black" style={{ marginRight: "5px" }} width="24px" />
                                )}
                                <div>
                                    Save
                                </div>
                            </div>
                        </Button>
                    </div>
                </>

            </InfoModal>
            <Container>
                <Flex pt={2} pb={2} flexWrap="wrap">

                    {tokens && tokens.map((token, index) => {

                        return (
                            <Box p={1} key={index} width={[1 / 4]}>
                                <TokenItem
                                    tokenId={token.tokenId}
                                    uri={token.uri}
                                />
                            </Box>

                        )
                    })}

                    <Box p={1} width={[1 / 4]}>
                        <Item>
                            <br />
                            <h2>New Token</h2>
                            <Button disabled={!account} onClick={() => setVisible(!visible)} className="new_Btn more-btn">+ Add</Button>
                        </Item>
                    </Box>
                </Flex>
            </Container>
        </>

    )
}

export default TokenList