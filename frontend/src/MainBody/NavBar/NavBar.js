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
import present from './present.png'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Styled Components (기존과 동일)
const NavContainer = styled.div`
  width: ${({ isOpen }) => (isOpen ? "240px" : "80px")};
  background-color: #00C86E;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: width 0.3s ease;
  min-height: 100vh; /* 전체 높이 확보를 위해 추가 */
`
const MenuContainer = styled.div`
  height: 50px;
  width: ${({ isOpen }) => (isOpen ? "240px" : "80px")};
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  cursor: pointer;
  &:hover { background-color: rgba(255, 255, 255, 0.1); } /* 호버 효과 추가 예시 */
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
  const [clickState, setClickState] = useState(false);
  const navigate = useNavigate();

  const toggleNav = () => setClickState(!clickState);

  // 메뉴 데이터 배열화
  const menuItems = [
    { id: 'summary', icon: document, label: 'Summary', onClick: () => navigate('/summary') },
    { id: 'writing', icon: writing, label: 'Writing', onClick: () => navigate('/main') },
    { id: 'schedule', icon: schedule, label: 'Schedule', onClick: null },
    { id: 'event', icon: present, label: 'Event', onClick: () => navigate('/event') },
    { id: 'gemini', icon: gemini, label: 'Nanobanana', onClick: () => window.open("https://gemini.google.com/?hl=ko", "_blank", "noopener,noreferrer") },
    { id: 'gpt', icon: gpt, label: 'ChatGPT', onClick: () => window.open("https://chatgpt.com/", "_blank", "noopener,noreferrer") },
    { id: 'imagefx', icon: lab, label: 'ImageFX', onClick: () => window.open("https://labs.google/fx/ko/tools/image-fx", "_blank", "noopener,noreferrer") },
    { id: 'notebook', icon: pdfimg, label: 'NotebookLM', onClick: () => window.open("https://notebooklm.google/?hl=ko", "_blank", "noopener,noreferrer") },
  ];

  return (
    <NavContainer isOpen={clickState}>
      <MenuContainer isOpen={clickState} onClick={toggleNav}>
        <MenuIcon src={menu} />
        {clickState && (
          <Text>
            <LogoImage src={logo} />
          </Text>
        )}
      </MenuContainer>

      {menuItems.map((item) => (
        <MenuContainer 
          key={item.id} 
          isOpen={clickState} 
          onClick={item.onClick}
        >
          <MenuIcon src={item.icon} />
          {clickState && <Text>{item.label}</Text>}
        </MenuContainer>
      ))}
    </NavContainer>
  );
}

export default NavBar;