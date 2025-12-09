import MainHeader from "../MainHeader/MainHeader";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";
import Footer from '../Footer/Footer.js'


const Container = styled.div`
  min-height: 100vh;
  width: 100vw;
  background-color: #f4f1eb;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

`;

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 48px;
`;

const BoxContainer = styled.div`
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BoxHeader = styled.div`
  width: 90vw;
`;


const Box = styled.div`
  width: 90vw;
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
  border: 2px solid #05da88;
  display: flex;
  flex-direction: column;
  align-items: center;s
  min-height: 10rem;
`;

const PageTitle = styled.p`
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const PageSubTitle = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: #4b5563;
`;

const FormActions = styled.div`
  display: flex;
  gap: 20px;
  padding-bottom: 40px;
  padding-top: 40px;
  align-items: center;
  justify-content: center;
`;

const BtnPrimary = styled.button`
  width: 300px;
  height: 48px;
  border-radius: 10px;
  border: none;
  font-size: 15px;
  cursor: pointer;
  background: #00e673;
  color: #fff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BtnSecondary = styled.button`
  border-radius: 10px;
  border: none;
  font-size: 15px;
  cursor: pointer;
  width: 300px;
  height: 48px;
  background: #bbbbbb;
  color: #fff;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ScriptContainer = styled.div`

font-size: 1rem;

`
const ScriptHeader = styled.div`

font-size: 20px;
font-weight: 800;
margin-bottom: 10px;

`
const TextBox = styled.pre`

margin: 10px;
width: 80vw;
font-family: "Pretendard";
font-size: 14px;

`
const ScriptPage = ({onLogout}) => {
    const location = useLocation();
    const navigate = useNavigate();

    // ✅ 상위에서 넘겨준 script
    const script = location.state?.script || "";

    // script 없이 직접 /result 들어오면 홈으로 돌려보내기
    if (!script) {
        navigate("/", { replace: true });
        return null;
    }

    const handleCopy = () => {
        navigator.clipboard
            .writeText(script)
            .then(() => {
                alert("대본이 클립보드에 복사되었습니다!");
            })
            .catch((err) => {
                console.error(err);
                alert("복사에 실패했습니다. 브라우저 권한을 확인해주세요.");
            });
    };

    const handleBack = () => {
        // 바로 이전 페이지로
        navigate(-1);
        // 또는 항상 업로드 화면으로 가고 싶으면:
        // navigate("/", { replace: true });
    };

    return (
        <Container>
            <MainHeader onLogout={onLogout} page="main_g"/>
            <Page>
                <BoxContainer>
                    <BoxHeader>
                        <PageTitle>라이브 방송 대본 생성</PageTitle>
                        <PageSubTitle>생성된 대본을 확인하고 복사할 수 있습니다.</PageSubTitle>
                    </BoxHeader>
                </BoxContainer>

                <Main>

                    <Box>
                        <ScriptContainer>
                            <ScriptHeader>📝 생성된 방송 대본</ScriptHeader>
                            <TextBox>{script}</TextBox>
                        </ScriptContainer>

                    </Box>


                    <FormActions>
                        <BtnPrimary onClick={handleCopy}>복사하기</BtnPrimary>
                        <BtnSecondary onClick={handleBack}>이전</BtnSecondary>
                    </FormActions>
                </Main>

                <Footer />
            </Page>
        </Container>
    );
};

export default ScriptPage;
