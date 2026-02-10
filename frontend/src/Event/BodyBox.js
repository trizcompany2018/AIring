import styled from 'styled-components'
import Overlay from "../MainBody/Overlay";
import TitleBox from "../TitleBox/Titlebox";
import Footer from '../Footer/Footer.js'
import Cloud from '../upload.png'
import MainHeader from "../MainHeader/MainHeader";
import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const Form = styled.form`
  display: flex;
  flex-direction: column;

`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;

`;

const FormLabel = styled.label`
  font-size: 24px;
  font-weight: 700; /* Bold (Medium 없음) */
  color: #374151;
    margin-bottom: 15px;
`;


const SelectControl = styled.select`
  height: 48px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 400;
`;


const BoxWrapper = styled.div`
  position: relative;
`;


const BoxContainer = styled.div`

display: flex;
flex-direction: column;
align-tiems: center;

`
const Main = styled.div`

  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 48px;
`;

const Box = styled.div`
  width: 80vw;
  background: #fff;
  border-radius: 20px;
  padding-left: 40px; 
  padding-right: 40px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
  border: 2px solid #05DA88;
  display: flex;
  flex-direction: column;
padding-top: 40px;
`;


const UploadBox = styled.div`
  border-radius: 16px;
  border: 2px dashed #22c55e;
  background: #eafff1;
  text-align: center;
  padding: 24px;
`;
const UploadIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
`;

const UploadText = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: #047857;
`;

const FormActions = styled.div`
  display: flex;
  gap: 20px;
    padding-bottom: 40px;
    padding-top: 40px;
  align-items: center;
  justify-content: center;
`;

const BtnPrimary = styled.div`
  width: 300px;
  height: 48px;
  border-radius: 10px;
  border: none;
  font-size: 15px;
  cursor: pointer;
  background: #00E673;
  color: #fff;
  font-weight: 700; /* Bold */
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BtnSecondary = styled.div`

  border-radius: 10px;
  border: none;
  font-size: 15px;
  cursor: pointer;
  width: 300px;
  height: 48px;

  background: #BBBBBB;
  color: #fff;
  font-weight: 400;
    display: flex;
  align-items: center;
  justify-content: center;
`;

const FileBox = styled.input`

display: none;

`

const BodyBox = ({ onLogout }) => {

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [eventType, setEventType] = useState('')

    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const handleUploadBoxClick = () => {
        fileInputRef.current.click();
    };

    // 파일 선택 처리
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
            setError("");
        } else {
            setError("PDF 파일만 업로드 가능합니다.");
            setFile(null);
        }
    };

    //대본 생성 요청
    const generateScript = async () => {
        if (!file) {
            setError("PDF 파일을 선택해주세요.");
            return;
        }

        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("pdf", file);

        try {
            const response = await axios.post(
                "https://airing-eabn.onrender.com/api/generate-summary",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                const scriptText = response.data.summary || "";
                navigate("/result", { state: { script: scriptText } });
                console.log("FULL RESPONSE:", response.data);
            } else {
                setError(response.data.error || "요약본 생성에 실패했습니다.");
            }
        } catch (err) {
            // 2. HTTP 에러 (400, 500 등) 발생 시 서버의 응답 메시지 추출
            let serverErrorMessage = "서버 연결에 실패했습니다.";

            if (err.response) {
                // 서버가 응답을 보냈으나 2xx 범위를 벗어난 경우 (예: 400, 504, 500)
                console.log("SERVER ERROR DATA:", err.response.data);
                serverErrorMessage = err.response.data.error || err.response.data.details || `서버 오류 (${err.response.status})`;
            } else if (err.request) {
                // 요청은 나갔으나 응답을 받지 못한 경우 (네트워크 타임아웃 등)
                serverErrorMessage = "서버로부터 응답이 없습니다. 네트워크 상태를 확인해주세요.";
            } else {
                // 설정 과정에서 에러가 발생한 경우
                serverErrorMessage = err.message;
            }

            setError(serverErrorMessage);
            console.error("FULL ERROR OBJECT:", err);




        } finally {
            setLoading(false);
        }
    };


    // 초기화
    const handleReset = () => {
        setFile(null);
        setError("");
        // 파일 input 초기화
        const fileInput = document.getElementById("file-input");
        if (fileInput) fileInput.value = "";
    };

    return (
        <BoxContainer>
            <MainHeader onLogout={onLogout} page="main_w" />

            <TitleBox title="라이브 방송 이벤트 생성" text="제품 정보가 포함된 PDF를 업로드하면 AI가 제품 정보 기반 이벤트를 생성합니다" />

            <Main>
                <BoxWrapper>
                    <Box>
                        <Form>
                            <FormRow>
                                <FormGroup>
                                    <FormLabel>방송 카테고리</FormLabel>
                                    <SelectControl
                                        value={eventType}
                                        onChange={(e) => setEventType(e.target.value)}
                                    >
                                        <option value="방송 한정 사은품 제공">방송 한정 사은품 제공</option>
                                        <option value="선착순 구매 인증 이벤트">선착순 구매 인증 이벤트</option>
                                        <option value="추첨 이벤트">추첨 이벤트</option>
                                        <option value="댓글 소통왕 이벤트">댓글 소통왕 이벤트</option>
                                        <option value="리뷰 이벤트">리뷰 이벤트</option>
                                    </SelectControl>
                                </FormGroup>


                            </FormRow>
                        </Form>

                        {/* PDF 업로드 영역 */}

                        <UploadBox onClick={handleUploadBoxClick}>

                            <FileBox
                                ref={fileInputRef}

                                id="file-input"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="file-input"
                            />
                            {file ? (
                                <div>
                                    <p>📄 선택된 파일:</p>
                                    <p className="file-name">{file.name}</p>
                                </div>
                            ) : (
                                <div>
                                    <UploadIcon src={Cloud} />
                                    <UploadText>
                                        PDF 파일을 업로드 하거나 여기로 드래그 하세요.
                                    </UploadText>
                                </div>)}
                        </UploadBox>

                        <FormActions>
                            <BtnPrimary
                                onClick={generateScript}
                                disabled={!file || loading}
                                className="generate-btn"
                            >
                                {loading ? "요약 중... (약 2분 소요)" : "요약하기"}
                            </BtnPrimary>
                            <BtnSecondary onClick={handleReset} className="reset-btn">
                                초기화하기
                            </BtnSecondary>
                        </FormActions>

                        {error && <div className="error-message">⚠️ {error}<br /><br /></div>}

                    </Box>
                    {loading && <Overlay />}
                </BoxWrapper>
            </Main>
            <Footer colour="#09CE74" />
        </BoxContainer>



    )



}

export default BodyBox;