
import Container from "./components/container";
import { Flex, Box } from "reflexbox"
import { Button } from "./components/button"

import Header from "./components/header"
import Jumbotron from "./components/jumbotron";
import MainPanel from "./components/main";

function App() {
  return (
    <>
     <Header/>
     <Jumbotron/>
     <MainPanel/>
    </>
  );
}

export default App;
