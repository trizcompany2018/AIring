import * as S from './BodyBox.styles.js'
import Overlay from "../MainBody/Overlay";
import TitleBox from "../TitleBox/Titlebox";
import Footer from '../Footer/Footer.js'
import Cloud from '../upload.png'
import MainHeader from "../MainHeader/MainHeader";
import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
        const allowedTypes = ["application/pdf", "image/png", "image/jpg", "image/jpeg"]
        if (selectedFile && allowedTypes.includes(selectedFile.type)) {
            setFile(selectedFile);
            setError("");
        } else {
            setError("PDF, png, jpg, jpeg 파일만 업로드 가능합니다.");
            setFile(null);
        }
    };

    //대본 생성 요청
    const generateScript = async () => {
        if (!file) {
            setError("PDF/이미지(png, jpg, jpeg) 파일을 선택해주세요.");
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
                const statusText = "summary"
                navigate("/result", { state: { script: scriptText, status: statusText } });
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
        <S.BoxContainer>
            <MainHeader onLogout={onLogout} page="main_w" />
            <TitleBox title="제품 정보 요약 페이지"
                text="제품 정보가 포함된 문서(PDF), 이미지(png, jpeg, jpg)를 업로드하면 AI가 제품 정보 요약본을 자동으로 생성해 드립니다." />
            <S.Main>
                <S.BoxWrapper>
                    <S.Box>
                        <S.UploadBox onClick={handleUploadBoxClick}>
                            <S.FileBox
                                ref={fileInputRef}

                                id="file-input"
                                type="file"
                                accept=".pdf, .png, .jpg, .jpeg"
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
                                    <S.UploadIcon src={Cloud} />
                                    <S.UploadText>
                                        문서/이미지 파일을 업로드 하거나 여기로 드래그 하세요.
                                    </S.UploadText>
                                </div>)}
                        </S.UploadBox>

                        <S.FormActions>
                            <S.BtnPrimary
                                onClick={generateScript}
                                disabled={!file || loading}
                                className="generate-btn"
                            >
                                {loading ? "요약 중... (약 2분 소요)" : "요약하기"}
                            </S.BtnPrimary>
                            <S.BtnSecondary onClick={handleReset} className="reset-btn">
                                초기화하기
                            </S.BtnSecondary>
                        </S.FormActions>
                        {error && <div className="error-message">⚠️ {error}</div>}
                    </S.Box>
                    {loading && <Overlay />}
                </S.BoxWrapper>
            </S.Main>
            <Footer colour="#09CE74" />
        </S.BoxContainer>

    )

}

export default BodyBox;