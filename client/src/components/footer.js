import React from "react";
import styled from "styled-components";

const TextLink = styled.a`
  color: inherit;
  font-size: 14px;

  :hover {
    cursor: pointer;
    color: white;
  }

  :not(:first-child) {
    margin-left: 10px;
  }

`;

const Container = styled.div`
position: fixed;
left: 0;
bottom: 0;
width: 100%; 
color: white;
text-align: center;
padding: 10px; 
`;

const Footer = () => {
  return (
    <Container>
      <div className="row">
      
        <div className="col-6 col-sm-6">
          Made with ❤️ from <a href="https://tamagonft.xyz">Tamago Labs</a>
        </div>
      </div>

    </Container>
  );
};

export default Footer;
