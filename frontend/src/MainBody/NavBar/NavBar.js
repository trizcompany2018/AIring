import styled from 'styled-components'
import menu from './menu.png'
import schedule from './icon_Schedule.png'
import writing from './icon_Writing_on.png'
import gemini from './Vector.png'
import gpt from './ChatGPT-Logo 1.png'
import document from './document.png'
import lab from './tube.png'
import pdfimg from './pdfimg.png'
import logo from '../../MainHeader/white_logo2.png'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const NavContainer = styled.div`

 width: ${({ isOpen }) => (isOpen ? "240px" : "80px")};
background-color: #00C86E;
display: flex;
flex-direction: column;
align-items: center;
transition: width 0.3s ease;

`
const MenuContainer = styled.div`

height: 50px;
 width: ${({ isOpen }) => (isOpen ? "240px" : "80px")};
display: flex;
align-items: center;
margin-bottom: 25px;
cursor: pointer;

`
const MenuIcon = styled.img`

width: 24px;
margin-left: 28px;
margin-right: 28px;

`
const Text = styled.div`

width: 100px;
display: flex;
align-items: center;
justify-content: left;
color: #B3FFD2;
font-weight: 500;
font-size: 18px;

`

const LogoImage = styled.img`

  height: 28px;

`

const NavBar = () => {

    const [clickState, setClickState] = useState(true);
    const navigate = useNavigate();

    const handleClick = () => {
        setClickState(!clickState)
    }

    const handleSummaryClick = () => {

        navigate('/summary');

    }
    const handleWritingClick = () => {
        navigate('/main')

    }

    const handleGemini = () => {
        window.open("https://gemini.google.com/?hl=ko", "_blank", "noopener,noreferrer");
    }

    const handleGPT = () => {
        window.open("https://chatgpt.com/", "_blank", "noopener,noreferrer");

    }

    const handleImageFX = () => {

        window.open("https://labs.google/fx/ko/tools/image-fx", "_blank", "noopener,noreferrer");
    }

    const handleNotebookLM = () =>{

        window.open("https://notebooklm.google/?hl=ko", "_blank", "noopener,noreferrer")
    }

    return (

        <NavContainer isOpen={clickState}>
            <MenuContainer isOpen={clickState} onClick={handleClick}>
                <MenuIcon src={menu} />
                {clickState ? <Text><LogoImage src={logo} /></Text> : null}
            </MenuContainer>
            <MenuContainer isOpen={clickState} onClick={handleSummaryClick}>
                <MenuIcon src={document} />
                {clickState ? <Text>Summary</Text> : null}
            </MenuContainer>
            <MenuContainer isOpen={clickState} onClick={handleWritingClick}>
                <MenuIcon src={writing} />
                {clickState ? <Text>Writing</Text> : null}
            </MenuContainer>
            <MenuContainer isOpen={clickState}>
                <MenuIcon src={schedule} />
                {clickState ? <Text>Schedule</Text> : null}
            </MenuContainer>
            <MenuContainer isOpen={clickState} onClick={(handleGemini)}>
                <MenuIcon src={gemini} />
                {clickState ? <Text>Nanobanana</Text> : null}
            </MenuContainer>
            <MenuContainer isOpen={clickState} onClick={(handleGPT)}>
                <MenuIcon src={gpt} />
                {clickState ? <Text>ChatGPT</Text> : null}
            </MenuContainer>
            <MenuContainer isOpen={clickState} onClick={(handleImageFX)}>
                <MenuIcon src={lab} />
                {clickState ? <Text>ImageFX</Text> : null}
            </MenuContainer>
            <MenuContainer isOpen={clickState} onClick={(handleNotebookLM)}>
                <MenuIcon src={pdfimg} />
                {clickState ? <Text>NotebookLM</Text> : null}
            </MenuContainer>
        </NavContainer>



    )

}

export default NavBar;