import { SAMPLE_SURVEY } from '@/data/surveys.data';
import { mockDb } from '@/mocks/db';
import type { SubmitAnswerRequestDto } from '@/types';
import { resolveNextQuestionId } from '@/utils/nextQuestion';
import { buildAnswerLabel } from '@/utils/label';
import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:3000';

function getToken(request: Request): string | null {
  return request.headers.get('X-Session-Token');
}

export const sessionHandlers = [
  http.post(`${BASE}/sessions`, async ({ request }) => {
    const body = (await request.json()) as { surveyId: string };
    const survey = body.surveyId === SAMPLE_SURVEY.id ? SAMPLE_SURVEY : null;
    if (!survey) {
      return HttpResponse.json({ message: '설문을 찾을 수 없습니다.' }, { status: 404 });
    }
    const sessionId = crypto.randomUUID();
    const sessionToken = crypto.randomUUID();
    mockDb.createSession({
      sessionId,
      sessionToken,
      surveyId: survey.id,
      isCompleted: false,
      nextQuestionId: survey.startQuestionId,
      answers: [],
    });
    return HttpResponse.json(
      {
        sessionId,
        sessionToken,
        surveyId: survey.id,
        isCompleted: false,
        nextQuestionId: survey.startQuestionId,
      },
      { status: 201 }
    );
  }),

  http.get(`${BASE}/sessions`, ({ request }) => {
    const token = getToken(request);
    if (!token) return HttpResponse.json({ message: '인증 토큰이 필요합니다.' }, { status: 401 });
    const session = mockDb.findByToken(token);
    if (!session)
      return HttpResponse.json({ message: '유효하지 않은 세션 토큰입니다.' }, { status: 401 });
    return HttpResponse.json({
      sessionId: session.sessionId,
      surveyId: session.surveyId,
      isCompleted: session.isCompleted,
      nextQuestionId: session.nextQuestionId,
      answers: session.answers
        .filter((a) => a.answer !== null)
        .map((a) => ({ questionId: a.questionId, questionText: a.questionText, answer: a.answer })),
    });
  }),

  http.post(`${BASE}/sessions/answers`, async ({ request }) => {
    const token = getToken(request);
    if (!token) return HttpResponse.json({ message: '인증 토큰이 필요합니다.' }, { status: 401 });
    const session = mockDb.findByToken(token);
    if (!session)
      return HttpResponse.json({ message: '유효하지 않은 세션 토큰입니다.' }, { status: 401 });
    if (session.isCompleted) {
      return HttpResponse.json({ message: '이미 완료된 설문입니다.' }, { status: 403 });
    }

    const body = (await request.json()) as SubmitAnswerRequestDto;
    const { questionId, answer } = body;

    if (questionId !== session.nextQuestionId) {
      return HttpResponse.json({ message: '현재 진행 중인 문항이 아닙니다.' }, { status: 400 });
    }

    const question = SAMPLE_SURVEY.questions.find((q) => q.id === questionId);
    if (!question)
      return HttpResponse.json({ message: '문항을 찾을 수 없습니다.' }, { status: 404 });

    if (answer !== null) {
      if (question.type === 'singleChoice' && answer.optionId === undefined) {
        return HttpResponse.json(
          { message: 'singleChoice 답변에는 optionId가 필요합니다.' },
          { status: 400 }
        );
      }
      if (question.type === 'multiChoice' && answer.optionIds === undefined) {
        return HttpResponse.json(
          { message: 'multiChoice 답변에는 optionIds가 필요합니다.' },
          { status: 400 }
        );
      }
      if (question.type === 'text' && answer.text === undefined) {
        return HttpResponse.json({ message: 'text 답변에는 text가 필요합니다.' }, { status: 400 });
      }
    } else if (question.required) {
      return HttpResponse.json({ message: '필수 항목입니다.' }, { status: 400 });
    }

    const submittedAt = new Date().toISOString();
    const nextQuestionId =
      answer !== null
        ? resolveNextQuestionId(
            question,
            answer,
            session.answers.filter((a) => a.answer !== null) as Parameters<
              typeof resolveNextQuestionId
            >[2]
          )
        : (question.nextQuestionId ?? null);

    const completed = nextQuestionId === null;

    const storedAnswer =
      answer !== null
        ? {
            questionId,
            questionText: question.text,
            answer: {
              type: question.type,
              optionId: answer.optionId,
              optionIds: answer.optionIds,
              text: answer.text,
              label: buildAnswerLabel(question.type, question.options, answer),
              submittedAt,
            },
          }
        : { questionId, questionText: question.text, answer: null };

    mockDb.updateSession(token, {
      nextQuestionId,
      isCompleted: completed,
      answers: [...session.answers, storedAnswer],
    });

    return HttpResponse.json({ nextQuestionId, completed, submittedAt });
  }),
];
