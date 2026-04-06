import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import MainHeader from "../MainHeader/MainHeader";
import Footer from '../Footer/Footer.js';
import * as S from './ScriptPage.styles';
import InputContainer from "../MainBody/InputContainer.js";

const ScriptPage = ({ onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const scriptRef = useRef(null);
    const [clickState, setClickState] = useState(false);
    const anchrRef1 = useRef(null);
    const anchrRef2 = useRef(null);

    // ✅ 상위에서 넘겨준 script
    const script = location.state?.script || "";
    // script 생성 작업인지, 제품 요약 작업인지 확인하기
    const status = location.state?.status || "";

    // 첫 접속 시 가장 상단으로 스크롤
    useEffect(() => {
        setClickState(false);
        window.scrollTo(0, 0);
    }, [script])

    useEffect(() => {
        // 로딩될때까지 약간 텀 주기
        const timer = setTimeout(() => {
            if (clickState === true) {
                // 페이지 중간으로 이동(대본 생성 input box 입력용)
                anchrRef2.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                // 페이지 상단으로 이동(요약본 확인용)
                anchrRef1.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [clickState]);

    // script 없이 직접 /result 들어오면 홈으로 돌려보내기
    if (!script) {
        navigate("/", { replace: true });
        return null;
    }

    // 전체 복사하기
    const handleCopy = () => {
        navigator.clipboard
            .writeText(script)
            .then(() => alert("대본이 클립보드에 복사되었습니다!"))
            .catch((err) => {
                console.error(err);
                alert("복사에 실패했습니다. 브라우저 권한을 확인해주세요.");
            });
    };

    const handleGenerateButtonClick = () => {
        setClickState(!clickState);
    };

    // PDF 다운로드 함수
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


    // 이전 페이지로 돌아가기
    const handleBack = () => {
        navigate('/summary');
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
                <div ref={anchrRef1} style={{ height: '1px' }} />
                <S.Main>
                    <S.Box showFull={!clickState}>
                        <S.ScriptContainer ref={scriptRef} style={{ backgroundColor: '#fff', padding: '20px' }}>
                            <S.ScriptHeader>
                                {status === "script" ? "📝 생성된 방송 대본" : "📝 생성된 방송 요약본"}
                            </S.ScriptHeader>
                            <S.TextBox>
                                <ReactMarkdown>{script}</ReactMarkdown>
                            </S.TextBox>
                        </S.ScriptContainer>
                    </S.Box>
                    <S.FormActions>
                        {/* PDF 다운로드 버튼 */}
                        {status === "script" ? (
                            <S.BtnPrimary onClick={handleDownloadPDF}>PDF 다운</S.BtnPrimary>
                        ) : (
                            <S.BtnSecondary onClick={handleDownloadPDF}>PDF 다운</S.BtnSecondary>
                        )}
                        {/* 복사하기 / 대본생성 버튼 */}
                        {status === "script" ? (
                            <S.BtnPrimary onClick={handleCopy}>복사하기</S.BtnPrimary>
                        ) : (
                            clickState ? (<S.BtnPrimary onClick={handleGenerateButtonClick}>접기</S.BtnPrimary>) : (<S.BtnPrimary onClick={handleGenerateButtonClick}>대본생성</S.BtnPrimary>)
                        )}
                        <S.BtnSecondary onClick={handleBack}>이전</S.BtnSecondary>
                    </S.FormActions>
                    <div ref={anchrRef2} style={{ height: '1px' }} />
                    {/* 클릭 여부 따라 대본 데이터 입력창 접기/펼치기 */}
                    {clickState && <InputContainer summary="summary" info={script} />}
                </S.Main>
                <Footer />
            </S.Page>
        </S.Container>
    );
};

export default ScriptPage;