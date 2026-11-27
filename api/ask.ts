import type { ApiRequest, ApiResponse } from '../lib/http.js';
import { isSameOrigin, parseChatInput, type ChatTurn } from '../lib/chat-input.js';
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
  return `당신은 센트럴처치 QnA 입니다. 교회에 다니는 분, 신앙을 처음 접하는 분, 신앙을 탐색 중인 분 누구든 이해할 수 있도록, 성경과 설교 말씀을 근거로 신앙 질문에 답하는 안내자입니다.

[설교 내용]은 참고 자료로 삼되, 답은 보편적인 기독교 신앙의 관점에서 이해하기 쉽게 풀어주세요. 특정 교회·특정 목사님만이 강조하는 고유한 해석에 얽매이지 말고, 일반 성도들이 공감할 수 있는 방식으로 성경적 원칙에 근거해 답하세요.

- 어려운 신학 용어와 낯선 개념은 최소화하고, 꼭 필요하면 짧게 풀어 설명하세요.
  교회를 처음 접한 사람도 이해할 수 있어야 합니다.
- 설교에 특정 성경 구절이나 개념을 이례적으로 연결짓는 고유 해석이 담겨 있어도,
  그 해석을 답의 중심으로 삼지 마세요. 대신 일반 기독교에서 공통적으로
  다루는 관점으로 답하세요.
- "설교에서", "목사님께서 말씀하셨듯이", "참고하자면" 같이 설교를 인용하는
  표현은 쓰지 마세요. 자연스러운 평서문으로 풀어 답하세요. (성경의 화자,
  예: 예수님·바울 등을 밝히는 것은 가능합니다.)
- 신앙 문제를 세상의 법(법률·법적 지침 등)과 연관 짓지 마세요.
- 부드럽고 차분한 어조를 유지하세요. "~~기원합니다", "~~축복합니다" 같은
  맺음말은 쓰지 마세요.
- 답변은 다음 구조를 따르세요:
  (1) 핵심 응답 한두 문장으로 먼저 답한 뒤
  (2) 성경적 배경·근거를 이해하기 쉽게 이어가고
  (3) 마지막에 짧은 적용 한두 문장으로 마무리합니다.
- 권면·마무리 문장은 1-2 문장 이내로 짧게, 비슷한 권면 반복 금지.
- 더 깊은 상담이나 인도가 필요하면 상황에 맞게 안내하되, 아래 두 가지 중
  하나만 택하세요.
  · 이미 센트럴처치에서 신앙생활 중인 분: 담임 목사님과의 상담을 권합니다.
  · 교회를 찾고 있거나 신앙을 탐색 중인 분: 센트럴처치의 예배에 직접
    방문해 보시도록 권합니다. 이런 분께는 담임 목사님 상담을 언급하지 마세요.
  모든 답변에 기계적으로 덧붙이지 말고 정말 필요할 때만 자연스럽게.

[설교 내용]
${contextText}

[사용자 질문]
${userQuestion}

[답변]
`;
}

// 멀티턴 컨텍스트 윈도우 — 직전 6 메시지(=3 round) 까지만 유지.
// 너무 길어지면 토큰 비용·정확도 모두 손해라 의도적으로 짧게 둠.
const HISTORY_WINDOW = 6;

async function getGptResponse(
  openai: OpenAI,
  prompt: string,
  history: ChatTurn[],
): Promise<string> {
  // history 는 가장 오래된 것부터. 현재 턴의 prompt(=RAG 컨텍스트 포함)는 마지막 user 로 붙는다.
  // 이전 턴의 답변에는 RAG 컨텍스트를 다시 붙이지 않는다 — 모델이 흐름만 인지하면 충분.
  const trimmed = history.slice(-HISTORY_WINDOW);
  const messages = [
    { role: 'system' as const, content: '당신은 센트럴처치(Central Church)의 신앙 상담가입니다.' },
    ...trimmed,
    { role: 'user' as const, content: prompt },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    max_completion_tokens: 1200,
  });
  return response.choices[0].message.content ?? '';
}

export async function answerQuestion(
  question: string,
  history: ChatTurn[] = [],
): Promise<string> {
  const { openai, supabase } = getClients();
  const docs = await searchSimilarDocs(openai, supabase, question);
  const prompt = generatePrompt(docs, question);
  return getGptResponse(openai, prompt, history);
}

// GPT-4o 응답이 수 초 걸리므로 여유를 둔다.
export const config = { maxDuration: 30 };

export default async function handler(
  req: ApiRequest,
  res: ApiResponse,
) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isSameOrigin(req.headers)) {
    res.status(403).json({ error: '이 홈페이지에서 질문을 보내 주세요.' });
    return;
  }
  if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    res.status(415).json({ error: 'JSON 형식으로 요청해 주세요.' });
    return;
  }

  try {
    const { question: q, history } = parseChatInput(req.body);
    const answer = await answerQuestion(q, history);
    // Vercel may stop work after sending the response: persist before responding.
    // 질문/답변 누적 (best-effort). christian-chatbot rag.py log_qa 와 동일 의도.
    // 로깅 실패가 사용자 응답을 막지 않도록 예외는 삼킨다.
    try {
      const { supabase } = getClients();
      const { error } = await supabase.from('chat_logs').insert({ question: q, answer });
      if (error) console.error('[chat_logs] 기록 실패(무시):', error.message);
    } catch (e) {
      console.error('[chat_logs] 로깅 스킵:', e instanceof Error ? e.message : String(e));
    }
    res.status(200).json({ answer });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'TOO_LARGE') {
      res.status(413).json({ error: '질문은 2,000자 이내로 입력해 주세요. 대화가 길면 새로 시작해 주세요.' });
      return;
    }
    if (message === 'BAD_INPUT' || message === 'BAD_HISTORY') {
      res.status(400).json({ error: '질문과 대화 내용을 확인해 주세요.' });
      return;
    }
    // Do not log upstream exception text: it can contain user input or credentials.
    console.error('[/api/ask] request failed');
    res.status(503).json({ error: '답변을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.' });
  }
}
