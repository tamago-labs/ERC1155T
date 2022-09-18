import React, {  useState } from "react"
import Modal from "react-modal"
import styled from "styled-components"
import { X } from "react-feather"

const customStyles = {
    content: {
        top: '20%',
        height: "400px",
        width: "100%",
        maxWidth: "600px",
        marginLeft: "auto",
        marginRight: "auto",
        background: "#20283E",
        borderRadius: "8px",
        border: "1px solid white"
    },
};


const ModalStyle = styled.div`
    margin-top: 100px;
    min-height: 200px;
    width: 100%;
    max-width: ${props => props.width && props.width };
    margin-left: auto;
    margin-right: auto;
    background: #20283E;
    border-radius: 8px;
    border: 1px solid white;
    padding: 20px; 
    z-index: 100;
`;

const ModalBody = styled.div`
    padding-top: 10px;
    color: white;
    z-index: 101;
`

const ModalHeader = styled.div`
    font-size: 20px; 
    display: flex;
    flex-direction: row;
    color: white;
    div {
        flex: 1;
        a {
            cursor: pointer;
        }
    }
`

const OverlayStyle = styled.div`
    z-index: 100;
`;

const BaseModal  = ({
    children,
    isOpen,
    onRequestClose,
    title,
    width = "500px"
}) => {

    let subtitle

    function afterOpenModal() {
        // references are now sync'd and can be accessed.
        subtitle.style.color = '#f00';
    }

    return (
       <> 
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose} 
            className="_" 
            contentElement={(props, children) => <ModalStyle width={width} {...props}>{children}</ModalStyle>}
            overlayElement={(props, contentElement) => <OverlayStyle {...props}>{contentElement}</OverlayStyle>}
        >
            <ModalHeader>
                <div>
                    {title}
                </div>
                <div style={{ textAlign: "right" }}>
                    <a onClick={onRequestClose}>
                        <X />
                    </a>
                </div>
            </ModalHeader>
            <hr style={{borderColor :"white"}} />
            <ModalBody>
                {children}
            </ModalBody>
        </Modal>
       </>
    )
}

export default BaseModal