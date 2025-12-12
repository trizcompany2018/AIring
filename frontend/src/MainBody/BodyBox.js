import styled from 'styled-components'
import Overlay from "./Overlay";
import TitleBox from "../TitleBox/Titlebox";
import Footer from '../Footer/Footer.js'
import Cloud from '../upload.png'
import MainHeader from "../MainHeader/MainHeader";
import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BoxWrapper = styled.div`
  position: relative;
`;


const BoxContainer = styled.div`

display: flex;
flex-direction: column;
align-tiems: center;s

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


const BodyBox = ({ onLogout }) => {

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [highlight, setHighlight] = useState('');
    const [avoidLanguage, setAvoidLanguage] = useState('');
    const [tone, setTone] = useState('기본');
    const [model, setModel] = useState('claude-sonnet-4');

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
        formData.append("pdf", file); // 기존 PDF
        formData.append("highlight", highlight);            // 🔥 강조포인트
        formData.append("avoidLanguage", avoidLanguage);    // 🔥 지양 언어
        formData.append("tone", tone);                      // 🔥 방송톤
        formData.append("model", model);                    // 🔥 모델 선택

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
                const scriptText = response.data.script || "";
                navigate("/result", { state: { script: scriptText } });
            } else {
                setError("대본 생성에 실패했습니다.");
            }
        } catch (err) {
            setError("서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 테스트용 임시 api 요청

    const generateTest = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await axios.post(
                "https://airing-eabn.onrender.com/api/test-script",
                { question: "리버풀 FC의 빌 샹클리 이후 역대 감독을 제임 기간과 이룩한 업적과 함께 알려줘" }
            );

            if (response.data.success) {
                const scriptText = response.data.script || "";

                navigate("/result", { state: { script: scriptText } });
            } else {
                setError("대본 생성에 실패했습니다.");
            }
        } catch (err) {
            setError("서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
            console.error(err);
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

            <TitleBox />

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
                                    value={highlight}
                                    onChange={(e) => setHighlight(e.target.value)}
                                />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel>사용 지양 언어</FormLabel>
                                <FormControl
                                    id="avoid-language"
                                    type="text"
                                    placeholder="예시 : 과한 최상급 표현, 경쟁사 비하 표현 지양"
                                    value={avoidLanguage}
                                    onChange={(e) => setAvoidLanguage(e.target.value)}
                                />
                            </FormGroup>
                        </Form>

                        <FormRow>
                            <FormGroup>
                                <FormLabel>방송톤</FormLabel>
                                <SelectControl
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                >
                                    <option value="기본">기본</option>
                                    <option value="간결">간결</option>
                                    <option value="격식">격식</option>
                                </SelectControl>
                            </FormGroup>

                            <FormGroup>
                                <FormLabel>사용모델</FormLabel>
                                <SelectControl
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}>
                                    <option value="claude-sonnet-4">claude-sonnet-4</option>
                                    {/* 나중에 모델 추가하면 option만 늘리면 됨 */}
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

                    </Box>
                    {loading && <Overlay />}
                </BoxWrapper>
            </Main>
            <Footer colour="#09CE74" />
        </BoxContainer>



    )



}

export default BodyBox;