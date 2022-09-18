import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createGlobalStyle } from "styled-components";
import { ethers } from "ethers";
import { Web3ReactProvider } from '@web3-react/core';
import { SkeletonTheme } from "react-loading-skeleton"

import "react-loading-skeleton/dist/skeleton.css"
import 'react-tabs/style/react-tabs.css';

const getLibrary = (provider) => {
  const library = new ethers.providers.Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}


const GlobalStyle = createGlobalStyle`
  html,
  body {
    padding: 0;
    margin: 0; 
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    color: white;
    background: -webkit-linear-gradient(to right, #4834d4, #341f97);
    background: -webkit-linear-gradient(left, #4834d4, #341f97);
    background: linear-gradient(to right, #4834d4, #341f97);
    background: #03091f;
    background-size: 100%;
    min-height: 100vh;
    --main-color: #242582;
    --secondary-color: #553D67;
    --logo-color: #F64C72;
    --text-color: #99738E;
    --bg-color: #2F2FA2;
  }

  a {
    color: inherit;
    text-decoration: none;
    :hover {
      text-decoration: underline;
    }
  }

  * {
    box-sizing: border-box;
  }

`;


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <SkeletonTheme highlightColor="#ccc">
        <GlobalStyle />
        <App />
      </SkeletonTheme>
    </Web3ReactProvider>

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
