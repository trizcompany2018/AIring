import styled, { keyframes } from "styled-components";
import Logo from './main_motion.gif'
import LoginIcon from './login_icon.png'
import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import Footer from "../Footer/Footer";
import MainHeader from "../MainHeader/MainHeader";

const Container = styled.div`

width: 100vw;
min-height: 100vh;
background-color: #f4f0e7;
display: flex;
align-items: center;
justify-content: space-between;
flex-direction: column;

`
const Header = styled.div`

width: 100vw;
display: flex;
align-items: center;
justify-content: center;
padding-bottom: 30px;

`
const LogoImage = styled.img`

width: 385px;

`
const Main = styled.main`
display: flex;
align-items: center;
justify-content: center;

`
const LoginField = styled.div`
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 999px;
   border: 2px solid ${({ $isError }) => ($isError ? '#da1705' : '#26d481')};
   animation: ${({ $isError }) => ($isError ? shake : 'none')} 0.4s ease;
  max-width: 420px;
  width: 100%;
  padding: 0 4px 0 24px;
  box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.15);


`

const LoginInput = styled.input`
  width: 760px;
  height: 52px;
  border: none;
  outline: none;
  font-size: 16px;



`

const LoginBtn = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  padding: 0 12px;

`
const LoginImage = styled.img`

width: 26px;
height: 26px;

`

const shake = keyframes`
  0% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
  100% { transform: translateX(0); }
`;

const LoginBox = styled.div`


display: flex;
flex-direction: column;
align-items: center;
justify-content: center;


`

const Login = ({ onLogin }) => {

    const navigate = useNavigate();
    const CORRECT_PASSWORD = "1q2w3e4r!";
    const [password, setPassword] = useState('');
    const [isError, setIsError] = useState(false);
    const [defaultholder, setDefaultholder] = useState("비밀번호를 입력해주세요");

    const handleLogin = () => {

        setIsError(false);

        if (password === CORRECT_PASSWORD) {
            setIsError(false);
            onLogin();
            navigate('/main');
        } else {
            // 비밀번호 틀렸을 때
            setPassword("")
            setDefaultholder("비밀번호가 틀렸습니다")
            setIsError(true);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    const handleChange = (e) => {
        setPassword(e.target.value);
        // ✅ 사용자가 다시 입력 시작하면 에러 상태 해제
        if (isError) setIsError(false);

    }

    const onLogout = () => {

    }

    return (
        <Container>
            <MainHeader onLogout={onLogout} page="login"/>
            <LoginBox>
                <Header>
                    <LogoImage src={Logo} />
                </Header>
                <Main>
                    <LoginField $isError={isError}>
                        <LoginInput placeholder={defaultholder}
                            type="password"
                            value={password}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            $isError={isError} />
                        <LoginBtn onClick={handleLogin}>
                            <LoginImage src={LoginIcon} />
                        </LoginBtn>
                    </LoginField>
                </Main>
            </LoginBox>
            <Footer colour="8F8F8F" />
        </Container>
    )



}

export default Login;