import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProgressBar } from '@/components/survey/ProgressBar';
import { QuestionCard } from '@/components/survey/QuestionCard';
import { setSessionToken } from '@/services/api';
import { submitAnswer } from '@/services/session.service';
import { fetchQuestion } from '@/services/survey.service';
import { useSurveyStore } from '@/store/surveyStore';
import type { Question, SessionAnswer } from '@/types';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type AnswerPayload = { optionId?: string; optionIds?: string[]; text?: string } | null;

function buildLabel(question: Question, payload: NonNullable<AnswerPayload>): string {
  if (question.type === 'singleChoice' && payload.optionId) {
    return question.options?.find((o) => o.id === payload.optionId)?.label ?? payload.optionId;
  }
  if (question.type === 'multiChoice' && payload.optionIds) {
    return payload.optionIds
      .map((id) => question.options?.find((o) => o.id === id)?.label ?? id)
      .join(', ');
  }
  if (question.type === 'text' && payload.text !== undefined) {
    return payload.text;
  }
  return '';
}

export function SurveyPage() {
  const navigate = useNavigate();
  const {
    sessionToken,
    surveyId,
    surveyTitle,
    nextQuestionId,
    currentQuestion,
    isCompleted,
    answers,
    isLoading,
    error,
    setCurrentQuestion,
    applySubmit,
    setLoading,
    setError,
    clearSession,
  } = useSurveyStore();

  useEffect(() => {
    if (!sessionToken) {
      navigate('/', { replace: true });
      return;
    }
    setSessionToken(sessionToken);
  }, [sessionToken, navigate]);

  useEffect(() => {
    if (isCompleted) {
      navigate('/complete', { replace: true });
    }
  }, [isCompleted, navigate]);

  const loadQuestion = useCallback(
    async (qId: string) => {
      if (!surveyId) return;
      setLoading(true);
      setError(null);
      try {
        const q = await fetchQuestion(surveyId, qId);
        setCurrentQuestion(q as Question);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [surveyId, setCurrentQuestion, setLoading, setError]
  );

  useEffect(() => {
    if (!nextQuestionId || isCompleted || currentQuestion) return;
    void loadQuestion(nextQuestionId);
  }, [nextQuestionId, isCompleted, currentQuestion, loadQuestion]);

  const handleSubmit = async (payload: AnswerPayload) => {
    if (!currentQuestion) return;
    setError(null);
    try {
      const res = await submitAnswer({ questionId: currentQuestion.id, answer: payload });

      const newAnswer: SessionAnswer | null = payload
        ? {
            questionId: currentQuestion.id,
            questionText: currentQuestion.text,
            answer: {
              type: currentQuestion.type,
              optionId: payload.optionId,
              optionIds: payload.optionIds,
              text: payload.text,
              label: buildLabel(currentQuestion, payload),
              submittedAt: res.submittedAt,
            },
          }
        : null;

      applySubmit(res, newAnswer as SessionAnswer);

      if (res.completed) {
        navigate('/complete');
      }
    } catch (err) {
      const message = (err as Error).message;
      if (message.includes('완료된 설문')) {
        navigate('/complete');
        return;
      }
      if (message.includes('세션 토큰')) {
        clearSession();
        navigate('/');
        return;
      }
      setError(message);
    }
  };

  if (!sessionToken) return null;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">설문조사</p>
          <h1 className="mt-1 text-lg font-bold text-gray-900">
            {surveyTitle ?? '유닛블랙 지원 동기 설문'}
          </h1>
          <div className="mt-3">
            <ProgressBar answeredCount={answers.length} />
          </div>
        </header>

        {error && (
          <div className="mb-4">
            <ErrorMessage
              message={error}
              onRetry={nextQuestionId ? () => void loadQuestion(nextQuestionId) : undefined}
            />
          </div>
        )}

        {isLoading && <LoadingSpinner message="문항을 불러오는 중..." />}

        {!isLoading && currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionNumber={answers.length + 1}
            onSubmit={handleSubmit}
            isSubmitting={isLoading}
          />
        )}
      </div>
    </div>
  );
}
