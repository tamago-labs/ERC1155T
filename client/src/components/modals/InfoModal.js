import React, { useState, useEffect, useCallback, useContext, useId } from "react"
import { useWeb3React } from "@web3-react/core"
import styled from "styled-components"
import BaseModal from "./BaseModal"


const InfoModal = ({
    visible,
    toggle,
    title,
    children,
    width = "500px"
}) => {
    return (
        <>
            <BaseModal
                isOpen={visible}
                onRequestClose={toggle}
                title={title}
                width={width}
            >
                {children}
            </BaseModal>
        </>
    )
}

export default InfoModal