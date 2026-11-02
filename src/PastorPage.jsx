import { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, Search, LogOut, ChevronLeft, ChevronRight, RefreshCw, LockKeyhole } from 'lucide-react';

const dateFormat = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

async function api(action, options = {}, params = {}) {
  const response = await fetch(`/api/pastor?${new URLSearchParams({ action, ...params })}`, {
    credentials: 'same-origin', cache: 'no-store', ...options,
  });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error || '요청을 완료하지 못했습니다.'), { status: response.status });
  return data;
}

export default function PastorPage() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [filter, setFilter] = useState({ search: '', from: '', to: '', page: 1 });
  const [result, setResult] = useState({ logs: [], total: 0, pageSize: 20 });
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [reload, setReload] = useState(0);
  const generation = useRef(0);
  const setupPending = useRef(false);

  useEffect(() => {
    document.title = '목회자 질문·답변 조회 | 센트럴처치';
    let cancelled = false;
    const acceptSetupLink = () => {
      const token = new URLSearchParams(window.location.hash.slice(1)).get('setup');
      if (!token) return false;
      cancelled = true;
      setupPending.current = true;
      setSetupToken(token);
      setUser(null);
      generation.current += 1;
      setResult({ logs: [], total: 0, pageSize: 20 });
      setLoaded(false);
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setChecking(false);
      return true;
    };
    window.addEventListener('hashchange', acceptSetupLink);
    if (!acceptSetupLink() && !setupPending.current) {
      api('session').then((data) => { if (!cancelled) setUser(data); })
        .catch((e) => { if (!cancelled && e.status !== 401) setError(e.message); })
        .finally(() => { if (!cancelled) setChecking(false); });
    }
    return () => { cancelled = true; window.removeEventListener('hashchange', acceptSetupLink); };
  }, []);

  const expire = useCallback(() => {
    generation.current += 1;
    setUser(null);
    setResult({ logs: [], total: 0, pageSize: 20 });
    setLoaded(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    const current = ++generation.current;
    setLoading(true);
    setLoaded(false);
    setResult({ logs: [], total: 0, pageSize: 20 });
    setError('');
    api('logs', { signal: controller.signal }, { ...filter, page: String(filter.page) })
      .then((data) => {
        if (generation.current === current) {
          if (data.page !== filter.page) { setFilter((f) => ({ ...f, page: data.page })); return; }
          setResult(data); setLoaded(true);
        }
      })
      .catch((e) => {
        if (e.name === 'AbortError' || generation.current !== current) return;
        if (e.status === 401 || e.status === 403) expire();
        setError(e.message);
      }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [user, filter, reload, expire]);

  // Clear private text when a restored browser tab no longer has a session.
  useEffect(() => {
    if (!user) return;
    const check = () => {
      if (document.visibilityState === 'visible') api('session').catch((e) => { if (e.status === 401 || e.status === 403) expire(); });
    };
    document.addEventListener('visibilitychange', check);
    return () => document.removeEventListener('visibilitychange', check);
  }, [user, expire]);

  async function login(event) {
    event.preventDefault();
    setError('');
    if (setupToken && password !== confirmation) { setError('비밀번호가 서로 다릅니다.'); return; }
    setBusy(true);
    try {
      const data = await api(setupToken ? 'setup' : 'login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setupToken ? { token: setupToken, password } : { email, password }),
      });
      setupPending.current = false;
      setPassword(''); setConfirmation(''); setSetupToken(''); setUser(data);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function logout() {
    setBusy(true); setError('');
    try { await api('logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); expire(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  const field = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:ring-2 focus:ring-red-400';
  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return <div className="min-h-screen bg-stone-50 text-slate-900 font-noto font-normal">
    <header className="border-b border-stone-200 bg-white px-5 py-5">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-3 font-bold"><BookOpen className="text-red-500" size={25} />센트럴처치 <span className="text-sm font-normal text-slate-500">목회자 전용</span></a>
        {user && <div className="flex flex-wrap items-center gap-3 text-sm"><span className="text-slate-600">{user.email}</span><button onClick={logout} disabled={busy} className="flex items-center gap-1 rounded-lg border px-3 py-2 hover:bg-stone-50 disabled:opacity-50"><LogOut size={16} />로그아웃</button></div>}
      </div>
    </header>
    {checking ? <p role="status" className="p-16 text-center text-slate-500">로그인 상태를 확인하고 있습니다…</p> : !user ?
      <main className="mx-auto max-w-md px-5 py-14 sm:py-20">
        <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9">
          <LockKeyhole className="mb-5 text-red-500" size={30} />
          <h1 className="text-2xl font-bold">{setupToken ? '비밀번호 설정' : '질문·답변 조회'}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{setupToken ? '앞으로 로그인할 때 사용할 비밀번호를 설정해 주세요.' : '승인된 계정으로 로그인하면 챗봇에 남겨진 질문과 답변을 확인할 수 있습니다.'}</p>
          <form onSubmit={login} className="mt-7 space-y-5">
            {!setupToken && <label className="block text-sm font-medium">이메일<input type="email" autoComplete="username" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} className={`${field} mt-2`} /></label>}
            <label className="block text-sm font-medium">{setupToken ? '새 비밀번호 (12자 이상)' : '비밀번호'}<input type="password" autoComplete={setupToken ? 'new-password' : 'current-password'} minLength={setupToken ? 12 : 1} maxLength={128} required value={password} onChange={(e) => setPassword(e.target.value)} className={`${field} mt-2`} /></label>
            {setupToken && <label className="block text-sm font-medium">비밀번호 확인<input type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className={`${field} mt-2`} /></label>}
            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-800">{error}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-red-500 py-3 font-bold text-white hover:bg-red-600 disabled:opacity-50">{busy ? '확인 중…' : setupToken ? '설정하고 시작하기' : '로그인'}</button>
          </form>
          <p className="mt-5 text-xs leading-5 text-slate-500">계정 추가 또는 비밀번호 재설정은 홈페이지 관리자에게 요청해 주세요.</p>
        </div>
      </main> : <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight">챗봇 질문·답변</h1><p className="mt-3 text-sm leading-6 text-slate-600">최신 기록부터 표시됩니다. 질문을 누르면 답변 전문을 볼 수 있습니다.</p></div><button onClick={() => setReload((n) => n + 1)} disabled={loading} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm disabled:opacity-50"><RefreshCw size={16} />새로고침</button></div>
        <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">상담 내용에는 개인적인 사정이 포함될 수 있습니다. 내용을 외부에 공유할 때 주의해 주세요. 현재 기록은 질문·답변 한 건씩 표시됩니다.</p>
        <form onSubmit={(e) => { e.preventDefault(); setFilter({ search, from, to, page: 1 }); }} className="mt-6 rounded-2xl border bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_165px_165px_auto]">
            <label className="block text-sm font-medium">내용 검색<input type="search" maxLength={200} placeholder="질문 또는 답변 검색" value={search} onChange={(e) => setSearch(e.target.value)} className={`${field} mt-2`} /></label>
            <label className="block text-sm font-medium">시작일<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={`${field} mt-2`} /></label>
            <label className="block text-sm font-medium">종료일<input type="date" min={from || undefined} value={to} onChange={(e) => setTo(e.target.value)} className={`${field} mt-2`} /></label>
            <button className="flex items-center justify-center gap-2 self-end rounded-xl bg-slate-800 px-5 py-3 text-white"><Search size={18} />조회</button>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500"><span>날짜·시간은 한국 시간 기준입니다.</span><button type="button" className="underline" onClick={() => { setSearch(''); setFrom(''); setTo(''); setFilter({ search: '', from: '', to: '', page: 1 }); }}>조건 초기화</button></div>
        </form>
        {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
        <div aria-live="polite" className="my-5 text-sm text-slate-600">{loading ? '기록을 불러오고 있습니다…' : loaded ? `총 ${result.total.toLocaleString()}건 · ${filter.page} / ${pages} 페이지` : ''}</div>
        {loaded && result.logs.length === 0 && <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">조건에 맞는 질문·답변이 없습니다.</div>}
        <section aria-label="질문과 답변 목록" className="space-y-3">
          {result.logs.map((log) => <details key={log.id} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <summary className="cursor-pointer px-5 py-5 marker:text-red-400 sm:px-6"><span className="mb-2 block text-xs font-normal text-slate-500">{dateFormat.format(new Date(log.created_at))} · 기록 #{log.id}</span><span className="whitespace-pre-wrap break-words text-base font-semibold leading-7">{log.question}</span><span className="mt-2 block text-xs font-normal text-red-600 group-open:hidden">답변 펼쳐보기</span></summary>
            <div className="border-t border-stone-100 px-5 py-6 sm:px-6"><h2 className="mb-3 text-sm font-bold text-red-600">챗봇 답변</h2><p className="whitespace-pre-wrap break-words text-base font-normal leading-8 text-slate-800">{log.answer}</p></div>
          </details>)}
        </section>
        {loaded && <nav aria-label="목록 페이지" className="mt-7 flex items-center justify-center gap-5"><button disabled={loading || filter.page <= 1} onClick={() => setFilter((f) => ({ ...f, page: f.page - 1 }))} className="flex items-center gap-1 rounded-xl border bg-white px-4 py-3 disabled:opacity-30"><ChevronLeft size={18} />이전</button><span className="text-sm">{filter.page} / {pages}</span><button disabled={loading || filter.page >= pages} onClick={() => setFilter((f) => ({ ...f, page: f.page + 1 }))} className="flex items-center gap-1 rounded-xl border bg-white px-4 py-3 disabled:opacity-30">다음<ChevronRight size={18} /></button></nav>}
      </main>}
  </div>;
}
