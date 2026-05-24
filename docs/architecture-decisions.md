# 기술 선택 및 아키텍처 결정 정리

이 프로젝트에서 내린 모든 기술적 결정을 한 곳에 정리한다.  
각 항목마다 "이게 뭔지", "대안이 뭐가 있었는지", "왜 이걸 골랐는지"를 설명한다.

---

## 1. 빌드 도구 — Vite

### 이게 뭔지

브라우저는 TypeScript와 JSX를 직접 읽지 못한다. Vite는 이 파일들을 브라우저가 이해하는 JavaScript로 변환하고, 개발 서버를 띄워주는 도구다.

개발 서버를 켤 때 Webpack 같은 기존 도구는 전체 파일을 미리 번들로 만들고 나서 서버를 올린다. Vite는 브라우저의 네이티브 ESM(import/export 문법)을 그대로 활용해 번들링 없이 즉각 서버를 켠다. 파일을 수정하면 그 파일 하나만 교체한다.

### 대안

- **Webpack (CRA)**: 설정이 복잡하고 콜드 스타트가 느림. TypeScript path alias 설정을 별도로 해야 함
- **Next.js**: SSR 프레임워크로 빌드 도구 역할도 포함하지만, 이 프로젝트는 SSR이 필요 없음

### 왜 Vite인가

이 프로젝트는 인증된 사용자만 접근하는 단일 설문 SPA다. SEO가 필요 없고 서버 사이드 렌더링이 필요 없다. Vite는 설정이 거의 없어도 TypeScript, JSX, path alias가 바로 동작한다. 또한 Vitest와 vite.config.ts를 공유해서 테스트 환경 설정도 따로 없다.

---

## 2. 프레임워크 — React 18

### 이게 뭔지

UI를 컴포넌트 단위로 쪼개서 만드는 라이브러리다. 상태가 바뀌면 관련된 컴포넌트만 다시 그린다.

### 대안

- **Vue 3**: 러닝 커브가 낮고 공식 상태관리(Pinia)가 잘 통합됨
- **Svelte**: 컴파일 타임에 반응성을 처리해 런타임 번들이 작음

### 왜 React인가

과제 요구사항이 React + TypeScript를 지정했다. 생태계가 가장 크고 MSW, Zustand, Playwright 등 선택한 도구들의 React 지원이 가장 성숙하다.

---

## 3. 라우팅 — React Router v7

### 이게 뭔지

SPA에서 URL에 따라 어떤 컴포넌트를 보여줄지 결정하는 라이브러리다. 브라우저 주소창을 바꾸면서도 페이지 새로고침 없이 화면을 전환한다.

```tsx
<Routes>
  <Route path="/"        element={<HomePage />} />
  <Route path="/survey"  element={<SurveyPage />} />
  <Route path="/complete" element={<CompletionPage />} />
</Routes>
```

### 대안

- **Next.js App Router**: 파일 위치가 곧 URL이 되는 파일 기반 라우팅. SSR과 통합
- **TanStack Router**: 타입 안전성이 강하지만 학습 비용이 높음

### 왜 React Router v7인가

라우트가 세 개(홈·설문·완료)뿐이고 SSR이 필요 없다. 세션 토큰 없으면 `/survey` 진입을 막는 보호 로직, 완료 후 재진입 차단이 `useEffect + navigate`로 자연스럽게 표현된다. v7의 Data Router(loader/action)는 이번 과제 규모에서 불필요하므로 기본 `<Routes>`만 사용했다.

---

## 4. 상태관리 — Zustand v5

### 이게 뭔지

전역 상태를 관리하는 라이브러리다. 스토어를 함수 하나로 정의하고, 컴포넌트에서 필요한 값만 구독한다.

```ts
const useSurveyStore = create<State>()(
  persist(
    (set) => ({
      sessionToken: null,
      setSessionToken: (token) => set({ sessionToken: token }),
    }),
    { name: 'survey-session' }  // localStorage에 자동 저장
  )
);
```

구독하는 값이 바뀌지 않으면 컴포넌트는 리렌더링되지 않는다.

### 대안

- **Recoil**: Atom 단위로 상태를 쪼개는 방식. 페이스북 제작. 현재 유지보수 불투명
- **Redux Toolkit**: 액션·리듀서·셀렉터 보일러플레이트가 크지만 예측 가능성이 높음
- **Context API**: 추가 라이브러리 불필요. 값이 바뀌면 Provider 하위 전체 리렌더링 문제 있음
- **React Query + 로컬 state**: 서버 상태와 클라이언트 상태를 분리하는 방식

### 왜 Zustand인가

`persist` 미들웨어 한 줄이 핵심이었다. "이탈 후 세션 재개" 요구사항을 localStorage 직렬화·복원 코드를 직접 짜지 않고 충족할 수 있었다. Redux는 이 규모에서 보일러플레이트 대비 이득이 없고, Context는 리렌더링 문제가 있다.

---

## 5. HTTP 클라이언트 — Axios

### 이게 뭔지

서버에 HTTP 요청을 보내는 라이브러리다. 인터셉터로 요청·응답을 중간에 가로채 공통 처리를 할 수 있다.

```ts
// 요청 인터셉터: 모든 요청에 토큰 자동 첨부
apiClient.defaults.headers.common['X-Session-Token'] = token;

// 응답 인터셉터: 에러를 한 곳에서 한글 메시지로 변환
apiClient.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(new Error(한글메시지))
);
```

### 대안

- **fetch API**: 브라우저 내장. 인터셉터 없어서 공통 처리를 직접 구현해야 함
- **ky**: fetch 기반 경량 라이브러리. Axios보다 번들 크기가 작음

### 왜 Axios인가

인터셉터가 두 가지 문제를 동시에 해결했다. 첫째, `setSessionToken(token)` 한 번 호출로 이후 모든 요청에 `X-Session-Token`이 자동으로 붙는다. 둘째, 응답 인터셉터에서 HTTP 상태코드를 한글 에러 메시지로 변환해 서비스 함수와 컴포넌트에서 에러 처리 코드를 중복 작성할 필요가 없다.

---

## 6. 스타일링 — Tailwind CSS v4

### 이게 뭔지

미리 정의된 CSS 유틸리티 클래스를 HTML에 직접 붙이는 방식이다. 빌드 시점에 사용된 클래스만 추출해 CSS를 만든다.

```tsx
// 별도 CSS 파일이나 styled-component 없이 바로 작성
<button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
  다음
</button>
```

### 대안

- **Emotion (CSS-in-JS)**: JavaScript 안에 CSS를 작성. 이전 직장 GGQ 프로젝트에서 사용. 런타임 스타일 생성 비용 있음
- **CSS Modules**: 로컬 스코프 CSS. 별도 파일 필요
- **vanilla CSS**: 가장 단순하지만 스코프 충돌과 재사용성 문제

### 왜 Tailwind인가

런타임 비용이 없다. Emotion은 브라우저에서 실행 시 스타일을 생성하지만, Tailwind는 빌드 때 CSS를 다 만들어놓는다. v4는 Vite 플러그인으로 통합되어 별도 PostCSS 설정 파일도 필요 없다. 컴포넌트 파일 하나만 보면 레이아웃·색상·반응형이 모두 보여서 컨텍스트 전환이 없다.

---

## 7. API 모킹 — MSW v2

### 이게 뭔지

브라우저의 Service Worker를 이용해 실제 네트워크 요청을 가로채는 도구다. 서버가 없어도 실제 Axios 코드가 그대로 동작한다.

```ts
// 핸들러 정의
http.post('/sessions', () =>
  HttpResponse.json({ sessionToken: 'abc', nextQuestionId: 'q1' }, { status: 201 })
)

// 개발 서버·E2E: 브라우저 Service Worker로 동작 (setupWorker)
// 단위 테스트: Node.js 인터셉터로 동작 (setupServer)
```

### 대안

- **json-server**: 별도 프로세스로 실행하는 목 서버. 동적 세션 상태·분기 로직 구현이 어려움
- **axios-mock-adapter**: Axios 레벨에서 인터셉트. 실제 네트워크 레이어를 통과하지 않음
- **실 백엔드 연결**: 항상 서버가 실행 중이어야 함

### 왜 MSW인가

실제 `axios` 인스턴스·인터셉터·헤더 주입 코드를 그대로 사용하면서 백엔드 없이 동작한다. 인메모리 세션 DB(`mockDb`)를 핸들러 안에 구현해 답변 누적, 조건 분기, 에러 코드(400/401/403/404) 재현이 가능하다. `VITE_MOCK_API=false` 환경변수 한 줄로 실 백엔드로 전환된다.

---

## 8. 단위/통합 테스트 — Vitest

### 이게 뭔지

Vite 위에서 동작하는 테스트 러너다. `describe`, `it`, `expect`, `vi.fn()` 등 Jest와 API가 거의 동일하다.

### 대안

- **Jest**: 가장 널리 쓰이는 테스트 러너. Vite 프로젝트에서는 `babel-jest`나 `ts-jest` 설정, path alias 별도 등록이 필요
- **Mocha + Chai**: 유연하지만 설정이 더 많음

### 왜 Vitest인가

Vite 프로젝트라서 `vite.config.ts`를 공유한다. TypeScript 변환, path alias(`@/`), 환경변수가 테스트 환경에서도 자동으로 동작한다. Jest를 쓰면 `moduleNameMapper`로 alias를 다시 등록하고, babel 또는 ts-jest로 변환 파이프라인을 별도 구성해야 한다. 또한 esbuild 기반 변환으로 Jest 대비 콜드 스타트가 빠르다.

---

## 9. E2E 테스트 — Playwright

### 이게 뭔지

실제 Chromium(또는 Firefox, Safari) 브라우저를 띄워서 사용자가 클릭·입력하는 흐름을 코드로 자동화하는 도구다.

```ts
await page.getByRole('button', { name: '새 설문 시작하기' }).click();
await expect(page.getByText('우리 회사에 지원하는 주된 이유는 무엇인가요?')).toBeVisible();
```

### 대안

- **Cypress**: DX가 좋고 UI가 직관적. 하지만 Service Worker 지원이 제한적
- **Selenium**: 오래됐고 느림. 별도 WebDriver 설정 필요

### 왜 Playwright인가

MSW가 브라우저 Service Worker로 동작하기 때문이다. Cypress는 자체 네트워크 인터셉트(`cy.intercept`)를 사용하는데 Service Worker와 함께 쓰면 충돌이 발생하거나 별도 처리가 필요하다. Playwright는 실제 Chromium을 그대로 띄우므로 Service Worker가 정상 작동하고 MSW가 요청을 가로채는 것을 방해하지 않는다.

---

## 10. 에러 처리 전략 — Axios 인터셉터 중앙화

### 결정 내용

HTTP 에러를 각 서비스 함수나 컴포넌트에서 개별 처리하지 않고, Axios 응답 인터셉터 한 곳에서 처리한다.

```ts
// 1) ApiError 클래스: message 외에 status 필드를 가짐
export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// 2) 인터셉터: 에러를 ApiError로 통일
const ERROR_MESSAGES: Record<number, string> = {
  400: '답변 형식이 올바르지 않습니다.',
  401: '세션 토큰이 유효하지 않습니다.',
  403: '이미 완료된 설문입니다.',
  404: '설문 또는 문항을 찾을 수 없습니다.',
};

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const serverMsg = err.response?.data?.message;   // 1순위: 서버 메시지
    const mappedMsg = ERROR_MESSAGES[status];         // 2순위: 코드별 한글
    const fallback  = '네트워크 오류가 발생했습니다.'; // 3순위
    return Promise.reject(new ApiError(serverMsg ?? mappedMsg ?? fallback, status));
  }
);

// 3) 컴포넌트: status 코드로 분기 (문자열 매칭 없음)
const { status, message } = err as ApiError;
if (status === 403) { navigate('/complete'); return; }
if (status === 401) { clearSession(); navigate('/'); return; }
setError(message);
```

### 왜 이렇게 했는가

에러 처리 코드가 서비스 함수마다 중복되면 메시지 일관성이 깨지고 수정할 곳이 여러 군데가 된다. 인터셉터에서 `ApiError` 객체로 통일해 던지면 서비스 함수는 에러를 그냥 전파하고, 컴포넌트에서는 `status` 코드로 UX 분기를 처리한다.

초기 구현은 `Error` 객체를 사용했고 컴포넌트에서 `message.includes('완료된 설문')` 같은 문자열 매칭으로 분기했다. 이 방식은 서버 메시지가 조금만 바뀌어도 분기 로직이 깨진다. `ApiError.status`를 사용하면 서버 메시지와 분기 로직이 완전히 분리된다.

---

## 11. 세션 재개 전략 — Zustand persist + 토큰 입력 UI

### 결정 내용

`sessionToken`을 Zustand `persist` 미들웨어로 localStorage에 저장한다. 앱 재진입 시 저장된 토큰으로 `GET /sessions`를 호출해 세션 상태를 복원한다. 수동 토큰 입력 UI도 제공해 다른 기기·브라우저에서도 세션을 재개할 수 있다.

### 왜 이렇게 했는가

Notion 요구사항에 "생성 시점에 발급받은 Session token을 이용하며, 같은 token을 사용하면 같은 Session을 계속 활용할 수 있다"고 명시되어 있다. persist 미들웨어는 localStorage 읽기·쓰기 코드를 직접 작성하지 않고 이 요구사항을 충족한다. 수동 입력 UI는 localStorage가 없는 환경(시크릿 모드, 다른 기기)에서도 세션을 이어갈 수 있게 한다.

---

## 12. 조건 분기 로직 — 클라이언트 유틸 + MSW 서버 양쪽 구현

### 결정 내용

`resolveNextQuestionId`를 `src/utils/nextQuestion.ts`와 MSW 핸들러 양쪽에서 사용한다.

```ts
// singleChoice: 선택한 option의 nextQuestionId
// multiChoice/text: 문항의 nextQuestionId
// next[] 조건 배열: anySelectedIn으로 이전 답변 평가 후 분기
```

### 왜 이렇게 했는가

실 서버 연결 시에는 서버가 `nextQuestionId`를 응답으로 내려주므로 클라이언트 분기 로직은 동작하지 않는다. MSW 모킹 환경에서는 서버 역할을 대체해야 하므로 핸들러 안에서 동일 유틸로 분기를 계산한다. 로직이 한 함수에 있으므로 분기 규칙이 바뀌면 한 곳만 수정하면 된다.

---

## 13. 아키텍처 전체 구조

```
사용자 액션
  └─ Page 컴포넌트 (HomePage / SurveyPage / CompletionPage)
       ├─ Zustand store 읽기 (sessionToken, currentQuestion, answers ...)
       ├─ Service 레이어 호출 (survey.service / session.service)
       │    └─ Axios apiClient → MSW (또는 실 백엔드)
       │         └─ 응답 인터셉터 → Error 객체 통일
       └─ Zustand store 쓰기 (setCurrentQuestion, applySubmit ...)

컴포넌트 트리
  SurveyPage
    └─ QuestionCard (type-switch)
         ├─ SingleChoiceInput  (radio group)
         ├─ MultiChoiceInput   (checkbox group + min/max 검증)
         └─ TextInput          (textarea)
```

### 레이어 역할 분리

| 레이어 | 역할 | 파일 |
|--------|------|------|
| Page | 라우트 보호, 데이터 패칭, 에러 처리 | `src/pages/` |
| Component | UI 렌더링, 입력 수집, 유효성 검사 | `src/components/` |
| Store | 전역 상태, localStorage 동기화 | `src/store/surveyStore.ts` |
| Service | API 호출 함수 | `src/services/` |
| API Client | 인터셉터, 토큰 주입 | `src/services/api.ts` |
| Mock | 핸들러, 인메모리 DB | `src/mocks/` |
| Utils | 분기 로직, 유효성 검사 | `src/utils/` |

---

## 14. 가정 및 트레이드오프

| 항목 | 결정 | 이유 / 한계 |
|------|------|------------|
| 설문 ID 고정 | `VITE_SURVEY_ID` 환경변수로 주입, 기본값 `unitblack-join-survey` | 과제 범위. 확장 시 URL 파라미터로 변경 가능 |
| 문항 순서는 서버 책임 | 클라이언트는 nextQuestionId만 따라감 | 분기 규칙 변경 시 서버만 수정하면 됨 |
| localStorage 의존 | 세션 토큰 저장소 | 시크릿 모드·브라우저 초기화 시 소멸. 보안 서비스라면 httpOnly 쿠키로 전환 |
| 멀티 탭 미지원 | Zustand persist 충돌 가능 | `storage` 이벤트 리스너로 탭 간 동기화 추가하면 해결 |
| 런타임 스키마 검증 없음 | TypeScript 타입으로만 단언 | 실 서버 계약이 바뀌면 런타임 오류 발생 가능. Zod 도입으로 해결 |
| MSW mockDb 직렬화 | localStorage에 세션 DB 저장 | E2E 테스트 간 격리에 `removeItem` 초기화 필요 |
