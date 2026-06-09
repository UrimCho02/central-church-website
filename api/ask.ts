import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// christian-chatbot/rag.py 의 RAG 로직을 TypeScript 로 포팅.
// 임베딩(text-embedding-3-small) → Supabase match_sermons RPC → GPT-4o.

// 클라이언트는 모듈 로드가 아니라 요청 시 지연 생성한다.
// (모듈 로드 중 throw 하면 FUNCTION_INVOCATION_FAILED 로 원인 파악이 어려움)
let _openai: OpenAI | null = null;
let _supabase: SupabaseClient | null = null;

const REQUIRED_ENV = ['OPENAI_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

function getClients(): { openai: OpenAI; supabase: SupabaseClient } {
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`MISSING_ENV:${missing.join(',')}`);
  }
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    );
  }
  return { openai: _openai, supabase: _supabase };
}

async function searchSimilarDocs(
  openai: OpenAI,
  supabase: SupabaseClient,
  query: string,
  topK = 5,
): Promise<string[]> {
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
  return `당신은 센트럴처치(Central Church)의 따뜻하고 깊이 있는 목회적 신앙 상담가입니다.
아래 [설교 내용]은 센트럴처치 담임 목사님의 설교 말씀이며, 이 가르침에 근거하여 사용자의 질문에 답하세요.

- 답변은 반드시 [설교 내용]에 실제로 담긴 내용에 근거해야 합니다.
  설교에 없는 일반적 위로나 세상적 조언을 지어내지 마세요.
- 더 깊은 상담이나 구체적인 인도가 필요한 부분은 질문자의 상황에 맞게 안내하세요.
  이미 신앙생활을 하며 도움이 필요한 분께는 담임 목사님과의 상담을, 교회를 찾고 있거나
  신앙을 탐색 중인 분께는 센트럴처치의 설교 말씀을 더 들어보시고 예배에 직접 방문해
  보시도록 권해 주세요. 단, 모든 답변에 기계적으로 덧붙이지 말고 정말 필요할 때만
  자연스럽게 안내하세요.
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

async function getGptResponse(openai: OpenAI, prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: '당신은 센트럴처치(Central Church)의 신앙 상담가입니다.' },
      { role: 'user', content: prompt },
    ],
  });
  return response.choices[0].message.content ?? '';
}

export async function answerQuestion(question: string): Promise<string> {
  const { openai, supabase } = getClients();
  const docs = await searchSimilarDocs(openai, supabase, question);
  const prompt = generatePrompt(docs, question);
  return getGptResponse(openai, prompt);
}

// GPT-4o 응답이 수 초 걸리므로 여유를 둔다.
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

    const q = question.trim();
    const answer = await answerQuestion(q);
    res.status(200).json({ answer });

    // 질문/답변 누적 (best-effort, 응답 후). christian-chatbot rag.py log_qa 와 동일 의도.
    // 로깅 실패가 사용자 응답을 막지 않도록 예외는 삼킨다.
    try {
      const { supabase } = getClients();
      const { error } = await supabase.from('chat_logs').insert({ question: q, answer });
      if (error) console.error('[chat_logs] 기록 실패(무시):', error.message);
    } catch (e) {
      console.error('[chat_logs] 로깅 스킵:', e instanceof Error ? e.message : String(e));
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/ask] error:', message);
    if (message.startsWith('MISSING_ENV:')) {
      res.status(500).json({
        error: '서버 환경변수가 설정되지 않았습니다.',
        missingEnv: message.slice('MISSING_ENV:'.length).split(','),
      });
      return;
    }
    res.status(500).json({ error: '답변을 가져오지 못했습니다.', detail: message });
  }
}
