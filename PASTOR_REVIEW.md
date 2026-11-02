# 목회자 질문·답변 조회

프리뷰 주소 뒤에 `/?pastor`를 붙이거나 홈페이지 하단의 **목회자 로그인**으로 접속합니다.

로그인은 Supabase Auth 이메일·비밀번호를 사용합니다. 공개 회원가입 기능은 없습니다.
서버가 매 요청마다 현재 사용자와 `app_metadata.chat_logs_role === "pastor"`를 검증합니다.
일반 사용자·비로그인 사용자는 조회할 수 없으며, `chat_logs` RLS는 그대로 유지합니다.
서버 전용 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`만 사용하고 추가 환경변수는 없습니다.

## 계정 추가와 권한 회수

1. Supabase Authentication에서 계정을 생성합니다. 직접 이메일을 보내려면 발송 여부를 먼저 확인합니다.
2. 서버의 Auth Admin API로 해당 사용자의 **app_metadata**에 `chat_logs_role: "pastor"`를 설정합니다. 사용자 수정 가능한 user_metadata는 사용하지 않습니다.
3. 최초 비밀번호 설정에는 Auth Admin의 recovery 링크 생성 결과 중 `hashed_token`을 사용해 `/?pastor#setup=토큰` 형태로 전달합니다. 토큰은 비밀번호와 같이 취급하고 저장소·공개 문서에 기록하지 않습니다. 화면에서 토큰을 즉시 URL에서 지우고, 비밀번호 설정 시 한 번만 소비합니다.
4. 권한 회수는 app_metadata의 해당 값을 제거하면 됩니다. 기존 세션도 다음 조회에서 차단됩니다.

## 조회 범위

최신순 20건씩 표시하며 질문·답변 검색, 한국 시간 기준 날짜 필터, 전체 답변 펼치기를 지원합니다.
기존 로그에는 대화 묶음 ID가 없어 질문·답변 한 건씩 표시합니다. 검토 표시·대화 묶음 기능은 포함하지 않습니다.
API 응답은 no-store이며 로그인 토큰은 HttpOnly·SameSite=Strict 쿠키를 사용합니다. Vercel에서는 Secure도 적용합니다.

## 검증

`npm run build`, `npm run lint` 후, 테스트용 Supabase 환경에서 다음을 실행합니다.

```
PASTOR_INTEGRATION=1 node --import tsx --test tests/pastor.integration.test.ts
```

필요하면 `PASTOR_TEST_ENV`로 환경변수 파일 경로를 지정합니다. 통합 검증은 임시 계정 두 개와 합성 로그 두 건을 생성하고 종료 시 정리합니다.
