# 보안 보완 (2026-11-27)

## 코드에 적용한 내용

- 질문 2,000자, 직전 대화 최대 6개(각 4,000자), 요청 본문 최대 40KB.
- 대화 역할은 user/assistant만 허용. 외부 출처·JSON 이외 요청 거부.
- GPT 답변 최대 1,200 토큰. 오류 상세와 서버 설정 이름은 방문자에게 반환하지 않음.
- 관리자 권한은 계속 서버 소유 app_metadata로 확인. 비로그인 조회 401.
- CSP, 프레임 삽입 차단, MIME 추측 차단, Referrer/Permissions 정책, API no-store.
- Tailwind CDN 실행 스크립트를 제거하고 기존 CDN과 같은 3.x 계열 CSS를 빌드 시 생성.
- 사용하지 않는 border 및 타입 참조만을 위해 설치했던 Vercel 빌드 SDK 제거.
- 패키지 audit fix는 호환 범위 내 적용. 2026-11-27 audit 전체/서비스 의존성 모두 0건.

## 별도 운영 설정

Origin 검사는 브라우저의 외부 사이트 요청 방지이며 봇 인증이나 비용 상한이 아니다.
서버리스 메모리에 횟수를 세는 방식은 여러 서버에서 우회되므로 사용하지 않았다.
Vercel 방화벽에 POST /api/ask, IP별 10회/60초 규칙을 사용자 승인 후 적용했다.
firewallEnabled=true, active rule 1개, 미공개 변경 0개를 확인했다.
빈 질문 12회로 유료 AI 호출 없이 검사: 1~10회 400, 11~12회 429, 홈페이지 GET은 200.
목회자 POST 제한 규칙 추가는 현재 요금제에서 402로 거절되어 적용하지 않았다.
유료 플랜 변경은 하지 않았다. 공유 와이파이는 IP 한 개로 계산될 수 있으므로
정식 챗봇 공개 전 실제 동시 이용량에 맞춰 기준을 검토한다.

Google Cloud의 YouTube API 키는 HTTP referrer를 정식 도메인과 필요한 preview 도메인으로
제한하고, API 제한을 YouTube Data API v3에만 설정해야 한다. 브라우저에 이 키가
포함되는 것은 현재 구조상 정상이며, Google 관리 권한 없이 제한 적용 여부를 확인할 수 없다.
API 키나 토큰을 Git에 저장하지 않는다.

## 검증

`npm run typecheck`, `npm test`, `npm run build`, `npm run lint`, `npm audit`.
관리자 통합 테스트는 PASTOR_INTEGRATION=1로 명시 실행하며 임시 계정/합성 로그만 생성·정리.
2026-11-27: 자동 테스트 5개 모두 통과, 빌드/lint/typecheck 통과.
확인용 배포의 고린도후서 6:2 질문에 실제 답변 HTTP 200, CSP 및 DENY 응답 헤더 확인.
레이아웃은 브라우저에서 확인. 지도/YouTube 외부 서비스의 모든 기능까지 보증하는 검사는 아니다.
정식 홈페이지 main에는 API/챗봇을 합치지 않고 공통 패키지·CSS·보안 헤더만 별도로 적용한다.

이 검사는 전체 침투 테스트나 침해 이력 조사, Google/GitHub 계정 보안 감사는 아니다.
