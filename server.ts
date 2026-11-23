import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface AskAnswer {
  title: string;
  summary: string;
  steps: string[];
  recommendedTools: string[];
  caution: string;
  relatedRoomId: 'bathroom' | 'kitchen' | 'living' | 'bedroom' | 'entryway' | 'general';
}

const SYSTEM_INSTRUCTION = `당신은 한국 가정의 집안일, 청소, 세탁, 수납, 위생 관리를 쉽고 정확하게 알려주는 생활 살림 전문가입니다.
사용자가 집안일이나 얼룩 제거, 가전 관리, 청소 순서 등을 물어보면 아래 원칙에 따라 한국어로 친절하고 명확하게 설명해 주세요.
1. 반드시 실행 가능한 순서(3~5단계)로 정리하고, 왜 그 순서로 해야 하는지 이유를 자연스럽게 포함하세요.
2. 주의사항(caution) 항목에는 '무엇을 하지 말아야 하는지'와 함께 '왜 하면 안 되는지(재질 손상, 유독가스, 세균 번식 등의 구체적 이유)'를 반드시 적어 주세요.
3. 락스(염소계)와 구연산/식초(산성) 또는 뜨거운 물의 혼합 금지 등 안전 수칙을 철저히 지키세요.
4. 집안일·살림과 전혀 무관한 질문이라면 집안일 관련 질문을 입력해 달라고 정중히 안내하고 general 카테고리로 답하세요.`;

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '16kb' }));

  app.post('/api/ask', async (req: Request, res: Response) => {
    const rawQuestion = typeof req.body?.question === 'string' ? req.body.question.trim() : '';

    if (!rawQuestion) {
      res.status(400).json({ error: '검색할 내용이나 질문을 입력해 주세요.' });
      return;
    }

    if (rawQuestion.length > 300) {
      res.status(400).json({ error: '질문은 300자 이내로 입력해 주세요.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: '서버의 API 키 설정이 완료되지 않았습니다. Settings > Secrets 패널을 확인해 주세요.',
      });
      return;
    }

    try {
      let response;
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: `사용자 질문: ${rawQuestion}`,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: '질문에 대한 핵심 답변 제목 (한국어, 1줄)',
                  },
                  summary: {
                    type: Type.STRING,
                    description: '핵심 원리와 요약 설명 (한국어, 1~2문장)',
                  },
                  steps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '순서대로 따라 하는 실행 방법 (3~5단계)',
                  },
                  recommendedTools: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '필요한 준비물과 세제 목록',
                  },
                  caution: {
                    type: Type.STRING,
                    description: '피해야 할 행동과 왜 하면 안 되는지에 대한 이유',
                  },
                  relatedRoomId: {
                    type: Type.STRING,
                    description:
                      '가장 연관된 장소 ID: bathroom, kitchen, living, bedroom, entryway, general 중 하나',
                  },
                },
                required: [
                  'title',
                  'summary',
                  'steps',
                  'recommendedTools',
                  'caution',
                  'relatedRoomId',
                ],
              },
            },
          });
          break;
        } catch (attemptErr: unknown) {
          const msg = (attemptErr as { message?: string })?.message ?? String(attemptErr);
          const isTransient =
            msg.includes('"code":503') ||
            msg.includes('UNAVAILABLE') ||
            msg.includes('"code":429') ||
            msg.includes('RESOURCE_EXHAUSTED');
          if (!isTransient || attempt === maxAttempts) {
            throw attemptErr;
          }
          await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
        }
      }

      const rawText = (response?.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ error: '답변을 생성하지 못했습니다. 다시 시도해 주세요.' });
        return;
      }

      const parsed = JSON.parse(rawText) as AskAnswer;
      res.json({ answer: parsed });
    } catch (error: unknown) {
      const errObj = error as { status?: number; code?: number; message?: string };
      const rawMessage = errObj?.message ?? String(error);
      let status = typeof errObj?.status === 'number' ? errObj.status : 500;
      if (status === 500 && rawMessage.includes('"code":403')) status = 403;
      if (status === 500 && rawMessage.includes('"code":400')) status = 400;
      if (status === 500 && rawMessage.includes('"code":429')) status = 429;
      if (status === 500 && rawMessage.includes('"code":503')) status = 503;

      console.error('Gemini API error:', status, rawMessage);

      if (
        status === 403 ||
        status === 400 ||
        rawMessage.includes('API_KEY_INVALID') ||
        rawMessage.includes('PERMISSION_DENIED')
      ) {
        res.status(status === 500 ? 403 : status).json({
          error:
            'API 키가 유효하지 않거나 설정되지 않았습니다. Settings > Secrets 패널에서 GEMINI_API_KEY를 확인해 주세요.',
        });
        return;
      }

      if (
        status === 429 ||
        status === 503 ||
        rawMessage.includes('RESOURCE_EXHAUSTED') ||
        rawMessage.includes('UNAVAILABLE')
      ) {
        res.status(status === 500 ? 503 : status).json({
          error: '현재 요청이 많아 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.',
        });
        return;
      }

      res.status(500).json({
        error: '설명을 불러오는 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
