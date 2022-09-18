import { Button as B } from "rebass"
import styled from "styled-components"
 
const StyledB = styled(B)`
    color: black;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    cursor: pointer;
`

export const Button = ({ onClick, children, disabled }) => {
    return (
        <StyledB disabled={disabled} onClick={onClick}>
            {children}
        </StyledB>
    )
}