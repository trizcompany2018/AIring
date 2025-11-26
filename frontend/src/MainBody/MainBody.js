import { useState, useRef } from "react";
import axios from "axios";
import "../App.css";
import styled from "styled-components";
import Cloud from '../upload.png'
import MainHeader from "../MainHeader/MainHeader";
import RoadingIcon from './roadingmotion.gif'

const BoxWrapper = styled.div`
  position: relative;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4); /* 회색 반투명 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 20px;
  pointer-events: all;
`;

const Loading  = styled.img`

width: 200px;

`

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;
const Main = styled.div`

  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 48px;

`;


const BoxContainer = styled.div`

width: 100vw;
display: flex;
justify-content: center;
align-items: center;


`


const BoxHeader = styled.div`
    width: 90vw;

`;

const Footer = styled.div`
  text-align: center;
  padding: 16px 0 24px;
  font-size: 12px;
  font-weight: 400;
  color: #f9fafb;
`;
const Box = styled.div`
  width: 90vw;
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
const PageTitle = styled.p`
  font-size: 40px;
  font-weight: 700; /* Bold */
  margin-bottom: 8px;
`;

const PageSubTitle = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: #4b5563;
`;

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

const FormControl = styled.input`
  height: 48px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 400;
`;

const SelectControl = styled.select`
  height: 48px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 400;
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

const MainBody = ({ onLogout }) => {
    const [file, setFile] = useState(null);
    const [script, setScript] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);
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

    // 대본 생성 요청
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
                "https://airing-eabn.onrender.com/api/generate-script",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                setScript(response.data.script);
            } else {
                setError("대본 생성에 실패했습니다.");
            }
        } catch (err) {
            setError(
                "서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요."
            );
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 초기화
    const handleReset = () => {
        setFile(null);
        setScript("");
        setError("");
        // 파일 input 초기화
        const fileInput = document.getElementById("file-input");
        if (fileInput) fileInput.value = "";
    };

    return (
        <Page>
            <MainHeader onLogout={onLogout} />

            <BoxContainer>
                <BoxHeader>
                    <PageTitle>라이브 방송 대본 생성</PageTitle>
                    <PageSubTitle>
                        제품 정보가 포함된 PDF를 업로드하면 AI가 방송 대본을 자동으로
                        생성해 드립니다.
                    </PageSubTitle>
                </BoxHeader>
            </BoxContainer>
            <Main>
                <BoxWrapper>
                <Box>
                    <Form>
                        <FormGroup>
                            <FormLabel>강조 포인트</FormLabel>
                            <FormControl
                                id="highlight"
                                type="text"
                                placeholder="예시 : 라이브 환경 설명, 사용 편의성 강조"
                            />
                        </FormGroup>
                        <FormGroup>
                            <FormLabel>사용 지양 언어</FormLabel>
                            <FormControl
                                id="avoid-language"
                                type="text"
                                placeholder="예시 : 라이브 환경 설명, 사용 편의성 강조"
                            />
                        </FormGroup>
                    </Form>

                    <FormRow>
                        <FormGroup>
                            <FormLabel>방송톤</FormLabel>
                            <SelectControl>
                                <option>기본</option>
                                <option>간결</option>
                                <option>격식</option>
                            </SelectControl>
                        </FormGroup>
                        <FormGroup>
                            <FormLabel>사용모델</FormLabel>
                            <SelectControl>
                                <option>ChatGPT-4</option>
                                <option>Gemini</option>
                                <option>Claude</option>
                            </SelectControl>
                        </FormGroup>
                    </FormRow>

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
                                {loading ? "생성 중... (약 2분 소요)" : "대본 생성하기"}
                            </BtnPrimary>
                            <BtnSecondary onClick={handleReset} className="reset-btn">
                                초기화하기
                            </BtnSecondary>
                        </FormActions>

                        {error && <div className="error-message">⚠️ {error}</div>}


                    {/* 생성된 대본 표시 영역 */}
                    {script && (
                        <div className="script-section">
                            <h2>📝 생성된 방송 대본</h2>
                            <div className="script-box">
                                <pre>{script}</pre>
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(script);
                                    alert("대본이 클립보드에 복사되었습니다!");
                                }}
                                className="copy-btn"
                            >
                                📋 대본 복사하기
                            </button>
                        </div>
                    )}
                </Box>
                {loading && (
                    <Overlay>
                        <Loading src={RoadingIcon} />
                    </Overlay>
                )}
                </BoxWrapper>
            </Main>
            <Footer>© 2025. Triz co. All rights reserved.</Footer>
        </Page>
    );
}

export default MainBody;