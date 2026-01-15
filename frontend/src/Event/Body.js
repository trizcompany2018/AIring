
import "../App.css";
import styled from "styled-components";
import NavBar from "../MainBody/NavBar/NavBar";
import BodyBox from "./BodyBox";



const Page = styled.div`
  min-height: 100vh;
  display: flex;

`;

const Container = styled.div`

width: calc(100vw - 80px);


`


const Body = ({ onLogout }) => {


    return (
        <Page>
            <NavBar />
            <Container>
                <BodyBox onLogout={onLogout} />
            </Container>
        </Page>
    );
}

export default Body;