import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyStore } from '@/store/surveyStore';
import { getSession } from '@/services/session.service';
import { setSessionToken } from '@/services/api';
import { Button } from '@/components/common/Button';
import type { SessionAnswer } from '@/types';

export function CompletionPage() {
  const navigate = useNavigate();
  const { sessionToken, surveyTitle, answers: storeAnswers, clearSession } = useSurveyStore();
  const [answers, setAnswers] = useState<SessionAnswer[]>(storeAnswers);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);

  useEffect(() => {
    if (!sessionToken) return;
    if (storeAnswers.length > 0) {
      setAnswers(storeAnswers);
      return;
    }
    setIsLoadingAnswers(true);
    setSessionToken(sessionToken);
    getSession()
      .then((res) => setAnswers(res.answers))
      .catch(() => {})
      .finally(() => setIsLoadingAnswers(false));
  }, [sessionToken, storeAnswers]);

  const handleNewSession = () => {
    clearSession();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-8 rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">설문이 완료되었습니다!</h1>
          <p className="mt-2 text-sm text-gray-500">
            {surveyTitle ?? '유닛블랙 지원 동기 설문'}에 응답해주셔서 감사합니다.
          </p>
          <Button onClick={handleNewSession} className="mt-6">
            새 세션 시작하기
          </Button>
        </div>

        {(answers.length > 0 || isLoadingAnswers) && (
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">제출한 답변 요약</h2>
            {isLoadingAnswers ? (
              <p className="text-sm text-gray-400">불러오는 중...</p>
            ) : (
              <div className="space-y-3">
                {answers.map((item, idx) => (
                  <div key={item.questionId} className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500">Q{idx + 1}. {item.questionText}</p>
                    <p className="mt-1 text-sm text-gray-800">
                      {item.answer.label || item.answer.text || item.answer.optionId || ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
