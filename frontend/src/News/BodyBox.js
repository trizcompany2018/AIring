import styled from 'styled-components';
import Overlay from "../MainBody/Overlay";
import TitleBox from "../TitleBox/Titlebox";
import Footer from '../Footer/Footer.js';
import Cloud from '../upload.png';
import MainHeader from "../MainHeader/MainHeader";
import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// --- 스타일 컴포넌트 시작 ---
const BoxWrapper = styled.div`
  position: relative;
`;

const BoxContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; /* 오타 수정: align-tiems -> align-items */
`;

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
  cursor: pointer;
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

const BtnPrimary = styled.button` /* div에서 button으로 변경하여 disabled 속성 활용 */
  width: 300px;
  height: 48px;
  border-radius: 10px;
  border: none;
  font-size: 15px;
  cursor: pointer;
  background: #00E673;
  color: #fff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  &:disabled {
    background: #a7f3d0;
    cursor: not-allowed;
  }
`;

const BtnSecondary = styled.button` /* div에서 button으로 변경 */
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
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.col || 3}, 1fr);
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
`;

const FormLabel = styled.label`
  font-size: 18px; /* 너무 크지 않게 살짝 조절 */
  font-weight: 700;
  color: #374151;
  margin-bottom: 10px;
`;

const FormControl = styled.input`
  height: 48px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 400;
  &:focus {
    outline: none;
    border-color: #05DA88;
  }
`;

const SelectControl = styled.select`
  height: 48px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 400;
  &:focus {
    outline: none;
    border-color: #05DA88;
  }
`;
// --- 스타일 컴포넌트 끝 ---

const BodyBox = ({ onLogout }) => {
    // 상태 관리 (파일 + 사용자가 입력할 2가지 정보)
    const [file, setFile] = useState(null);
    const [tone, setTone] = useState('기본');
    const [info, setInfo] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleUploadBoxClick = () => {
        fileInputRef.current.click();
    };

    // 파일 선택 처리 (PDF, 이미지 허용)
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        const allowedTypes = ["application/pdf", "image/png", "image/jpg", "image/jpeg"];
        if (selectedFile && allowedTypes.includes(selectedFile.type)) {
            setFile(selectedFile);
            setError("");
        } else {
            setError("PDF, png, jpg, jpeg 파일만 업로드 가능합니다.");
            setFile(null);
        }
    };

    // 보도자료 생성 요청
    const generateScript = async () => {
        if (!file) {
            setError("PDF/이미지(png, jpg, jpeg) 파일을 선택해주세요.");
            return;
        }

        setLoading(true);
        setError("");

        // 전송할 데이터 포장 (파일 + 톤 + 추가요청사항)
        const formData = new FormData();
        formData.append("pdf", file);
        formData.append("tone", tone);
        formData.append("info", info);

        try {
            const response = await axios.post(
                "https://airing-eabn.onrender.com/api/generate-press-release", // 💡 보도자료용 엔드포인트
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                // 백엔드에서 넘겨주는 데이터 키(summary) 확인 후 라우팅
                const scriptText = response.data.summary || "";
                navigate("/result", { state: { script: scriptText } });
                console.log("FULL RESPONSE:", response.data);
            } else {
                setError("보도자료 생성에 실패했습니다.");
            }
        } catch (err) {
            setError("서버 연결에 실패했습니다. 타임아웃이 발생했거나 서버가 꺼져있는지 확인해주세요.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 초기화 기능
    const handleReset = () => {
        setFile(null);
        setTone('기본');
        setInfo('');
        setError("");
        const fileInput = document.getElementById("file-input");
        if (fileInput) fileInput.value = "";
    };

    return (
        <BoxContainer>
            <MainHeader onLogout={onLogout} page="main_w" />

            <TitleBox
                title="보도자료 초안 생성 페이지"
                text="사업 내용이 포함된 문서를 업로드하고 톤앤매너를 설정하면 보도자료 초안을 작성합니다."
            />

            <Main>
                <BoxWrapper>
                    <Box>
                        {/* 1. 입력 폼 영역 (톤, 추가요청) */}
                        <Form>
                            <FormRow col={2}>
                                <FormGroup>
                                    <FormLabel>보도자료 톤</FormLabel>
                                    <SelectControl
                                        value={tone}
                                        onChange={(e) => setTone(e.target.value)}
                                    >
                                        {/* 💡 백엔드 조건문에 맞게 value 값을 한글로 수정 */}
                                        <option value="기본">기본</option>
                                        <option value="간결">간결 (핵심 위주)</option>
                                        <option value="격식">격식 (정중하고 공식적인 느낌)</option>
                                    </SelectControl>
                                </FormGroup>
                                <FormGroup>
                                    <FormLabel>추가 요청 사항</FormLabel>
                                    <FormControl
                                        id="info"
                                        type="text"
                                        placeholder="예시 : 정량적인 수치 강조, 제목 20자 이내 등"
                                        value={info}
                                        onChange={(e) => setInfo(e.target.value)}
                                    />
                                </FormGroup>
                            </FormRow>
                        </Form>

                        {/* 2. 파일 업로드 영역 */}
                        <UploadBox onClick={handleUploadBoxClick}>
                            <FileBox
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
                                    <p className="file-name" style={{ fontWeight: 'bold', marginTop: '5px' }}>
                                        {file.name}
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <UploadIcon src={Cloud} />
                                    <UploadText>
                                        문서/이미지 파일을 업로드 하거나 여기로 드래그 하세요.
                                    </UploadText>
                                </div>
                            )}
                        </UploadBox>

                        {/* 3. 버튼 및 에러 표시 영역 */}
                        <FormActions>
                            <BtnPrimary
                                onClick={generateScript}
                                disabled={!file || loading}
                                className="generate-btn"
                            >
                                {loading ? "초안 작성 중... (약 1~2분 소요)" : "보도자료 작성하기"}
                            </BtnPrimary>
                            <BtnSecondary onClick={handleReset} className="reset-btn">
                                전체 초기화
                            </BtnSecondary>
                        </FormActions>

                        {error && (
                            <div className="error-message" style={{ color: '#ef4444', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>
                                ⚠️ {error}
                            </div>
                        )}
                    </Box>
                    {loading && <Overlay />}
                </BoxWrapper>
            </Main>
            <Footer colour="#09CE74" />
        </BoxContainer>
    );
};

export default BodyBox;