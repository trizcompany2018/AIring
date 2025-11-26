import Logo from "./main_logo.png";
import Logout from "./logout.png";
import styled from "styled-components";

const ContainerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
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
const MainHeader = () => {
  return (
    <ContainerHeader>
      <Image src={Logo} />
      <LogoutContainer>
        <LogoutImage src={Logout} />
      </LogoutContainer>
    </ContainerHeader>
  );
};

export default MainHeader;
