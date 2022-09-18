import styled from "styled-components";
import Container from "./container";
import { Flex, Box } from "reflexbox"
import { Button } from "../components/button"
import ImagePNG from "../images/jumbotron.png"

const Wrapper = styled.div` 
    background: blue; 
`

const Jumbotron = () => {
    return (
        <Wrapper>
            <Container>
                <Flex
                    p={3}
                    style={{ paddingTop: "40px" , paddingBottom  :"40px"}}
                    flexWrap="wrap"
                >
                    <Box style={{ display: "flex", maxWidth: "400px", flexDirection: "column" }} width={[1, 1 / 2]}>
                        <h2 style={{ padding: "0px", margin: "0px" }}>
                            Low-Cost ERC1155 for Mass Adoption
                        </h2>
                        <p>
                            A smarter token for the future of crypto game items, tickets for mass-adoption — an ERC1155 token that supports and reduces gas cost by up to 1000x.
                        </p>
                        <div style={{marginTop : "5px"}}>
                            <Button>
                                GitHub
                            </Button>
                        </div>

                    </Box>
                    <Box style={{ display: "flex" }} width={[1, 1 / 2]}>
                        <img style={{ width: "80%", margin: "auto"  }} src={ImagePNG} />
                    </Box>
                </Flex>
            </Container>
        </Wrapper>
    )
}

export default Jumbotron