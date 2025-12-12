
import "../App.css";
import styled from "styled-components";
import NavBar from "./NavBar/NavBar";

import BodyBox from "./BodyBox";



const Page = styled.div`
  min-height: 100vh;
  display: flex;

`;

const Container = styled.div`

width: calc(100vw - 80px);


`


const MainBody = ({ onLogout }) => {


    return (
        <Page>
            <NavBar />
            <Container>
                <BodyBox onLogout={onLogout} />
            </Container>
        </Page>
    );
}

export default MainBody;