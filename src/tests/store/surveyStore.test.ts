import { useSurveyStore } from '@/store/surveyStore';
import type {
  CreateSessionResponseDto,
  GetSessionResponseDto,
  SubmitAnswerResponseDto,
} from '@/types';
import { beforeEach, describe, expect, it } from 'vitest';

const mockCreateRes: CreateSessionResponseDto = {
  sessionId: 'sid-1',
  sessionToken: 'tok-abc',
  surveyId: 'unitblack-join-survey',
  isCompleted: false,
  nextQuestionId: 'q1',
};

const mockGetRes: GetSessionResponseDto = {
  sessionId: 'sid-1',
  surveyId: 'unitblack-join-survey',
  isCompleted: false,
  nextQuestionId: 'q2_tech',
  answers: [
    {
      questionId: 'q1',
      questionText: '우리 회사에 지원하는 주된 이유는?',
      answer: {
        type: 'singleChoice',
        optionId: 'q1o2',
        label: '기술적 도전',
        submittedAt: '2025-01-01T00:00:00Z',
      },
    },
  ],
};

describe('surveyStore', () => {
  beforeEach(() => {
    useSurveyStore.getState().clearSession();
  });

  it('initSession sets session fields and clears previous state', () => {
    useSurveyStore.getState().initSession(mockCreateRes, '유닛블랙 설문');
    const s = useSurveyStore.getState();
    expect(s.sessionToken).toBe('tok-abc');
    expect(s.sessionId).toBe('sid-1');
    expect(s.surveyTitle).toBe('유닛블랙 설문');
    expect(s.nextQuestionId).toBe('q1');
    expect(s.isCompleted).toBe(false);
    expect(s.answers).toHaveLength(0);
  });

  it('resumeSession restores answers and nextQuestionId', () => {
    useSurveyStore.setState({ sessionToken: 'tok-abc' });
    useSurveyStore.getState().resumeSession(mockGetRes, '유닛블랙 설문');
    const s = useSurveyStore.getState();
    expect(s.nextQuestionId).toBe('q2_tech');
    expect(s.answers).toHaveLength(1);
    expect(s.answers[0].questionId).toBe('q1');
  });

  it('applySubmit updates nextQuestionId and appends answer', () => {
    useSurveyStore.getState().initSession(mockCreateRes, '유닛블랙 설문');
    const submitRes: SubmitAnswerResponseDto = {
      nextQuestionId: 'q2_tech',
      completed: false,
      submittedAt: '2025-01-01T00:00:00Z',
    };
    const answer = {
      questionId: 'q1',
      questionText: '질문',
      answer: { type: 'singleChoice', optionId: 'q1o2', label: '기술적 도전', submittedAt: '' },
    };
    useSurveyStore.getState().applySubmit(submitRes, answer);
    const s = useSurveyStore.getState();
    expect(s.nextQuestionId).toBe('q2_tech');
    expect(s.answers).toHaveLength(1);
    expect(s.isCompleted).toBe(false);
  });

  it('applySubmit marks isCompleted when completed is true', () => {
    useSurveyStore.getState().initSession(mockCreateRes, '유닛블랙 설문');
    const submitRes: SubmitAnswerResponseDto = {
      nextQuestionId: null,
      completed: true,
      submittedAt: '2025-01-01T00:00:00Z',
    };
    const answer = {
      questionId: 'q8_final',
      questionText: '마지막',
      answer: { type: 'text', text: '감사합니다', label: '감사합니다', submittedAt: '' },
    };
    useSurveyStore.getState().applySubmit(submitRes, answer);
    expect(useSurveyStore.getState().isCompleted).toBe(true);
    expect(useSurveyStore.getState().nextQuestionId).toBeNull();
  });

  it('clearSession resets all state', () => {
    useSurveyStore.getState().initSession(mockCreateRes, '설문');
    useSurveyStore.getState().clearSession();
    const s = useSurveyStore.getState();
    expect(s.sessionToken).toBeNull();
    expect(s.sessionId).toBeNull();
    expect(s.isCompleted).toBe(false);
    expect(s.answers).toHaveLength(0);
  });
});
