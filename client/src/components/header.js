import Container from "../components/container";
import { Flex, Box } from "reflexbox"
import { useWeb3React } from "@web3-react/core"
import { Button } from "../components/button"
import styled from "styled-components";
import { Command } from "react-feather"
import useEagerConnect from "../hooks/useEagerConnect"
import useInactiveListener from "../hooks/useInactiveListener"
import { useState } from "react";
import { Connectors, SUPPORT_CHAINS } from "../constants";

const Brand = styled.div` 
    margin-left: 5px;
    margin-top: auto;
    margin-bottom: auto;
    font-size: 20px;  
`

const Header = () => {

    const context = useWeb3React()
    const { account, activate, deactivate, error, chainId } = context

    // handle logic to recognize the connector currently being activated
    const [activatingConnector, setActivatingConnector] = useState()

    // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
    const triedEager = useEagerConnect()

    // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
    useInactiveListener(!triedEager || !!activatingConnector)

    return (
        <Container>
            <Flex
                p={[2, 3]}
            >
                <Box style={{ display: "flex" }} width={[1 / 2]}>
                    <Command style={{ marginTop: "auto", marginBottom: "auto" }} />
                    <Brand>
                        ERC1155T
                    </Brand>
                </Box>
                <Box style={{ textAlign: "right" }} width={[1 / 2]}>
                    {/* <Button >Connect</Button> */}

                    {account && SUPPORT_CHAINS.includes(chainId) &&
                        <div>
                            Connected
                        </div>
                    }

                    {account && !SUPPORT_CHAINS.includes(chainId) &&
                        <div>
                            Chain Not Supported
                        </div>
                    }
                    
                    {!account && Connectors && Connectors.map((item, i) => (
                        <Button
                            onClick={() => {
                                setActivatingConnector(item.connector)
                                activate(item.connector)
                            }}
                            key={i} >
                            Connect
                        </Button>
                    ))}
                </Box>
            </Flex>
        </Container>
    )
}

export default Header