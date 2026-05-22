import { setSessionToken } from '@/services/api';
import { createSession, getSession, submitAnswer } from '@/services/session.service';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

const BASE = 'http://localhost:3000';

const server = setupServer(
  http.post(`${BASE}/sessions`, () =>
    HttpResponse.json(
      {
        sessionId: 'sid-test',
        sessionToken: 'tok-test',
        surveyId: 'unitblack-join-survey',
        isCompleted: false,
        nextQuestionId: 'q1',
      },
      { status: 201 }
    )
  ),

  http.get(`${BASE}/sessions`, ({ request }) => {
    const token = request.headers.get('X-Session-Token');
    if (token !== 'valid-token') {
      return HttpResponse.json({ message: '유효하지 않은 세션 토큰입니다.' }, { status: 401 });
    }
    return HttpResponse.json({
      sessionId: 'sid-test',
      surveyId: 'unitblack-join-survey',
      isCompleted: false,
      nextQuestionId: 'q2_tech',
      answers: [],
    });
  }),

  http.post(`${BASE}/sessions/answers`, ({ request }) => {
    const token = request.headers.get('X-Session-Token');
    if (!token) {
      return HttpResponse.json({ message: '인증 토큰이 필요합니다.' }, { status: 401 });
    }
    return HttpResponse.json({
      nextQuestionId: 'q2_tech',
      completed: false,
      submittedAt: '2025-01-01T00:00:00Z',
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('session.service', () => {
  it('createSession: 세션 생성 응답을 반환한다', async () => {
    const res = await createSession({ surveyId: 'unitblack-join-survey' });
    expect(res.sessionToken).toBe('tok-test');
    expect(res.sessionId).toBe('sid-test');
    expect(res.nextQuestionId).toBe('q1');
    expect(res.isCompleted).toBe(false);
  });

  it('getSession: 유효한 토큰으로 세션을 조회한다', async () => {
    setSessionToken('valid-token');
    const res = await getSession();
    expect(res.sessionId).toBe('sid-test');
    expect(res.nextQuestionId).toBe('q2_tech');
    expect(res.isCompleted).toBe(false);
  });

  it('getSession: 유효하지 않은 토큰은 에러를 던진다', async () => {
    setSessionToken('bad-token');
    await expect(getSession()).rejects.toThrow('유효하지 않은 세션 토큰입니다.');
  });

  it('submitAnswer: 답변 제출 응답을 반환한다', async () => {
    setSessionToken('valid-token');
    const res = await submitAnswer({ questionId: 'q1', answer: { optionId: 'q1o2' } });
    expect(res.nextQuestionId).toBe('q2_tech');
    expect(res.completed).toBe(false);
    expect(res.submittedAt).toBeDefined();
  });

  it('submitAnswer: 토큰 없을 시 에러를 던진다', async () => {
    setSessionToken(null);
    await expect(
      submitAnswer({ questionId: 'q1', answer: { optionId: 'q1o2' } })
    ).rejects.toThrow();
  });
});
