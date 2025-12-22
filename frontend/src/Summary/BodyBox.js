import styled from 'styled-components'
import Overlay from "../MainBody/Overlay";
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
                setError("요약본 생성에 실패했습니다.");
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

            <TitleBox text="제품 정보가 포함된 PDF를 업로드하면 AI가 제품 정보 요약본을 자동으로
                    생성해 드립니다."/>

            <Main>
                <BoxWrapper>
                    <Box>


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