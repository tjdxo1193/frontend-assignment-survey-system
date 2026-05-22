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

## 설계 의사결정 근거

### 상태관리 — Zustand

Redux는 액션·리듀서·셀렉터 보일러플레이트가 크고, Context API는 값이 바뀔 때마다 Provider 하위 전체가 리렌더링됩니다. Zustand는 두 문제를 동시에 해결합니다. 특히 `persist` 미들웨어를 쓰면 localStorage 직렬화·복원 로직을 별도로 작성하지 않아도 되므로 "이탈 후 세션 재개" 요구사항을 최소 코드로 충족할 수 있었습니다.

### 라우팅 — React Router v7

페이지 전환이 세 개(홈 → 설문 → 완료)에 불과하지만, 미완료 세션 보호(`/survey` 진입 시 토큰 없으면 `/` 리다이렉트)와 완료 후 재답변 차단(`/complete` 고정)에 선언적 라우트가 명확하게 동작합니다. v7은 Data Router(loader/action)를 제공하지만 이번 과제에서는 서버 상태를 Zustand + API 서비스 레이어에서 관리하므로 기본 `<Routes>`만 사용했습니다.

### 에러 처리 — Axios 응답 인터셉터 중앙화

HTTP 에러를 각 서비스 함수에서 개별 처리하면 코드가 산재됩니다. Axios 인터셉터에서 상태 코드를 한 번에 받아 한글 메시지 `Error`로 변환한 뒤, 호출 측은 `try/catch`로만 받습니다. 401은 세션 초기화 + 홈 리다이렉트, 403은 완료 페이지 리다이렉트처럼 UX 분기가 필요한 경우에만 페이지 컴포넌트에서 추가 처리했습니다.

### 분기 로직 — 클라이언트 유틸 + MSW 서버 양쪽 구현

`resolveNextQuestionId`를 `src/utils/nextQuestion.ts`(클라이언트)와 MSW 핸들러 양쪽에 동일하게 구현했습니다. 실 서버 연결 시에는 서버가 `nextQuestionId`를 응답으로 내려주므로 클라이언트 분기 로직은 동작하지 않습니다. 모킹 환경에서 서버 역할을 대체하기 위해 MSW 핸들러 내부에서 분기를 계산합니다.

### MSW — json-server 대신 선택한 이유

json-server는 별도 프로세스를 실행해야 하고 동적인 세션 상태(답변 누적, 분기 계산, 에러 코드 재현)를 구현하기 어렵습니다. MSW는 Service Worker로 브라우저 내부에서 요청을 가로채므로 실제 `axios` 인스턴스 코드를 그대로 사용하면서 임의 로직을 핸들러에 작성할 수 있습니다.

### 접근성

- 모든 입력(`radio`, `checkbox`, `textarea`)에 `<label>`을 연결해 스크린 리더가 항목을 올바르게 읽도록 했습니다.
- 에러 메시지는 별도 페이지 이동 없이 인라인으로 노출해 오류 컨텍스트를 유지합니다.
- `<button>` 태그를 사용해 키보드 포커스·Enter 키 동작이 기본으로 지원됩니다.
- 진행 상황은 `ProgressBar`로 시각화했습니다.

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

## 가정 및 트레이드오프

| 항목 | 내용 |
| ---- | ---- |
| 설문 ID 고정 | 현재 `unitblack-join-survey` 하나만 존재한다고 가정합니다. 복수 설문이 필요하면 URL 파라미터(`/survey/:surveyId`)로 확장할 수 있습니다. |
| 문항 순서는 서버 책임 | 클라이언트는 `nextQuestionId`만 따라갑니다. 분기 규칙 변경 시 서버(또는 MSW 핸들러)만 수정하면 됩니다. |
| localStorage 의존 | 세션 토큰을 localStorage에 저장하므로 시크릿 모드나 브라우저 초기화 시 세션이 소멸됩니다. 보안이 중요한 서비스라면 httpOnly 쿠키나 서버 세션으로 전환해야 합니다. |
| 멀티 탭 미지원 | 같은 브라우저에서 두 탭을 동시에 열면 Zustand persist 상태가 충돌할 수 있습니다. `storage` 이벤트 리스너로 탭 간 동기화를 추가하면 해결됩니다. |
| 런타임 스키마 검증 없음 | Zod 등의 런타임 검증 없이 서버 응답을 TypeScript 타입으로 단언합니다. 실 서버와 계약이 바뀌면 런타임 오류가 발생할 수 있습니다. |
| MSW mockDb 직렬화 | E2E 테스트에서 페이지 새로고침 후 세션 재개를 검증하기 위해 MSW 인메모리 DB를 localStorage에 직렬화했습니다. 이로 인해 테스트 간 격리에 `removeItem` 초기화가 필요합니다. |
| 세션 토큰 직접 입력 UI | Notion 요구사항에 "생성 시점에 발급받은 Session token을 이용하며, 같은 token을 사용하면 같은 Session을 계속 활용할 수 있다"고 명시되어 있어 토큰 직접 입력 UI를 구현했습니다. 이를 통해 다른 기기·브라우저에서도 세션을 재개할 수 있습니다. |

---

## API 명세 (요약)

| 메서드 | 엔드포인트                                 | 설명                             |
| ------ | ------------------------------------------ | -------------------------------- |
| GET    | `/surveys/:surveyId`                       | 설문 전체 조회                   |
| GET    | `/surveys/:surveyId/questions/:questionId` | 단일 문항 조회                   |
| POST   | `/sessions`                                | 세션 생성                        |
| GET    | `/sessions`                                | 세션 조회 (X-Session-Token 필요) |
| POST   | `/sessions/answers`                        | 답변 제출 (X-Session-Token 필요) |
