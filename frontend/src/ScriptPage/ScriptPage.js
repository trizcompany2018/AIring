import MainHeader from "../MainHeader/MainHeader";
import * as S from './ScriptPage.styles.js'
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";
import Footer from '../Footer/Footer.js'
import ReactMarkdown from 'react-markdown'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useRef } from "react";


const ScriptPage = ({ onLogout }) => {
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
            const imgWidth = 210 - (margin * 2); // A4 가로 mm
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
        <S.Container>
            <MainHeader onLogout={onLogout} page="main_g" />
            <S.Page>
                <S.BoxContainer>
                    <S.BoxHeader>
                        <S.PageTitle>라이브 방송 대본 생성</S.PageTitle>
                        <S.PageSubTitle>생성된 대본을 확인하고 복사할 수 있습니다.</S.PageSubTitle>
                    </S.BoxHeader>
                </S.BoxContainer>

                <S.Main>
                    <S.Box>
                        <S.ScriptContainer ref={scriptRef} style={{ backgroundColor: '#fff', padding: '20px' }}>
                            <S.ScriptHeader>📝 생성된 방송 대본</S.ScriptHeader>
                            <S.TextBox><ReactMarkdown>{script}</ReactMarkdown></S.TextBox>
                        </S.ScriptContainer>

                    </S.Box>
                    <S.FormActions>
                        <S.BtnPrimary onClick={handleDownloadPDF}>PDF 다운</S.BtnPrimary>
                        <S.BtnPrimary onClick={handleCopy}>복사하기</S.BtnPrimary>
                        <S.BtnSecondary onClick={handleBack}>이전</S.BtnSecondary>
                    </S.FormActions>
                </S.Main>
                <Footer />
            </S.Page>
        </S.Container>
    );
};

export default ScriptPage;
