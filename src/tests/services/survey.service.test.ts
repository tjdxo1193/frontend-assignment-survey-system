import { fetchQuestion, fetchSurvey } from '@/services/survey.service';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

const BASE = 'http://localhost:3000';
const SURVEY_ID = 'unitblack-join-survey';

const mockSurvey = {
  id: SURVEY_ID,
  title: '유닛블랙 지원 동기 설문',
  version: 1,
  startQuestionId: 'q1',
  questions: [],
};

const mockQuestion = {
  id: 'q1',
  type: 'singleChoice',
  text: '우리 회사에 지원하는 주된 이유는 무엇인가요?',
  required: true,
  options: [{ id: 'q1o1', label: '임팩트 있는 문제를 해결하고 싶어서', nextQuestionId: 'q2_impact' }],
};

const server = setupServer(
  http.get(`${BASE}/surveys/${SURVEY_ID}`, () => HttpResponse.json(mockSurvey)),
  http.get(`${BASE}/surveys/${SURVEY_ID}/questions/q1`, () => HttpResponse.json(mockQuestion)),
  http.get(`${BASE}/surveys/not-found`, () =>
    HttpResponse.json({ message: '설문을 찾을 수 없습니다.' }, { status: 404 })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('survey.service', () => {
  it('fetchSurvey: 설문 데이터를 반환한다', async () => {
    const survey = await fetchSurvey(SURVEY_ID);
    expect(survey.id).toBe(SURVEY_ID);
    expect(survey.title).toBe('유닛블랙 지원 동기 설문');
    expect(survey.startQuestionId).toBe('q1');
  });

  it('fetchSurvey: 존재하지 않는 설문은 에러를 던진다', async () => {
    await expect(fetchSurvey('not-found')).rejects.toThrow(
      '설문을 찾을 수 없습니다.'
    );
  });

  it('fetchQuestion: 단일 문항을 반환한다', async () => {
    const question = await fetchQuestion(SURVEY_ID, 'q1');
    expect(question.id).toBe('q1');
    expect(question.type).toBe('singleChoice');
    expect(question.text).toBe('우리 회사에 지원하는 주된 이유는 무엇인가요?');
  });
});
