import styled from "styled-components";
import Logo from '../MainHeader/logo.png'
import LoginIcon from './login_icon.png'
import { Navigate, useNavigate } from "react-router-dom";


const Container = styled.div`

width: 100vw;
height: 100vh;
background-color: #f4f0e7;
display: flex;
align-items: center;
justify-content: center;
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

height: 120px;

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
  border: 2px solid #26d481;
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


const Login = ({onLogin}) => {

    const navigate = useNavigate();

    const handleLogin = () => {

        onLogin();
        navigate('/main')

    }

    return (
        <Container>
            <Header>
                <LogoImage src={Logo} />
            </Header>
            <Main>
                <LoginField>
                    <LoginInput placeholder="비밀번호를입력해주세요" />
                    <LoginBtn  onClick={handleLogin}>
                        <LoginImage src={LoginIcon} />
                    </LoginBtn>
                </LoginField>
            </Main>

        </Container>
    )



}

export default Login;