import { SAMPLE_SURVEY } from '@/data/surveys.data';
import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:3000';

export const surveyHandlers = [
  http.get(`${BASE}/surveys/:surveyId`, ({ params }) => {
    if (params.surveyId !== SAMPLE_SURVEY.id) {
      return HttpResponse.json({ message: '설문을 찾을 수 없습니다.' }, { status: 404 });
    }
    return HttpResponse.json(SAMPLE_SURVEY);
  }),

  http.get(`${BASE}/surveys/:surveyId/questions/:questionId`, ({ params }) => {
    if (params.surveyId !== SAMPLE_SURVEY.id) {
      return HttpResponse.json({ message: '설문을 찾을 수 없습니다.' }, { status: 404 });
    }
    const question = SAMPLE_SURVEY.questions.find((q) => q.id === params.questionId);
    if (!question) {
      return HttpResponse.json({ message: '문항을 찾을 수 없습니다.' }, { status: 404 });
    }
    return HttpResponse.json(question);
  }),
];
