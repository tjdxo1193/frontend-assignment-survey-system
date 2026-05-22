# 설문조사 클라이언트 — 황성태

UnitBlack 프론트엔드 과제 제출입니다.

---

## 주요 화면

> 스크린샷 / GIF는 제출 전 첨부 예정입니다.

---

## 실행 방법

```bash
npm install
npm run dev        # http://localhost:3001
```

백엔드 없이 MSW 모킹으로 완전 동작합니다.

### 실제 백엔드 연결 시

```bash
VITE_MOCK_API=false npm run dev
```

기본 API base URL은 `http://localhost:3000`입니다.  
변경이 필요한 경우 `VITE_API_BASE_URL` 환경변수로 지정하세요.

---

## 테스트

```bash
npm test           # Vitest 단위/통합 테스트
npm run test:e2e   # Playwright E2E 테스트
```

---

## 기술 스택

| 구분      | 선택                      | 이유                                      |
| --------- | ------------------------- | ----------------------------------------- |
| Framework | React 18 + TypeScript     | 요구사항                                  |
| Routing   | React Router v7           | SPA 표준 라우팅                           |
| 상태관리  | Zustand v5                | 경량, persist 미들웨어로 세션 복구        |
| HTTP      | Axios                     | 인터셉터로 X-Session-Token 일괄 주입      |
| Styling   | Tailwind CSS v4           | 유틸리티 퍼스트, 빠른 반응형 구현         |
| Mock      | MSW v2                    | 네트워크 레벨 인터셉트로 실API코드 재사용 |
| Test      | Vitest + RTL + Playwright | 단위/통합/E2E 풀커버                      |

---

## 아키텍처

```
src/
├── pages/           # 라우트별 페이지 컴포넌트
├── components/
│   ├── common/      # Button, LoadingSpinner, ErrorMessage, ErrorBoundary
│   └── survey/      # QuestionCard, 입력 컴포넌트들, ProgressBar
├── store/           # Zustand 전역 상태 (세션 + 설문 흐름)
├── services/        # Axios API 클라이언트 + survey/session 서비스
├── mocks/           # MSW 핸들러 + 인메모리 세션 DB
├── utils/
│   ├── nextQuestion.ts  # 분기 로직 (singleChoice, multiChoice, conditional next[])
│   └── validation.ts    # 답변 유효성 검사
└── types/           # API DTO 타입 정의
```

---

## 핵심 구현 포인트

### 세션 관리

- `POST /sessions`로 발급받은 `sessionToken`을 Zustand `persist` 미들웨어가 localStorage에 저장
- 페이지 재진입 시 저장된 토큰으로 `GET /sessions` 호출 → 이어서 진행 가능
- 토큰 입력 UI로 다른 기기/브라우저에서 발급받은 세션도 재개 가능

### 조건부 분기 (nextQuestion)

- `singleChoice`: 선택한 option의 `nextQuestionId`
- `multiChoice` / `text`: 문항의 `nextQuestionId` (직접 지정)
- `next[]` 조건 배열 (예: q5_example): 이전 답변을 순회하여 `anySelectedIn` 평가 후 분기

```
q5_example
  └─ q3_tech_stack에 WebRTC(q3t_o7) 선택 → q6_sfu
  └─ 기본값                               → q6_workstyle
```

### MSW 모킹

- 실제 API 클라이언트 코드를 그대로 사용하며 네트워크만 인터셉트
- 인메모리 세션 DB로 답변 누적, 분기 계산, 에러 코드 재현 (400/401/403/404)
- `VITE_MOCK_API=false` 한 줄로 실 백엔드 전환

### 에러 처리

| 코드    | 상황                           | 처리                        |
| ------- | ------------------------------ | --------------------------- |
| 400     | 잘못된 답변 타입 / 잘못된 문항 | 인라인 에러 메시지          |
| 401     | 토큰 없음 / 미매칭             | 홈 리다이렉트 + 세션 초기화 |
| 403     | 완료된 세션에 재답변           | 완료 페이지 리다이렉트      |
| 404     | 존재하지 않는 문항             | 인라인 에러 + 재시도 버튼   |
| Network | 서버 응답 없음                 | 인라인 에러 + 재시도 버튼   |

---

## API 명세 (요약)

| 메서드 | 엔드포인트                                 | 설명                             |
| ------ | ------------------------------------------ | -------------------------------- |
| GET    | `/surveys/:surveyId`                       | 설문 전체 조회                   |
| GET    | `/surveys/:surveyId/questions/:questionId` | 단일 문항 조회                   |
| POST   | `/sessions`                                | 세션 생성                        |
| GET    | `/sessions`                                | 세션 조회 (X-Session-Token 필요) |
| POST   | `/sessions/answers`                        | 답변 제출 (X-Session-Token 필요) |
