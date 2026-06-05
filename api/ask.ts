import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// christian-chatbot/rag.py 의 RAG 로직을 TypeScript 로 포팅.
// 임베딩(text-embedding-3-small) → Supabase match_sermons RPC → GPT-4o.

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

async function searchSimilarDocs(query: string, topK = 5): Promise<string[]> {
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  const queryEmbedding = embedding.data[0].embedding;

  const { data, error } = await supabase.rpc('match_sermons', {
    query_embedding: queryEmbedding,
    match_count: topK,
  });
  if (error) throw error;

  return (data ?? []).map((row: { content: string }) => row.content);
}

function generatePrompt(contexts: string[], userQuestion: string): string {
  const contextText = contexts.join('\n---\n');
  return `당신은 따뜻하고 깊이 있는 목회적 신앙 상담가입니다.
아래 [설교 내용]에 담긴 가르침에 근거하여 사용자의 질문에 답하세요.

- 답변은 반드시 [설교 내용]에 실제로 담긴 내용에 근거해야 합니다.
  설교에 없는 일반적 위로나 세상적 조언을 지어내지 마세요.
- 더 깊은 상담이나 구체적인 인도가 필요한 부분은, 담임 목사님과
  상담하거나 교회를 찾아가도록 자연스럽게 안내해 주세요.
- 단, 신앙의 문제를 세상의 법(법적 근거·법률·법적 지침 등)과 절대
  연관 짓지 마세요. 신앙 상담은 하나님의 뜻과 성경적 원칙에 관한 것이지
  세상 법과는 무관합니다.
- "설교 내용을 참고하자면" 같은 표현은 쓰지 말고, 설교를 자연스럽게 녹여 답하세요.
- "~~기원합니다", "~~축복합니다" 같은 맺음말은 쓰지 마세요.
- 부드럽고 차분한 목회적 어조를 유지하되, 단순한 위로를 넘어
  성경적 원칙에 근거해 답하세요.

[설교 내용]
${contextText}

[사용자 질문]
${userQuestion}

[상담 답변]
`;
}

async function getGptResponse(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: '당신은 신앙 상담가입니다.' },
      { role: 'user', content: prompt },
    ],
  });
  return response.choices[0].message.content ?? '';
}

export async function answerQuestion(question: string): Promise<string> {
  const docs = await searchSimilarDocs(question);
  const prompt = generatePrompt(docs, question);
  return getGptResponse(prompt);
}

// Vercel 서버리스 함수 (Node 런타임). GPT-4o 응답이 수 초 걸리므로 여유를 둔다.
export const config = { maxDuration: 30 };

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { question } = (req.body ?? {}) as { question?: unknown };
    if (typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: 'question is required' });
      return;
    }

    const answer = await answerQuestion(question.trim());
    res.status(200).json({ answer });
  } catch (err) {
    console.error('[/api/ask] error:', err);
    res.status(500).json({ error: '답변을 가져오지 못했습니다.' });
  }
}
