// server.js
// Node >= 18 권장 (fetch/AbortController 내장)
import { BROADCAST_GUIDELINES } from './ITConstants.js';
import { CLOTHES_BROADCAST_GUIDELINES } from './ClothesConstants.js';
import { FOOD_BROADCAST_GUIDELINES } from './FoodConstants.js';
import { BEAUTY_BROADCAST_GUIDELINES } from './BeautyConstants.js'
import sharp from 'sharp';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const TIMEOUT_MS = process.env.CLAUDE_TIMEOUT_MS ? Number(process.env.CLAUDE_TIMEOUT_MS) : 180000;
console.log('[ENV] CLAUDE_TIMEOUT_MS:', TIMEOUT_MS);

// ===== 공통 미들웨어 =====
app.use(cors());
// JSON 본문 없을 때 hang 방지를 위해 limit 지정(안전)
app.use(express.json({ limit: '2mb' }));

// 요청 로그 (디버깅용) — 모든 요청에 한 줄 찍기
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// 파일 업로드 설정 (PDF 10MB 제한)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

// ===== Anthropic 초기화 =====
const MODEL_ID = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// .env 로딩 확인(길이만 출력)
console.log('[ENV] CLAUDE_API_KEY length:', process.env.CLAUDE_API_KEY?.length || 'undefined');
console.log('[ENV] ANTHROPIC_MODEL:', MODEL_ID);


// ===== 헬스체크 =====
app.get('/ping', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

function respondOnce(res) {
  let sent = false;
  return {
    json(status, body) {
      if (sent || res.headersSent) return false;
      res.status(status).json(body);
      sent = true;
      return true;
    },
    text(status, body) {
      if (sent || res.headersSent) return false;
      res.status(status).type('text/plain; charset=utf-8').send(body);
      sent = true;
      return true;
    },
    end() {
      if (sent || res.headersSent) return false;
      res.end();
      sent = true;
      return true;
    },
    isSent() { return sent || res.headersSent; }
  };
}

// ===== 사용 가능 모델 리스트 확인(계정/키 진단용) =====
app.get('/api/models', async (_req, res) => {
  try {
    const list = await anthropic.models.list();
    res.json(list);
  } catch (e) {
    console.error('models.list error:', e);
    res.status(500).json({ success: false, error: String(e?.message || e) });
  }
});

// ===== Anthropic 호출 유틸 (타임아웃 래퍼) =====
async function callClaudeWithTimeout(args, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    console.error(`[TIMEOUT] ${timeoutMs}ms elapsed → aborting Anthropic call`);
    controller.abort();
  }, timeoutMs);

  const t0 = Date.now();
  try {
    const resp = await anthropic.messages.create({ ...args }, { signal: controller.signal });
    console.log(`[LATENCY] Anthropic messages.create took ${Date.now() - t0}ms`);
    return resp;
  } finally {
    clearTimeout(timer);
  }
}

// ===== 테스트용: PDF 없이 Claude에 간단 질문 =====
app.post('/api/test-script', async (req, res) => {
  const respond = respondOnce(res);

  try {
    // 🔥 프론트에서 보낸 질문 받기
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return respond.json(400, {
        success: false,
        error: "question 문자열이 필요합니다."
      });
    }

    const response = await callClaudeWithTimeout({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      temperature: 0,
      system: "당신은 간단한 질문에 짧고 명확하게 답하는 어시스턴트입니다.",
      messages: [
        {
          role: "user",
          content: question   // 👈 프론트에서 받은 질문을 Claude에 전달
        }
      ]
    });

    const answer = response.content?.[0]?.text || "";

    respond.json(200, {
      success: true,
      script: answer
    });

  } catch (error) {
    console.error("Error in /api/test-script:", error);
    if (!respond.isSent()) {
      respond.json(500, {
        success: false,
        error: "테스트 스크립트 생성 중 오류가 발생했습니다.",
        details: String(error?.message || error),
      });
    }
  }
});

// ===== 실제 PDF 업로드 버전 =====
app.post('/api/generate-script', upload.single('pdf'), async (req, res) => {
  const respond = respondOnce(res);

  const timeoutMs = TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => {
    console.error(`[TIMEOUT] ${timeoutMs}ms elapsed → aborting Anthropic call (/api/generate-script)`);
    controller.abort();
  }, timeoutMs);

  try {
    //server test용 로그
    console.log('======= [DEBUG] Frontend Data Received =======');
    console.log('1. req.body:', JSON.stringify(req.body, null, 2)); // 전체 텍스트 데이터
    console.log('2. req.file:', req.file ? {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : 'No File Uploaded');
    console.log('==============================================');

    let productInfo = '';
    if (req.file) {
      const pdfData = await pdfParse(req.file.buffer);
      productInfo = pdfData.text || '';
    }

    // ✅ 프론트에서 온 값들
    const {
      highlight = '',
      avoidLanguage = '',
      tone = '기본',
      category = '',
      programtitle = '',
      model, // 선택 모델 (없으면 기본 MODEL_ID 사용)
      MC1,
      MC2,
      liveTime,
      session,
      liveClock,
      quiz,
    } = req.body;

    // ✅ 모델 선택 (프론트가 보낸 게 있으면 그거, 없으면 기존 상수)
    const modelId = MODEL_ID;

    // ✅ 톤에 따라 안내 문구 다르게
    let toneGuide = '';
    if (tone === '간결') {
      toneGuide = '말투는 최대한 간결하고 핵심 위주로 작성해주세요.';
    } else if (tone === '격식') {
      toneGuide = '말투는 격식 있고 공손하게 작성해주세요.';
    } else {
      toneGuide = '말투는 자연스럽고 친근하지만 과하지 않게 작성해주세요.';
    }

    let selectedGuidelines = BROADCAST_GUIDELINES;

    if (category === 'food') {
      selectedGuidelines = FOOD_BROADCAST_GUIDELINES;
    }
    else if (category === 'beauty') {
      selectedGuidelines = BEAUTY_BROADCAST_GUIDELINES;
    }
    else if (category === 'fashion') {
      selectedGuidelines = CLOTHES_BROADCAST_GUIDELINES;
    }
    else {
      selectedGuidelines = BROADCAST_GUIDELINES;
    }


    const t0 = Date.now();
    const response = await anthropic.messages.create(
      {
        model: modelId,
        max_tokens: 7000,
        temperature: 0.7,
        system:
          `당신은 라이브 쇼핑 방송 대본 작성 전문가입니다.\n\n` +
          `금일 방송의 방송 카테고리는 ${category}. 해당 카테고리의 특성에 맞게 만들어줘\n\n` +
          `금일 방송의 세션 개수는 ${session}. 세션 수에 맞게 방송을 구분해줘\n\n` +
          `금일 방송의 퀴즈 진행 횟수는 ${quiz}. 퀴즈 진행 횟수에 맞게 적절한 위치인 섹션 사이나 시작 전에 넣어줘\n\n` +
          `금일 방송 진행자는 ${MC1}, ${MC2} 두명이다\n\n` +
          `다음 가이드라인을 반드시 준수하여 큐시트를 작성해주세요:\n${selectedGuidelines}\n\n` +
          `위 가이드라인을 엄격히 따라 실제 방송에서 사용 가능한 전문적인 큐시트를 작성해주세요.\n` +
          `반드시 가이드라인의 모든 요소를 포함하여 작성하세요.\n` +
          `상품의 혜택이나 가격 요소는 (혜택소개), (가격소개) 등으로 표시만 하고 구체 금액은 생략하세요.\n` +
          `방송 진행 일정에 계절감에 맞는 진행을 해주세요.\n` +
          `방송 전반의 톤앤매너:\n${toneGuide}\n` +
          (avoidLanguage
            ? `다음 표현이나 어투는 사용을 지양하세요: ${avoidLanguage}\n`
            : ``),
        messages: [
          {
            role: 'user',
            content:
              `다음 제품 정보를 바탕으로 ${liveTime} 라이브 방송 큐시트를 작성해주세요. 부수적인 방송 요소는 제외하고 '큐시트만' 작성해주시면 됩니다 \n\n` +
              `[제품 정보]\n${productInfo}\n\n` +
              `요구사항:\n` +
              `- 방송명: ${programtitle}\n` +
              `- 방송 시간: ${liveTime}\n` +
              `- 시간대: ${liveClock}\n` +
              `- 형식: 라이브 쇼핑 방송\n` +
              (highlight
                ? `- 방송에서 특히 강조해야 할 포인트: ${highlight}\n`
                : ``) +
              `\n반드시 포함해야 할 요소:\n` +
              `1. 30초 카운트다운으로 시작\n` +
              `2. 쇼호스트${MC1}와 ${MC2} 2인 진행\n` +
              `3. "○○ 고민, △△로 해결!" 형식의 코너명\n` +
              `4. 구체적인 시연 준비물과 분량\n` +
              `5. 중간 퀴즈 이벤트 ${quiz} 회 (4지선다)\n` +
              `6. 제품 비교 섹션\n` +
              `가이드라인에 맞춰 완전한 큐시트를 작성해주세요.`,
          },
        ],
      },
      { signal: controller.signal }
    );

    console.log(`[LATENCY] /api/generate-script took ${Date.now() - t0}ms`);

    respond.json(200, { success: true, script: response.content?.[0]?.text || '' });
  } catch (error) {
    const aborted =
      (error && (error.name === 'AbortError' || /aborted/i.test(String(error.message)))) ? true : false;

    console.error('Error in /api/generate-script:', error);

    if (!respond.isSent()) {
      if (aborted) {
        respond.json(504, { success: false, error: 'Upstream timeout (Anthropic took too long)' });
      } else {
        respond.json(500, {
          success: false,
          error: '대본 생성 중 오류가 발생했습니다.',
          details: String(error?.message || error),
        });
      }
    }
  } finally {
    clearTimeout(timer);
  }
});

app.post(
  "/api/generate-summary",
  upload.single("pdf"), // 💡 프론트엔드 formData 필드명이 "pdf"라면 그대로 유지해도 무방합니다.
  async (req, res) => {
    const respond = respondOnce(res);

    try {
      if (!req.file) {
        return respond.json(400, {
          success: false,
          error: "파일이 필요합니다. (PDF 또는 이미지)",
        });
      }

      // [변경 포인트 1] 파일 데이터 추출 및 MIME 타입 확인
      const fileBase64 = req.file.buffer.toString("base64");
      const mimeType = req.file.mimetype;

      // [변경 포인트 2] 파일 타입에 따라 Claude에게 보낼 블록 구조 분기
      let mediaBlock;

      if (mimeType === "application/pdf") {
        // PDF인 경우
        mediaBlock = {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: fileBase64,
          },
        };
      } else if (mimeType.startsWith("image/")) {
        // 🚨 [여기가 핵심!] 이미지는 sharp를 써서 8000px 이하로 리사이징 후 Base64로 변환
        // 상세페이지 글씨가 깨지지 않도록 4000~6000px 정도가 적당합니다.
        const resizedImageBuffer = await sharp(req.file.buffer)
          .resize({
            width: 4000,
            height: 4000,
            fit: 'inside', // 원본 비율을 유지하면서 가로/세로 중 긴 쪽을 4000px에 맞춤
            withoutEnlargement: true // 원본이 4000px보다 작으면 억지로 키우지 않음
          })
          .toBuffer();

        const resizedBase64 = resizedImageBuffer.toString("base64");

        mediaBlock = {
          type: "image",
          source: { type: "base64", media_type: mimeType, data: resizedBase64 },
        };
      } else {
        // 허용되지 않은 파일 형식일 때 차단
        return respond.json(400, {
          success: false,
          error: "지원하지 않는 파일 형식입니다. (PDF, JPG, PNG 등만 가능)",
        });
      }

      const response = await callClaudeWithTimeout({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        temperature: 0.2,
        system: `
          당신은 라이브커머스 및 방송 큐시트 제작 전문가입니다.
          첨부된 문서나 이미지를 분석하여 제품 정보와 강점을 방송용으로 이해하기 쉽게 요약하세요.
          단, 반드시 임의로 내용을 추가하지 말고 주어진 내용으로만 작성하세요. 
          `,
        messages: [
          {
            role: "user",
            content: [

              mediaBlock,
              {
                type: "text",
                text: `
                    이 자료를 바탕으로 아래 형식으로 정리해줘.

                    1. 제품 개요(카탈로그 내 정보에 있는 각 제품의 요약 - 가격, 제품명, 스펙 등)
                    2. 차별화 강점 3가지 이상
                    `
              }
            ]
          }
        ]
      });

      const summary = response.content?.[0]?.text || "요약 결과가 없습니다.";

      return respond.json(200, {
        success: true,
        summary
      });

    } catch (err) {
      console.error("[ERROR] /api/generate-summary:", err);

      const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');

      if (!respond.isSent()) {
        if (isTimeout) {
          return respond.json(504, {
            success: false,
            error: "요청 시간이 초과되었습니다. (서버 타임아웃)",
            details: "파일 분석에 시간이 너무 많이 소요됩니다. 용량을 줄여보세요."
          });
        }

        if (err.status) {
          return respond.json(err.status, {
            success: false,
            error: `Claude API 오류: ${err.status}`,
            details: err.message
          });
        }

        return respond.json(500, {
          success: false,
          error: err.message || String(err),
          details: err.stack
        });
      }
    }
  }
);

// =========================================================
// 3️⃣ 기능: 보도자료 초안 생성 (🔥 고도화된 프롬프트 적용)
// =========================================================
app.post("/api/generate-press-release", upload.single("pdf"), async (req, res) => {
  const respond = respondOnce(res);
  try {
    const { tone = '기본', info = '' } = req.body;

    if (!req.file) {
      return respond.json(400, { success: false, error: "파일이 필요합니다." });
    }

    const mimeType = req.file.mimetype;
    let mediaBlock;

    if (mimeType === "application/pdf") {
      mediaBlock = { type: "document", source: { type: "base64", media_type: "application/pdf", data: req.file.buffer.toString("base64") } };
    } else if (mimeType.startsWith("image/")) {
      const resizedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 4000, height: 4000, fit: 'inside', withoutEnlargement: true })
        .toBuffer();
      mediaBlock = { type: "image", source: { type: "base64", media_type: mimeType, data: resizedImageBuffer.toString("base64") } };
    } else {
      return respond.json(400, { success: false, error: "지원하지 않는 파일 형식입니다." });
    }

    // 사용자가 선택한 톤에 따른 미세 조정
    let toneGuide = "객관적이고 신뢰감 있는 공식적인 스트레이트 기사체(다/까)를 사용하세요.";
    if (tone === "간결") toneGuide = "수식어를 철저히 배제하고, 육하원칙(5W1H)에 입각하여 사실과 핵심 정보 위주로 매우 간결한 단문 위주로 작성하세요.";
    if (tone === "격식") toneGuide = "매우 정중하고 권위 있는 문체를 사용하며, 기업의 공식 입장문처럼 무게감 있게 작성하세요.";

    // 💡 Claude 프롬프트 고도화 (제공된 PDF 샘플 분석 반영)
    const response = await callClaudeWithTimeout({
      model: MODEL_ID, // 앞서 설정한 모델 변수
      max_tokens: 3000,
      temperature: 0.6, // 인용구 창작과 부드러운 문장 연결을 위해 0.6으로 설정
      system: `당신은 10년 차 전문 PR 홍보 담당자이자 언론 보도자료 작성 전문가입니다. 제공된 어수선한 실무 자료나 메일 내용을 바탕으로, 기자들이 바로 복사해서 기사화할 수 있을 만큼 완벽한 형태의 보도자료 초안을 작성하는 것이 당신의 임무입니다.`,
      messages: [
        {
          role: "user",
          content: [
            mediaBlock,
            {
              type: "text",
              text: `
                첨부된 문서/이미지 자료를 바탕으로 언론사에 배포할 '공식 보도자료 초안'을 작성해주세요.

                [핵심 작성 가이드라인]
                1. 어조 및 톤앤매너: ${toneGuide}
                2. 문장 구조: 짧고 간결한 문장(단문) 위주로 작성하며, 주술 호응이 명확해야 합니다. 수동태 표현은 피하고 능동태를 사용하세요.

                [보도자료 필수 구조]
                작성 시 반드시 아래의 구조를 순서대로 따르세요.

                1. [헤드라인 (제목)]
                   - 기사의 핵심 내용을 한눈에 파악할 수 있도록 작성하세요.
                   - 예시: "OO기업, 신규 서비스 XX 출시... 글로벌 시장 진출 본격화"
                   
                2. [부제목 (리드문)]
                   - 헤드라인 아래에 위치하며, 본문 전체 내용을 1~2문장으로 요약한 핵심 단락입니다.
                   - 육하원칙을 바탕으로 가장 중요한 팩트(Fact)를 앞세우세요.
                   
                3. [본문 (전개)]
                   - 문단을 적절히 나누고, 필요하다면 내용 전환 시 '◇ 소제목' 기호를 사용하여 문단을 구분하세요. (예: ◇ "OOO 전략으로 승부수")
                   - 사업 내용, 제품의 특장점, 시장 동향, 향후 계획 등을 논리적으로 전개하세요.
                   - 구체적인 수치나 데이터가 있다면 적극적으로 활용하여 신뢰도를 높이세요.
                   
                4. [인용구 (관계자 코멘트)]
                   - 기사 마지막 부분(또는 자연스러운 문맥)에 기업 대표나 관계자의 공식 코멘트를 큰따옴표(" ")를 사용하여 반드시 삽입하세요.
                   - 코멘트는 사업의 의의, 기대 효과, 향후 비전 등을 담아 자연스럽게 창작해주세요.
                   - 예시: OO기업 대표는 "이번 투자를 통해 글로벌 잠재력을 가진 다양한 로컬브랜드를 발굴 및 지원하고 글로벌 시장을 연결하는 파트너로 자리매김하겠다"고 밝혔다.
                   
                5. [마무리 기호]
                   - 기사의 끝에는 반드시 '(끝)'을 기입하세요.

                [사용자 추가 요청사항]
                ${info ? info : "제공된 기초 자료의 내용을 최대한 객관적인 기사체로 변환하는 데 집중하세요."}
              `
            }
          ]
        }
      ]
    });

    return respond.json(200, {
      success: true,
      summary: response.content?.[0]?.text || "보도자료 생성 결과가 없습니다."
    });

  } catch (err) {
    console.error("[ERROR] /api/generate-press-release:", err);
    if (!respond.isSent()) {
      return respond.json(500, { success: false, error: err.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 서버가 포트 ${PORT}에서 정상 실행 중입니다.`);
  console.log(`=================================`);
});