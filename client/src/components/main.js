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
        <Container>
            <Flex
                p={2}
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
                                <TokenList/>
                            </TabBody>
                        </TabPanel>
                         
                    </Tabs>



                </Box>
            </Flex>
        </Container>
    )
}

export default MainPanel