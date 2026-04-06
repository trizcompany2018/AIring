import * as S from './BodyBox.styles.js'
import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cloud from '../upload.png'
import Overlay from "./Overlay";

const InputContainer = ({ summary, info }) => {

    const [file, setFile] = useState([]);
    const [shortInfo,] = useState(info);
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

    // 파일 입력 시 handling
    const handleFileChange = (e) => {
        // 여러 파일의 목록(FileList)
        const selectedFiles = Array.from(e.target.files);

        // PDF 파일만 필터링 
        const validFiles = selectedFiles.filter(file => file.type === "application/pdf");

        // PDF 파일의 경우 null이 아니라면 파일 저장
        if (validFiles.length > 0) {
            setFile(validFiles); // 배열 형태로 저장
            setError("");
        } else {
            setError("PDF 파일만 업로드 가능합니다.");
            setFile([]);
        }
    };

    // 대본 생성 요청 API
    const generateScript = async () => {

        // PDF 파일 있는 경우에만 API 요청
        if (!file) {
            setError("PDF 파일을 선택해주세요.");
            return;
        }

        // 생성 완료될때까지 loading창 띄워놓기
        setLoading(true);
        setError("");

        const formData = new FormData();
        // files 배열을 돌면서 같은 "pdf"라는 이름으로 계속 추가함
        file.forEach((file) => {
            formData.append("pdf", file);
        });
        //  제품 정보 - 요약 페이지에서 넘어오는 경우에는 이용스크립트 생성 페이지에
        //           - 요약 없이 스크립트 페이지에서 다이렉트 생성은 NULL 상태로
        formData.append("info", shortInfo);
        formData.append("highlight", highlight);            //  강조포인트
        formData.append("avoidLanguage", avoidLanguage);    //  지양 언어
        formData.append("tone", tone);                      //  방송톤
        formData.append("model", model);                    //  모델 선택(현재 단일 모델 사용)
        formData.append("category", category);              //  방송 카테고리(현재 4종)
        formData.append("programtitle", programtitle);      //  방송 프로그램명
        formData.append("MC1", MC1);                        //  진행자 1(메인)
        formData.append("MC2", MC2);                        //  진행자 2
        formData.append("liveTime", liveTime);              //  방송 진행 시간
        formData.append("liveClock", liveClock);            //  실제 방송을 진행하는 시각
        formData.append("sesssion", session);               //  세션 수
        formData.append("quiz", quiz);                      //  퀴즈 진행 횟수
        formData.append("theme", theme);                    //  방송 테마(어떤 느낌 위주로 진행할 지)
        formData.append("formation", formation);            //  방송 진행자 인원 구성(인플루언서 / 쇼호스트 구성)

        try {
            const response = await axios.post(
                "https://airing-eabn.onrender.com/api/generate-script",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response.data.success) {
                const scriptText = response.data.script || "";
                const statusText = "script";
                navigate("/result", { state: { script: scriptText, status: statusText } });
            } else {
                // 💡 서버가 200 응답을 보냈지만 오류 발생한 경우
                setError(response.data.error || "대본 생성에 실패했습니다.");
            }
        } catch (err) {
            // 💡 서버 응답이 에러(400, 500 등)인 경우
            if (err.response && err.response.data) {
                // 서버에서 보낸 구체적인 에러 메시지가 있다면 그걸 보여줌
                const serverErrorMessage = err.response.data.error || err.response.data.message;
                setError(`서버 오류: ${serverErrorMessage || "알 수 없는 오류가 발생했습니다."}`);
            } else if (err.request) {
                // 요청은 보냈으나 응답을 아예 못 받은 경우 (네트워크 연결 문제)
                setError("PC의 네트워크 연결 상태를 확인해주세요.");
            } else {
                // 그 외 에러 처리
                setError(`오류 발생: ${err.message}`);
            }
            console.error("Full Error Info:", err);
        } finally {
            setLoading(false);
        }
    }
    // 파일 입력 리셋버튼
    const handleReset = () => {
        setFile(null);
        setError("");
        const fileInput = document.getElementById("file-input");
        // 파일 input 초기화
        if (fileInput) fileInput.value = "";
    };

    return (

        <S.BoxWrapper>
            <S.Box>
                <S.Form>
                    <S.FormRow col={2}>
                        <S.FormGroup>
                            <S.FormLabel>방송 카테고리</S.FormLabel>
                            <S.SelectControl
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}>
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
                                onChange={(e) => setTone(e.target.value)}>
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
                                onChange={(e) => setMC1(e.target.value)} />
                        </S.FormGroup>
                        <S.FormGroup>
                            <S.FormLabel>서브 진행자</S.FormLabel>
                            <S.FormControl
                                id="MC2"
                                type="text"
                                placeholder="예시 : 백종원"
                                value={MC2}
                                onChange={(e) => setMC2(e.target.value)} />
                        </S.FormGroup>
                        <S.FormGroup>
                            <S.FormLabel>프로그램명</S.FormLabel>
                            <S.FormControl
                                id="programtitle"
                                type="text"
                                placeholder="예시 : 핫IT슈, 백주부의 라방"
                                value={programtitle}
                                onChange={(e) => setProgramTitle(e.target.value)} />
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
                                onChange={(e) => setLiveTime(e.target.value)} />
                        </S.FormGroup>
                        <S.FormGroup>
                            <S.FormLabel>방송 시간대</S.FormLabel>
                            <S.FormControl
                                id="liveClock"
                                type="text"
                                placeholder="예시 : 12시 30분"
                                value={liveClock}
                                onChange={(e) => setLiveClock(e.target.value)} />
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
                            onChange={(e) => setHighlight(e.target.value)} />
                    </S.FormGroup>

                    <S.FormGroup>
                        <S.FormLabel>사용 지양 언어</S.FormLabel>
                        <S.FormControl
                            id="avoid-language"
                            type="text"
                            placeholder="예시 : 과한 최상급 표현, 경쟁사 비하 표현 지양"
                            value={avoidLanguage}
                            onChange={(e) => setAvoidLanguage(e.target.value)} />
                    </S.FormGroup>

                    <S.FormRow col={2}>
                        <S.FormGroup>
                            <S.FormLabel>사용모델</S.FormLabel>
                            <S.SelectControl
                                value={model}
                                onChange={(e) => setModel(e.target.value)}>
                                <option value="claude-sonnet-4">claude-sonnet-4.6</option>
                                {/* 모델 추가 시 옵션 추가하기 */}
                            </S.SelectControl>
                        </S.FormGroup>
                    </S.FormRow>
                </S.Form>

                {/* 요약 결과 페이지에서 작성하는 경우에는 파일 입력 필요 없으므로 보이지 않게 하기 */}
                {summary === "summmary"
                    &&
                    <S.UploadBox onClick={handleUploadBoxClick}>
                        <S.FileBox
                            ref={fileInputRef}
                            id="file-input"
                            type="file"
                            accept=".pdf"
                            multiple
                            onChange={handleFileChange}
                            className="file-input" />
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
                }
                <S.FormActions>
                    <S.BtnPrimary
                        onClick={generateScript}
                        disabled={!file || loading}
                        className="generate-btn"
                    >
                        {loading ? "생성 중... (약 2분 소요)" : "대본 생성하기"}
                    </S.BtnPrimary>
                    {summary !== "summary"
                        &&
                        <S.BtnSecondary onClick={handleReset} className="reset-btn">
                            초기화하기
                        </S.BtnSecondary>
                    }
                </S.FormActions>

                {error && <div className="error-message">⚠️ {error}</div>}

            </S.Box>
            {/* 로딩 중인 상태에는 로딩 페이지 보여주기 */}
            {loading && <Overlay />}
        </S.BoxWrapper>

    )

}

export default InputContainer;