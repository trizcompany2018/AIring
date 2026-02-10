import MainHeader from "../MainHeader/MainHeader";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";
import Footer from '../Footer/Footer.js'
import ReactMarkdown from 'react-markdown'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useRef } from "react";

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
  width: 80vw;
`;


const Box = styled.div`
  width: 80vw;
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
  width: 80vw;
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
width: 70vw;
font-family: "Pretendard";
font-size: 14px;
  white-space: pre-wrap;      /* 줄바꿈 유지 + 자동 줄바꿈 */
  word-break: break-word;     /* 긴 단어도 강제 줄바꿈 */
  overflow-wrap: break-word;  /* 브라우저 호환 */


`
const ScriptPage = ({onLogout}) => {
    const location = useLocation();
    const navigate = useNavigate();

    const scriptRef = useRef(null);

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

    // ✅ PDF 다운로드 함수
    const handleDownloadPDF = async () => {
        const element = scriptRef.current;
        if (!element) return;

        try {
            // 1. HTML 요소를 캔버스로 변환
            const canvas = await html2canvas(element, {
                scale: 2, // 해상도 높임
                useCORS: true,
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            
            // 2. PDF 생성 (A4 사이즈 기준)
            const pdf = new jsPDF('p', 'mm', 'a4');

            const margin = 20;
            const imgWidth = 210 - (margin*2); // A4 가로 mm
            const pageHeight = 297; // A4 세로 mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = margin;

            // 3. 첫 페이지 추가
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // 4. 내용이 길어 페이지가 넘어갈 경우 대응
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // 5. 파일 저장
            pdf.save('방송대본.pdf');
        } catch (error) {
            console.error("PDF 생성 중 오류 발생:", error);
            alert("PDF 다운로드에 실패했습니다.");
        }
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
                        <ScriptContainer ref={scriptRef} style={{ backgroundColor: '#fff', padding: '20px' }}>
                            <ScriptHeader>📝 생성된 방송 대본</ScriptHeader>
                            <TextBox><ReactMarkdown>{script}</ReactMarkdown></TextBox>
                        </ScriptContainer>

                    </Box>


                    <FormActions>
                        <BtnPrimary onClick={handleDownloadPDF}>PDF 다운</BtnPrimary>
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
