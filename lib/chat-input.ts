export const MAX_QUESTION = 2000;
export const MAX_HISTORY = 6;
export const MAX_HISTORY_CONTENT = 4000;
export const MAX_BODY_BYTES = 40000;
export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export function parseChatInput(body: unknown): { question: string; history: ChatTurn[] } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('BAD_INPUT');
  if (Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BODY_BYTES) throw new Error('TOO_LARGE');
  const { question, history = [] } = body as Record<string, unknown>;
  if (typeof question !== 'string' || !question.trim()) throw new Error('BAD_INPUT');
  if (question.length > MAX_QUESTION) throw new Error('TOO_LARGE');
  if (!Array.isArray(history) || history.length > MAX_HISTORY) throw new Error('BAD_HISTORY');
  const turns: ChatTurn[] = history.map((item: unknown) => {
    if (!item || typeof item !== 'object') throw new Error('BAD_HISTORY');
    const { role, content } = item as Record<string, unknown>;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string' || !content.trim()) throw new Error('BAD_HISTORY');
    if (content.length > MAX_HISTORY_CONTENT) throw new Error('TOO_LARGE');
    return { role, content };
  });
  return { question: question.trim(), history: turns };
}

export function isSameOrigin(headers: { origin?: string; host?: string }): boolean {
  try {
    const origin = new URL(headers.origin ?? '');
    return (origin.protocol === 'https:' || origin.protocol === 'http:') && origin.host === headers.host;
  } catch { return false; }
}
