# 면접 예상 질문 & 답변 정리

이 프로젝트로 면접을 볼 때 나올 법한 질문들과 답변 포인트를 정리한다.

---

## 상태관리

### Q. 왜 Zustand를 선택했나요? Redux나 Context API는요?

**핵심 답변:**  
Redux는 이 규모에서 액션·리듀서·셀렉터 보일러플레이트 대비 이득이 없었습니다. Context API는 Provider 하위 전체가 리렌더링되는 문제가 있어서 선택하지 않았습니다. Zustand를 고른 결정적인 이유는 `persist` 미들웨어 하나로 "이탈 후 세션 재개" 요구사항을 충족할 수 있었기 때문입니다. localStorage 직렬화·복원 코드를 직접 짜지 않아도 됩니다.

**추가로 말할 수 있는 것:**
- Zustand는 구독하는 값이 바뀔 때만 리렌더링됨 (selector 기반)
- 이전 직장에서 Recoil + React Query 조합을 썼는데, 이번 과제는 서버 상태가 단순해서 React Query 없이 서비스 레이어 + Zustand만으로 충분했음

---

### Q. Zustand persist의 한계나 트레이드오프가 있나요?

**핵심 답변:**  
두 가지 한계가 있습니다.

1. **멀티 탭 충돌**: 같은 브라우저에서 탭 두 개를 동시에 열면 localStorage 상태가 충돌할 수 있습니다. `storage` 이벤트를 리스닝해서 탭 간 동기화를 추가하면 해결됩니다.
2. **시크릿 모드**: localStorage가 세션 종료와 함께 소멸되므로 재개가 불가능합니다. 이 경우 수동 토큰 입력 UI로 대응할 수 있습니다.

---

## MSW

### Q. MSW가 어떻게 동작하는지 설명해주실 수 있나요?

**핵심 답변:**  
브라우저의 Service Worker API를 이용합니다. Service Worker는 브라우저와 네트워크 사이에 위치해서 fetch 요청을 중간에 가로챌 수 있습니다. MSW는 이 Service Worker를 등록하고, 핸들러에 정의한 URL 패턴과 일치하는 요청이 오면 실제 서버 대신 핸들러가 응답을 돌려줍니다. 실제 `axios` 코드, 인터셉터, 헤더 주입 로직이 그대로 동작하기 때문에 모킹 코드와 프로덕션 코드가 완전히 분리됩니다.

**추가 포인트:**  
Vitest에서는 `setupServer`(Node 모드)를 사용합니다. 브라우저 Service Worker 대신 Node.js의 HTTP 요청을 가로챕니다. 같은 핸들러를 브라우저(개발·E2E)와 Node(단위 테스트) 양쪽에서 재사용합니다.

---

### Q. json-server 대신 MSW를 쓴 이유가 뭔가요?

**핵심 답변:**  
json-server는 별도 프로세스로 실행해야 하고, 동적 세션 상태(답변 누적, 조건 분기, 에러 코드 재현)를 구현하기 어렵습니다. MSW는 핸들러 안에 JavaScript 로직을 자유롭게 작성할 수 있어서, 인메모리 세션 DB로 서버처럼 동작하는 복잡한 로직을 구현할 수 있었습니다.

---

## 에러 처리

### Q. Axios 인터셉터에서 에러를 처리한 이유가 뭔가요?

**핵심 답변:**  
에러 처리 코드가 각 서비스 함수에 흩어지면 메시지 일관성이 깨지고 수정할 곳이 여러 군데가 됩니다. 인터셉터 한 곳에서 처리하면 서비스 함수는 에러를 그냥 전파하고, 컴포넌트는 `catch`만 하면 됩니다.

---

### Q. ApiError 클래스를 별도로 만든 이유는요?

**핵심 답변:**  
초기에는 `Error` 객체를 사용하고 컴포넌트에서 `message.includes('완료된 설문')`처럼 문자열 매칭으로 UX 분기를 했습니다. 이 방식은 서버 메시지가 조금만 바뀌어도 즉시 깨집니다. `ApiError`에 `status` 필드를 추가해 컴포넌트가 HTTP 코드로 분기하도록 변경했습니다. 서버 메시지 변경에 무관하게 동작합니다.

```ts
// 취약한 방식 (문자열 매칭)
if (message.includes('완료된 설문')) navigate('/complete');

// 개선된 방식 (status 코드 분기)
if (status === 403) navigate('/complete');
```

---

## 성능 / React

### Q. useCallback을 왜 handleSubmit에만 썼나요?

**핵심 답변:**  
`handleSubmit`은 `QuestionCard`에 `onSubmit` prop으로 전달됩니다. 함수가 매 렌더마다 새로 만들어지면 QuestionCard가 `React.memo`로 감싸여 있어도 항상 리렌더링됩니다. `useCallback`으로 감싸면 의존성 배열의 값이 바뀔 때만 새 함수가 만들어집니다. `loadQuestion`도 같은 이유로 `useCallback`을 적용했습니다.

---

### Q. 렌더링 최적화는 어떻게 했나요?

**핵심 답변:**  
- Zustand selector로 필요한 상태만 구독해 불필요한 리렌더 방지
- `handleSubmit`, `loadQuestion`에 `useCallback` 적용
- 현재 문항은 하나씩만 메모리에 유지 (`currentQuestion`), 전체 문항 목록을 미리 로드하지 않음

---

## 타입 / TypeScript

### Q. AnswerPayload 타입을 왜 별도 파일에 중앙화했나요?

**핵심 답변:**  
`QuestionCard`, `SurveyPage`, `session.types.ts` 세 곳에 동일한 타입이 중복 선언되어 있었습니다. 하나가 바뀌면 나머지를 수동으로 맞춰야 하는 문제가 있었습니다. `session.types.ts`를 단일 출처로 정하고, 나머지는 import만 하도록 변경했습니다.

---

### Q. 런타임 스키마 검증(Zod 등)을 쓰지 않은 이유가 뭔가요?

**핵심 답변:**  
이번 과제에서는 MSW 핸들러가 타입을 보장하는 역할을 합니다. 실 서버가 있다면 Zod로 응답을 파싱해 런타임에서 계약 이탈을 즉시 감지하는 것이 맞습니다. 트레이드오프로 알고 있으며, 도입할 경우 서비스 레이어에서 `z.parse()`를 호출하는 위치가 적절합니다.

---

## 테스트

### Q. 테스트 전략을 설명해주세요.

**핵심 답변:**  
세 계층으로 나눴습니다.

| 계층 | 도구 | 대상 |
|------|------|------|
| 단위 | Vitest | 분기 로직(`nextQuestion`), 유효성 검사(`validation`), store 액션 |
| 통합 | Vitest + RTL + MSW Node | 컴포넌트가 API 호출 후 상태를 올바르게 반영하는지 |
| E2E | Playwright | 전체 설문 완주, 세션 재개, 에러 UX |

분기 로직은 순수 함수라 단위 테스트가 가장 효율적입니다. 컴포넌트 통합 테스트는 MSW Node 서버를 띄워 실제 HTTP 흐름을 검증합니다. E2E는 브라우저 MSW(Service Worker)로 전체 플로우를 검증합니다.

---

### Q. Playwright를 쓴 이유가 뭔가요? Cypress가 더 유명하지 않나요?

**핵심 답변:**  
MSW가 브라우저 Service Worker로 동작하기 때문입니다. Cypress는 자체 네트워크 인터셉트(`cy.intercept`)를 사용하는데, Service Worker와 함께 쓰면 충돌이 발생하거나 별도 처리가 필요합니다. Playwright는 실제 Chromium을 그대로 띄우므로 Service Worker가 정상 작동하고 MSW 인터셉트를 방해하지 않습니다.

---

## 설계 전반

### Q. 조건 분기(nextQuestion) 로직은 어떻게 설계했나요?

**핵심 답변:**  
세 가지 패턴을 처리합니다.

1. **singleChoice**: 선택한 option의 `nextQuestionId`
2. **multiChoice / text**: 문항의 `nextQuestionId` (직접 지정)
3. **next[] 조건 배열**: 이전 답변을 순회해 `anySelectedIn` 조건을 평가하고, 첫 번째로 매칭되는 분기로 이동. 아무것도 매칭되지 않으면 `default: true`인 항목으로 폴백

MSW 핸들러와 클라이언트 유틸에서 같은 함수를 공유해 로직 불일치를 방지했습니다.

---

### Q. 세션 재개 플로우를 설명해주세요.

**핵심 답변:**

```
앱 진입
  └─ Zustand persist에서 sessionToken 복원
       있음 → GET /sessions → 현재 nextQuestionId 확인 → /survey로 이동
       없음 → 홈에서 수동 토큰 입력 또는 새 세션 생성
```

`sessionToken`은 localStorage에만 저장하고, 세션 상태(답변 이력, nextQuestionId 등)는 앱 진입 시 항상 서버에서 새로 받아옵니다. localStorage에 세션 상태를 직접 저장하지 않으므로 클라이언트 캐시와 서버 상태가 불일치하는 문제가 없습니다.

---

### Q. localStorage에 세션 토큰을 저장하면 보안 위험은 없나요?

**핵심 답변:**  
XSS 공격으로 localStorage가 탈취될 수 있는 위험이 있습니다. 더 안전한 방법은 httpOnly 쿠키로 토큰을 관리하는 것입니다. 이 경우 JavaScript에서 접근할 수 없어 XSS로 탈취가 불가능합니다. 이번 과제는 채용 설문이라는 제한된 맥락이어서 localStorage를 선택했지만, 실 서비스라면 httpOnly 쿠키로 전환해야 한다고 생각합니다.

---

### Q. 실 백엔드와 연결할 때 변경해야 할 부분이 있나요?

**핵심 답변:**  
환경변수 두 개만 바꾸면 됩니다.

```bash
VITE_MOCK_API=false          # MSW 비활성화
VITE_API_BASE_URL=https://실서버주소
```

`constants/env.ts`에서 전체 앱이 이 두 값을 참조하므로 코드 수정 없이 전환됩니다. 단, 실 서버의 응답 스키마가 MSW 핸들러와 동일하다고 가정합니다. 다르다면 `types/` 파일을 맞게 수정하고 Zod 검증을 추가하는 것이 좋습니다.
