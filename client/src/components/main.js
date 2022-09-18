import styled from "styled-components";
import { useState, useRef, useCallback } from "react";
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import Container from "./container";
import { Flex, Box } from "reflexbox";
import {
    Label,
    Input,
    Select,
    Textarea,
    Radio,
    Checkbox,
} from '@rebass/forms'
import { NFTStorage } from "nft.storage";
import { NFT_STORAGE_TOKEN } from "../constants";
import { Puff } from "react-loading-icons";
import { Button } from "../components/button"
import useFactory from "../hooks/useFactory";
import { useWeb3React } from "@web3-react/core";
import TokenList from "./nft/tokenList";

const TabBody = styled.div`
  display: flex; 
  flex-direction: column;
  padding-top: 1rem;
  padding-bottom: 1rem;  
`

const MainPanel = () => {

    const { deploy } = useFactory()

    const [name, setName] = useState("")
    const { account } = useWeb3React()

    const onDeploy = useCallback(async () => {

        if (!name) {
            return
        }

        if (!account) {
            return
        }

        try {
            await deploy(name)

            setName()
            alert("Deployed")

        } catch (e) {
            alert(e.message)
        }

    }, [deploy, name])

    return (
        <Container >


            <div style={{ padding: "10px", textAlign: "center", paddingBottom: "0px" }}>
                <h2>What is ERC1155T?</h2>
                <p style={{ maxWidth: "600px", marginLeft: "auto", marginRight: "auto", lineHeight: "28px" }}>
                    ERC1155T is an experiment NFT standard utilized Merkle Tree to verify off-chain user balances on IPFS aim to reduce the gas cost during the mass airdrop / creation of game items to million users.
                </p>
            </div>

            <Flex
                p={2}
                pt={0}
            >
                <Box style={{ width: "100%" }} pt={4}>
                    <Tabs>
                        <TabList>
                            <Tab>
                                All Token ID
                            </Tab>

                        </TabList>
                        <TabPanel>
                            <TabBody>
                                <TokenList />
                            </TabBody>
                        </TabPanel>

                    </Tabs>



                </Box>
            </Flex>

            <div style={{ textAlign: "center", color: "grey", maxWidth: "600px", marginLeft: "auto", marginRight: "auto", lineHeight: "28px" , height: "100px"  }}>
                Above is the example NFT deployed on Avalanche Fuji Testnet, anyone can create a new token and mint them to the thousand users.
            </div>
 
        </Container>
    )
}

export default MainPanel