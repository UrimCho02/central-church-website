import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type User } from '@supabase/supabase-js';

const ACCESS = 'cc_pastor_access';
const REFRESH = 'cc_pastor_refresh';
const PAGE_SIZE = 20;

function client() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('AUTH_NOT_CONFIGURED');
  }
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function cookies(req: VercelRequest): Record<string, string> {
  return Object.fromEntries((req.headers.cookie ?? '').split(';').flatMap((part) => {
    const index = part.indexOf('=');
    return index < 0 ? [] : [[part.slice(0, index).trim(), part.slice(index + 1).trim()]];
  }));
}

function setSession(res: VercelResponse, session?: { access_token: string; refresh_token: string; expires_in: number }) {
  const secure = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const suffix = `; Path=/; HttpOnly; SameSite=Strict${secure}`;
  res.setHeader('Set-Cookie', [
    `${ACCESS}=${session?.access_token ?? ''}; Max-Age=${session?.expires_in ?? 0}${suffix}`,
    `${REFRESH}=${session?.refresh_token ?? ''}; Max-Age=${session ? 604800 : 0}${suffix}`,
  ]);
}

function approved(user: User | null): user is User {
  // app_metadata is server-managed. Never trust editable user_metadata for access.
  return user?.app_metadata?.chat_logs_role === 'pastor';
}

async function authenticate(req: VercelRequest, res: VercelResponse) {
  const stored = cookies(req);
  const auth = client();
  if (stored[ACCESS]) {
    const { data, error } = await auth.auth.getUser(stored[ACCESS]);
    if (!error && data.user) {
      if (approved(data.user)) return data.user;
      setSession(res);
      res.status(403).json({ error: '질문·답변 조회 권한이 없습니다.' });
      return null;
    }
  }
  if (stored[REFRESH]) {
    const { data, error } = await auth.auth.refreshSession({ refresh_token: stored[REFRESH] });
    if (!error && data.session && approved(data.user)) {
      setSession(res, data.session);
      return data.user;
    }
  }
  setSession(res);
  res.status(401).json({ error: '로그인이 필요합니다.' });
  return null;
}

function single(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : '';
}

function dateBoundary(value: string, end: boolean) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('BAD_FILTER');
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error('BAD_FILTER');
  return new Date(`${value}T${end ? '23:59:59.999' : '00:00:00.000'}+09:00`).toISOString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Vary', 'Cookie');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
  }
  try {
    const action = single(req.query.action) || 'session';
    if (req.method === 'POST') {
      // Cookie-backed mutations require our own origin, even on preview domains.
      let sameOrigin = false;
      try { sameOrigin = new URL(req.headers.origin ?? '').host === req.headers.host; } catch { /* rejected below */ }
      if (!sameOrigin || !req.headers['content-type']?.startsWith('application/json')) {
        return res.status(403).json({ error: '허용되지 않는 요청입니다.' });
      }
      if (JSON.stringify(req.body ?? {}).length > 16000) return res.status(413).json({ error: '입력 내용이 너무 깁니다.' });

      if (action === 'logout') {
        const stored = cookies(req);
        const auth = client();
        let access = stored[ACCESS];
        if (!access && stored[REFRESH]) {
          const { data } = await auth.auth.refreshSession({ refresh_token: stored[REFRESH] });
          access = data.session?.access_token;
        }
        if (access) {
          const result = await auth.auth.admin.signOut(access, 'local');
          if (result.error && stored[REFRESH]) {
            const { data } = await auth.auth.refreshSession({ refresh_token: stored[REFRESH] });
            if (data.session) await auth.auth.admin.signOut(data.session.access_token, 'local');
          }
        }
        setSession(res);
        return res.status(200).json({ ok: true });
      }
      if (action !== 'login' && action !== 'setup') return res.status(400).json({ error: '잘못된 요청입니다.' });
      const { email, password, token } = req.body ?? {};
      if (typeof password !== 'string' || password.length > 128 || password.length < (action === 'setup' ? 12 : 1)) {
        return res.status(400).json({ error: action === 'setup' ? '비밀번호는 12~128자로 설정해 주세요.' : '이메일과 비밀번호를 입력해 주세요.' });
      }
      const auth = client();
      if (action === 'setup') {
        if (typeof token !== 'string' || !/^[a-f0-9]{32,128}$/i.test(token)) return res.status(400).json({ error: '설정 링크가 올바르지 않습니다.' });
        const { data, error } = await auth.auth.verifyOtp({ token_hash: token, type: 'recovery' });
        if (error || !data.session || !approved(data.user)) return res.status(401).json({ error: '설정 링크가 만료됐거나 권한이 없습니다. 새 설정 링크를 요청해 주세요.' });
        const result = await auth.auth.updateUser({ password });
        if (result.error) return res.status(400).json({ error: '비밀번호를 설정하지 못했습니다. 다른 비밀번호로 다시 시도해 주세요.' });
        setSession(res, data.session);
        return res.status(200).json({ email: data.user.email });
      }
      if (typeof email !== 'string' || email.length > 254) return res.status(400).json({ error: '이메일을 입력해 주세요.' });
      const { data, error } = await auth.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.session || !approved(data.user)) {
        if (data.session) await auth.auth.signOut({ scope: 'local' });
        return res.status(401).json({ error: '이메일·비밀번호 또는 조회 권한을 확인해 주세요.' });
      }
      setSession(res, data.session);
      return res.status(200).json({ email: data.user.email });
    }

    const user = await authenticate(req, res);
    if (!user) return;
    if (action === 'session') return res.status(200).json({ email: user.email });
    if (action !== 'logs') return res.status(400).json({ error: '잘못된 요청입니다.' });

    const pageText = single(req.query.page) || '1';
    const search = single(req.query.search).trim();
    const fromText = single(req.query.from);
    const toText = single(req.query.to);
    if (!/^\d{1,5}$/.test(pageText) || Number(pageText) < 1 || Number(pageText) > 10000 || search.length > 200) throw new Error('BAD_FILTER');
    const from = dateBoundary(fromText, false);
    const to = dateBoundary(toText, true);
    if (from && to && from > to) throw new Error('BAD_FILTER');
    const page = Number(pageText);
    let query = client().from('chat_logs')
      .select('id,question,answer,created_at', { count: 'exact' })
      .order('created_at', { ascending: false }).order('id', { ascending: false });
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);
    if (search) {
      // Escape LIKE wildcards, then quote the PostgREST filter value.
      const pattern = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
      const quoted = `"${pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
      query = query.or(`question.ilike.${quoted},answer.ilike.${quoted}`);
    }
    let { data, count, error } = await query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    let actualPage = page;
    if (error?.code === 'PGRST103' && page > 1) {
      // Records may disappear between pages (e.g. retention cleanup).
      ({ data, count, error } = await query.range(0, PAGE_SIZE - 1));
      actualPage = 1;
    }
    if (error) throw error;
    return res.status(200).json({ logs: data ?? [], total: count ?? 0, page: actualPage, pageSize: PAGE_SIZE });
  } catch (error) {
    if (error instanceof Error && error.message === 'BAD_FILTER') return res.status(400).json({ error: '날짜와 검색 조건을 확인해 주세요.' });
    // Never return upstream errors, credentials or query contents to the client.
    console.error('[pastor] request failed');
    return res.status(503).json({ error: '잠시 후 다시 시도해 주세요. 계속되면 서버 연결 상태를 확인해 주세요.' });
  }
}
