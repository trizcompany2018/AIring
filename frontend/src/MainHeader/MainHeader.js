import Logo from "./main_logo2.png";
import WhiteLogo from "./logo2.png"
import TrizLogo from './triz.png'
import Logout from "./logout.png";
import Group from './Group.png'
import styled from "styled-components";

import { useNavigate } from "react-router-dom";

const ContainerHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
background-color: ${({ page }) => (page === "login" ? "#F4F1EB" : "white")};
height: 50px;
  
`;
const Image = styled.img`
  height: 28px;
`;
const LogoutContainer = styled.div`
  border: none;
  background: none;
  cursor: pointer;
  background-color: #F4F1EB;
  border-radius: 100%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const LogoutImage = styled.img`
  width: 20px;
  height: 20px;
`;
const Header = styled.div`

  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80vw;

`
const MainHeader = ({ onLogout, page }) => {

  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();        // 로그인 상태 초기화
    navigate('/');     // 로그인 페이지로 이동
  };


  return (
    <ContainerHeader page={page}>
      <Header>
      {page === "main_w" ? (
        <Image src={WhiteLogo} /> 
      ) : page === "main_g" ? (
        <Image src={Logo} />  
      ) : (
        <Image src={TrizLogo} />
      )}
      <LogoutContainer onClick={handleLogout}>
        {page == "login" ?<LogoutImage src={Group} />  :<LogoutImage src={Logout} /> }
      </LogoutContainer>
      </Header>
    </ContainerHeader>
  );
};

export default MainHeader;
