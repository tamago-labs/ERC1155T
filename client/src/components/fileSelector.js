import { useRef, useState } from "react";
import { NFTStorage } from "nft.storage";
import { NFT_STORAGE_TOKEN } from "../constants"
import { Puff } from "react-loading-icons";
import styled from "styled-components";
import { Button } from "../components/button"

const HasPicture = styled.div` 
  border-radius: 50%;

  ${props => props.fullSize
        ? `
    width: 100%;
`
        : `
  height: 120px;
  width: 120px;
`
    }

  
  margin-left: auto;
  margin-right: auto;
  override: hidden; 
  img {
    width: 100%;
  }
`


const Container = styled.div`
    text-align: center;
    padding: 30px;
    border: 2px dashed rgba(255, 255, 255, 0.2);
    border-radius: 20px; 
`


const fileToDataUri = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        resolve(event.target.result)
    };
    reader.readAsDataURL(file);
})

const FileSelector = ({
    onChange,
    image,
    onRemove,
    fullSize = false,
    text = "PNG, GIF, WEBP, MP4 or MP3. Max 100mb"
}) => {

    const inputFile = useRef(null)

    const [loading, setLoading] = useState(false)

    const onButtonClick = () => {
        inputFile.current.click();
    };

    const onImageChoose = async (e) => {
        const { name, files } = e.target
        const data = files[0]

        if (!data) {
            return;
        }

        setLoading(true)

        const dataUri = await fileToDataUri(data)
        const blob = await (await fetch(dataUri)).blob();

        const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });
        const cid = await client.storeBlob(blob);

        const imageUrl = `https://nftstorage.link/ipfs/${cid}`

        onChange(imageUrl)
        setLoading(false)
    }

    return (
        <>
            <Container>

                <input type="file" ref={inputFile} style={{ display: 'none' }} onChange={onImageChoose} name="image-selector" id="image-selector" />

                {loading && (
                    <div style={{ marginLeft: "auto", marginRight: "auto", justifyContent: "center", textAlign: "center", padding: "3rem", display: "flex", flexDirection: "row" }}>
                        <div style={{ margin: "auto", display: "flex", flexDirection: "row" }}>
                            <Puff height="24px" />
                        </div>
                    </div>
                )}

                {(!image && !loading) &&
                    (
                        <>
                            <p className="g-text">{text}</p>
                            <Button onClick={onButtonClick} className="new_Btn more-btn">
                                Upload File
                            </Button><br />
                        </>
                    )
                }

                {(image && !loading) &&
                    (
                        <>

                            <HasPicture fullSize={fullSize}>
                                <img src={image} alt="" />
                            </HasPicture>
                            {(image && !loading) && <div onClick={onRemove} style={{ padding: "0px", fontSize: "12px", textAlign: "center", marginTop: "10px", textDecoration: "underline", cursor: "pointer", color: "white" }}>Remove</div>}
                        </>
                    )
                }

            </Container>

        </>

    )
}

export default FileSelector