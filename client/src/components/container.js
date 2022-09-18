import { Box } from "reflexbox"

const Container = ({ children }) => {
    return (
        <Box
            sx={{
                maxWidth: 1024,
                mx: 'auto',
                px: 3,
            }} 
            >
            {children}
        </Box>
    )
}

export default Container