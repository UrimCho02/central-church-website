import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import handler from '../api/pastor.ts';

config({ path: process.env.PASTOR_TEST_ENV || '.env', quiet: true });

// Explicit opt-in: creates and cleans up isolated test users and test log rows.
test('pastor access, setup, search, pagination and logout', { skip: process.env.PASTOR_INTEGRATION !== '1' }, async () => {
  const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  const marker = `pastor-test-${randomUUID()}`;
  const password = `${randomBytes(24).toString('hex')}Aa!`;
  const ids: string[] = [];
  const logIds: number[] = [];
  function cookieValues(response: any) {
    return (response.headers['set-cookie'] || []).map((value: string) => value.split(';')[0]).join('; ');
  }
  async function call(action: string, method = 'GET', body: any = {}, cookie = '', query = {}, origin = 'https://preview.example.com') {
    const result: any = { statusCode: 200, headers: {}, body: null };
    const response: any = {
      setHeader(key: string, value: any) { result.headers[key.toLowerCase()] = value; return this; },
      status(code: number) { result.statusCode = code; return this; },
      json(data: any) { result.body = data; return this; },
    };
    await handler({ method, body, query: { action, ...query }, headers: { host: 'preview.example.com', origin, cookie, 'content-type': 'application/json' } } as any, response);
    return result;
  }
  try {
    const pastorEmail = `${marker}@example.com`;
    const otherEmail = `${marker}-other@example.com`;
    for (const [email, app_metadata, user_metadata] of [
      [pastorEmail, { chat_logs_role: 'pastor' }, {}],
      [otherEmail, {}, { chat_logs_role: 'pastor' }],
    ] as const) {
      const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, app_metadata, user_metadata });
      assert.ifError(error); ids.push(data.user!.id);
    }
    const { data: logs, error: insertError } = await admin.from('chat_logs').insert([
      { question: `${marker} 쉼표, 괄호(안) "따옴표" 100% _`, answer: '<script>alert(1)</script> 테스트 답변' },
      { question: `${marker} 두 번째 질문`, answer: '두 번째 답변' },
    ]).select('id');
    assert.ifError(insertError); logIds.push(...logs!.map((x) => x.id));

    const anonymous = await call('logs');
    assert.equal(anonymous.statusCode, 401); assert.equal(anonymous.body.logs, undefined);
    assert.match(anonymous.headers['cache-control'], /no-store/);
    assert.equal((await call('logs', 'GET', {}, 'cc_pastor_access=forged')).statusCode, 401);
    assert.equal((await call('login', 'POST', { email: pastorEmail, password }, '', {}, 'https://evil.example')).statusCode, 403);
    assert.equal((await call('login', 'POST', { email: pastorEmail, password: 'wrong' })).statusCode, 401);
    assert.equal((await call('login', 'POST', { email: otherEmail, password })).statusCode, 401);

    const login = await call('login', 'POST', { email: pastorEmail, password });
    assert.equal(login.statusCode, 200); assert.equal(login.body.email, pastorEmail);
    assert.equal(login.body.access_token, undefined);
    for (const value of login.headers['set-cookie']) { assert.match(value, /HttpOnly/); assert.match(value, /SameSite=Strict/); }
    const cookie = cookieValues(login);
    assert.equal((await call('session', 'GET', {}, cookie)).statusCode, 200);
    const found = await call('logs', 'GET', {}, cookie, { search: marker, page: '1' });
    assert.equal(found.statusCode, 200); assert.equal(found.body.total, 2); assert.equal(found.body.logs.length, 2);
    const beyond = await call('logs', 'GET', {}, cookie, { search: marker, page: '2' });
    assert.equal(beyond.statusCode, 200); assert.equal(beyond.body.page, 1); assert.equal(beyond.body.logs.length, 2);
    const quoted = await call('logs', 'GET', {}, cookie, { search: '쉼표, 괄호(안) "따옴표" 100% _' });
    assert.equal(quoted.statusCode, 200); assert.equal(quoted.body.total, 1);
    assert.equal((await call('logs', 'GET', {}, cookie, { from: '2026-02-30' })).statusCode, 400);
    assert.equal((await call('logs', 'GET', {}, cookie, { from: '2026-12-31', to: '2026-01-01' })).statusCode, 400);
    assert.equal((await call('logs', 'GET', {}, cookie, { page: '-1' })).statusCode, 400);
    assert.equal((await call('logs', 'GET', {}, cookie, { search: marker, from: '2000-01-01', to: '2000-01-01' })).body.total, 0);

    // An authenticated ordinary user still cannot read the underlying table.
    const ordinary = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
    assert.ifError((await ordinary.auth.signInWithPassword({ email: otherEmail, password })).error);
    const protectedRows = await ordinary.from('chat_logs').select('id').in('id', logIds);
    assert.equal(protectedRows.data?.length ?? 0, 0);

    const refreshOnly = cookie.split('; ').find((x: string) => x.startsWith('cc_pastor_refresh='));
    const refreshed = await call('session', 'GET', {}, refreshOnly);
    assert.equal(refreshed.statusCode, 200);
    const refreshedCookie = cookieValues(refreshed);
    assert.equal((await call('logout', 'POST', {}, refreshedCookie)).statusCode, 200);
    assert.equal((await call('session', 'GET', {}, refreshedCookie.split('; ').find((x: string) => x.startsWith('cc_pastor_refresh=')))).statusCode, 401);

    const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: 'recovery', email: pastorEmail });
    assert.ifError(linkError);
    const token = link.properties!.hashed_token;
    const setup = await call('setup', 'POST', { token, password: `${password}new` });
    assert.equal(setup.statusCode, 200); assert.equal(setup.body.email, pastorEmail);
    assert.equal((await call('setup', 'POST', { token, password: `${password}new` })).statusCode, 401);

    // Approval is checked against current server metadata on every request.
    const setupCookie = cookieValues(setup);
    assert.ifError((await admin.auth.admin.updateUserById(ids[0], { app_metadata: { chat_logs_role: null } })).error);
    assert.equal((await call('logs', 'GET', {}, setupCookie)).statusCode, 403);
  } finally {
    if (logIds.length) assert.ifError((await admin.from('chat_logs').delete().in('id', logIds).like('question', `${marker}%`)).error);
    for (const id of ids) assert.ifError((await admin.auth.admin.deleteUser(id)).error);
  }
});
