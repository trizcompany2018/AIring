import Logo from "./main_logo2.png";
import WhiteLogo from "./white_logo2.png"
import TrizLogo from './triz.png'
import Logout from "./logout.png";
import Group from './Group.png'
import styled from "styled-components";

import { useNavigate } from "react-router-dom";

const ContainerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
  width: 100vw;
  
`;
const Image = styled.img`
  height: 28px;
`;
const LogoutContainer = styled.div`
  background-color: red;
  border: none;
  background: none;
  cursor: pointer;
  background-color: white;
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
const MainHeader = ({ onLogout, page }) => {

  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();        // 로그인 상태 초기화
    navigate('/');     // 로그인 페이지로 이동
  };


  return (
    <ContainerHeader>
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
    </ContainerHeader>
  );
};

export default MainHeader;
