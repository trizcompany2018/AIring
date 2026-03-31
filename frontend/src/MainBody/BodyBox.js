import * as S from './BodyBox.styles.js'
import Overlay from "./Overlay";
import TitleBox from "../TitleBox/Titlebox";
import Footer from '../Footer/Footer.js'
import Cloud from '../upload.png'
import MainHeader from "../MainHeader/MainHeader";
import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const BodyBox = ({ onLogout }) => {

    const [file, setFile] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [highlight, setHighlight] = useState('');
    const [avoidLanguage, setAvoidLanguage] = useState('');
    const [category, setCategory] = useState('');
    const [programtitle, setProgramTitle] = useState('');
    const [tone, setTone] = useState('기본');
    const [model, setModel] = useState('claude-sonnet-4');
    const [MC1, setMC1] = useState('');
    const [MC2, setMC2] = useState('');
    const [liveTime, setLiveTime] = useState('');
    const [session, setSession] = useState('');
    const [liveClock, setLiveClock] = useState('');
    const [quiz, setQuiz] = useState('');
    const [theme, setTheme] = useState('');
    const [formation, setFormation] = useState('');

    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const handleUploadBoxClick = () => {
        fileInputRef.current.click();
    };

    // 파일 선택 처리
    const handleFileChange = (e) => {
        // e.target.files는 여러 파일의 목록(FileList)
        const selectedFiles = Array.from(e.target.files);

        // PDF 파일만 필터링 
        const validFiles = selectedFiles.filter(file => file.type === "application/pdf");

        if (validFiles.length > 0) {
            setFile(validFiles); // 💡 배열 형태로 저장
            setError("");
        } else {
            setError("PDF 파일만 업로드 가능합니다.");
            setFile([]);
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
        // files 배열을 돌면서 같은 "pdf"라는 이름으로 계속 추가함
        file.forEach((file) => {
            formData.append("pdf", file);
        });
        formData.append("highlight", highlight);            // 🔥 강조포인트
        formData.append("avoidLanguage", avoidLanguage);    // 🔥 지양 언어
        formData.append("tone", tone);                      // 🔥 방송톤
        formData.append("model", model);                    // 🔥 모델 선택
        formData.append("category", category);
        formData.append("programtitle", programtitle);
        formData.append("MC1", MC1);
        formData.append("MC2", MC2);
        formData.append("liveTime", liveTime);
        formData.append("liveClock", liveClock);
        formData.append("sesssion", session);
        formData.append("quiz", quiz);
        formData.append("theme", theme);
        formData.append("formation", formation);

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

            <TitleBox title="라이브 방송 대본 생성" text="제품 정보가 포함된 PDF를 업로드하면 AI가 방송 대본을 자동으로
                    생성해 드립니다."/>

            <S.Main>
                <S.BoxWrapper>
                    <S.Box>
                        <S.Form>
                            <S.FormRow col={2}>
                                <S.FormGroup>
                                    <S.FormLabel>방송 카테고리</S.FormLabel>
                                    <S.SelectControl
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="elec">전자</option>
                                        <option value="food">푸드</option>
                                        <option value="fashion">패션</option>
                                        <option value="beauty">뷰티</option>
                                    </S.SelectControl>
                                </S.FormGroup>
                                <S.FormGroup >
                                    <S.FormLabel>방송톤</S.FormLabel>
                                    <S.SelectControl
                                        value={tone}
                                        onChange={(e) => setTone(e.target.value)}
                                    >
                                        <option value="기본">기본</option>
                                        <option value="간결">간결</option>
                                        <option value="격식">격식</option>
                                    </S.SelectControl>
                                </S.FormGroup>

                            </S.FormRow>
                            <S.FormRow col={2}>
                                <S.FormGroup>
                                    <S.FormLabel>방송 테마</S.FormLabel>
                                    <S.FormControl
                                        id="theme"
                                        type="text"
                                        placeholder="예시 : 개강을 앞둔 대학생을 위한 노트북 라이브"
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                    />
                                </S.FormGroup>

                                <S.FormGroup>
                                    <S.FormLabel>인력 구성</S.FormLabel>
                                    <S.SelectControl
                                        value={formation}
                                        onChange={(e) => setFormation(e.target.value)}>
                                        <option value="si">쇼호스트 & 쇼호스트</option>
                                        <option value="ss">쇼호스트 & 인플루언서</option>
                                    </S.SelectControl>
                                </S.FormGroup>
                            </S.FormRow>
                            <S.FormRow>
                                <S.FormGroup>
                                    <S.FormLabel>메인 진행자</S.FormLabel>
                                    <S.FormControl
                                        id="MC1"
                                        type="text"
                                        placeholder="예시 : 잇섭"
                                        value={MC1}
                                        onChange={(e) => setMC1(e.target.value)}
                                    />
                                </S.FormGroup>

                                <S.FormGroup>
                                    <S.FormLabel>서브 진행자</S.FormLabel>
                                    <S.FormControl
                                        id="MC2"
                                        type="text"
                                        placeholder="예시 : 백종원"
                                        value={MC2}
                                        onChange={(e) => setMC2(e.target.value)}
                                    />
                                </S.FormGroup>
                                <S.FormGroup>
                                    <S.FormLabel>프로그램명</S.FormLabel>
                                    <S.FormControl
                                        id="programtitle"
                                        type="text"
                                        placeholder="예시 : 핫IT슈, 백주부의 라방"
                                        value={programtitle}
                                        onChange={(e) => setProgramTitle(e.target.value)}
                                    />
                                </S.FormGroup>
                            </S.FormRow>
                            <S.FormRow col={4}>
                                <S.FormGroup>
                                    <S.FormLabel>방송 시간</S.FormLabel>
                                    <S.FormControl
                                        id="liveTime"
                                        type="text"
                                        placeholder="예시 : 60 (반드시 숫자로 입력)"
                                        value={liveTime}
                                        onChange={(e) => setLiveTime(e.target.value)}
                                    />
                                </S.FormGroup>

                                <S.FormGroup>
                                    <S.FormLabel>방송 시간대</S.FormLabel>
                                    <S.FormControl
                                        id="liveClock"
                                        type="text"
                                        placeholder="예시 : 12시 30분"
                                        value={liveClock}
                                        onChange={(e) => setLiveClock(e.target.value)}
                                    />
                                </S.FormGroup>

                                <S.FormGroup>
                                    <S.FormLabel>세션 수</S.FormLabel>
                                    <S.SelectControl
                                        value={session}
                                        onChange={(e) => setSession(e.target.value)}>
                                        <option value="1">1개</option>
                                        <option value="2">2개</option>
                                        <option value="3">3개</option>
                                        <option value="4">4개</option>
                                    </S.SelectControl>
                                </S.FormGroup>
                                <S.FormGroup>
                                    <S.FormLabel>퀴즈 횟수</S.FormLabel>
                                    <S.SelectControl
                                        value={quiz}
                                        onChange={(e) => setQuiz(e.target.value)}>
                                        <option value="0">0회</option>
                                        <option value="1">1회</option>
                                        <option value="2">2회</option>
                                        <option value="3">3회</option>
                                        <option value="4">4회</option>
                                    </S.SelectControl>
                                </S.FormGroup>
                            </S.FormRow>
                            <S.FormGroup>
                                <S.FormLabel>강조 포인트</S.FormLabel>
                                <S.FormControl
                                    id="highlight"
                                    type="text"
                                    placeholder="예시 : 사용 환경 설명, 사용 편의성 강조"
                                    value={highlight}
                                    onChange={(e) => setHighlight(e.target.value)}
                                />
                            </S.FormGroup>

                            <S.FormGroup>
                                <S.FormLabel>사용 지양 언어</S.FormLabel>
                                <S.FormControl
                                    id="avoid-language"
                                    type="text"
                                    placeholder="예시 : 과한 최상급 표현, 경쟁사 비하 표현 지양"
                                    value={avoidLanguage}
                                    onChange={(e) => setAvoidLanguage(e.target.value)}
                                />
                            </S.FormGroup>
                            <S.FormRow col={2}>
                                <S.FormGroup>
                                    <S.FormLabel>사용모델</S.FormLabel>
                                    <S.SelectControl
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}>
                                        <option value="claude-sonnet-4">claude-sonnet-4.6</option>
                                        {/* 나중에 모델 추가하면 option만 늘리면 됨 */}
                                    </S.SelectControl>
                                </S.FormGroup>
                            </S.FormRow>
                        </S.Form>


                        {/* PDF 업로드 영역 */}

                        <S.UploadBox onClick={handleUploadBoxClick}>
                            <S.FileBox
                                ref={fileInputRef}
                                id="file-input"
                                type="file"
                                accept=".pdf"
                                multiple // ⭐ 핵심! 다중 선택 허용
                                onChange={handleFileChange}
                                className="file-input"
                            />
                            {file.length > 0 ? (
                                <div>
                                    <p>📄 선택된 파일 ({file.length}개):</p>
                                    {/* 여러 개의 파일 이름을 순회하며 보여줌 */}
                                    {file.map((f, index) => (
                                        <p key={index} className="file-name" style={{ fontSize: '13px', margin: '4px 0' }}>
                                            - {f.name}
                                        </p>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <S.UploadIcon src={Cloud} />
                                    <S.UploadText>
                                        여러 개의 PDF 파일을 업로드 하거나 여기로 드래그 하세요.
                                    </S.UploadText>
                                </div>
                            )}
                        </S.UploadBox>

                        <S.FormActions>
                            <S.BtnPrimary
                                onClick={generateScript}
                                disabled={!file || loading}
                                className="generate-btn"
                            >
                                {loading ? "생성 중... (약 2분 소요)" : "대본 생성하기"}
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
        </S.BoxContainer >



    )



}

export default BodyBox;