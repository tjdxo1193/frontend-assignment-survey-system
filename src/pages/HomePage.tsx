import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { setSessionToken } from '@/services/api';
import { createSession, getSession } from '@/services/session.service';
import { fetchSurvey } from '@/services/survey.service';
import { useSurveyStore } from '@/store/surveyStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SURVEY_ID = 'unitblack-join-survey';

export function HomePage() {
  const navigate = useNavigate();
  const { sessionToken, isCompleted, initSession, resumeSession, clearSession } = useSurveyStore();

  const [isCreating, setIsCreating] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const hasPendingSession = sessionToken != null && !isCompleted;

  const handleNewSession = async () => {
    clearSession();
    setCreateError(null);
    setIsCreating(true);
    try {
      const [session, survey] = await Promise.all([
        createSession({ surveyId: SURVEY_ID }),
        fetchSurvey(SURVEY_ID),
      ]);
      initSession(session, survey.title);
      navigate('/survey');
    } catch (err) {
      setCreateError((err as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleResume = async () => {
    if (!sessionToken) return;
    setResumeError(null);
    setIsResuming(true);
    try {
      setSessionToken(sessionToken);
      const [session, survey] = await Promise.all([getSession(), fetchSurvey(SURVEY_ID)]);
      resumeSession(session, survey.title);
      navigate(session.isCompleted ? '/complete' : '/survey');
    } catch (err) {
      setResumeError((err as Error).message);
    } finally {
      setIsResuming(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">유닛블랙 지원 동기 설문</h1>
          <p className="mt-1 text-sm text-gray-500">UnitBlack 입사 지원 설문입니다.</p>
        </div>

        <div className="space-y-4">
          {hasPendingSession && (
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h2 className="mb-1 text-sm font-semibold text-gray-700">이어서 진행</h2>
              <p className="mb-4 text-xs text-gray-500">진행 중인 세션이 있습니다. 이어서 진행할 수 있습니다.</p>
              {resumeError && (
                <div className="mb-4">
                  <ErrorMessage message={resumeError} />
                </div>
              )}
              <Button onClick={() => void handleResume()} loading={isResuming} className="w-full">
                이어서 진행하기
              </Button>
            </div>
          )}

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-1 text-sm font-semibold text-gray-700">새 설문 시작</h2>
            <p className="mb-4 text-xs text-gray-500">새로운 세션을 생성하고 설문을 시작합니다.</p>
            {createError && (
              <div className="mb-4">
                <ErrorMessage message={createError} />
              </div>
            )}
            <Button
              variant={hasPendingSession ? 'secondary' : 'primary'}
              onClick={() => void handleNewSession()}
              loading={isCreating}
              className="w-full"
            >
              새 설문 시작하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
