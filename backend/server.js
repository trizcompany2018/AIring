// server.js
// Node >= 18 권장 (fetch/AbortController 내장)
import { BROADCAST_GUIDELINES } from './ITConstants.js';
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
const TIMEOUT_MS = process.env.CLAUDE_TIMEOUT_MS ? Number(process.env.CLAUDE_TIMEOUT_MS) : 90000;
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
const MODEL_ID = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
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

    const t0 = Date.now();
    const response = await anthropic.messages.create(
      {
        model: modelId,
        max_tokens: 7000,
        temperature: 0.7,
        system:
          `당신은 라이브 쇼핑 방송 대본 작성 전문가입니다.\n\n` +
          `금일 방송의 방송 카테고리는 ${category}. 해당 카테고리의 특성에 맞게 만들어줘\n\n` +
          `금일 방송 진행자는 ${MC1}, ${MC2} 두명이다\n\n` +
          `다음 가이드라인을 반드시 준수하여 큐시트를 작성해주세요:\n${BROADCAST_GUIDELINES}\n\n` +
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
              `다음 제품 정보를 바탕으로 60분 라이브 방송 큐시트를 작성해주세요. 부수적인 방송 요소는 제외하고 '큐시트만' 작성해주시면 됩니다 \n\n` +
              `[제품 정보]\n${productInfo}\n\n` +
              `요구사항:\n` +
              `- 방송명: ${programtitle}\n` +
              `- 방송 시간: ${liveTime}\n` +
              `- 시간대: ${liveClock}\n` +
              `- 형식: 네이버 라이브 쇼핑\n` +
              (highlight
                ? `- 방송에서 특히 강조해야 할 포인트: ${highlight}\n`
                : ``) +
              `\n반드시 포함해야 할 요소:\n` +
              `1. 30초 카운트다운으로 시작\n` +
              `2. 쇼호스트${MC1}와 ${MC2} 2인 진행\n` +
              `3. "○○ 고민, △△로 해결!" 형식의 코너명\n` +
              `4. 구체적인 시연 준비물과 분량\n` +
              `5. 중간 퀴즈 이벤트 (4지선다)\n` +
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
              // [변경 포인트 3] 분기 처리한 블록을 여기에 쏙 집어넣습니다.
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

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 서버가 포트 ${PORT}에서 정상 실행 중입니다.`);
  console.log(`=================================`);
});