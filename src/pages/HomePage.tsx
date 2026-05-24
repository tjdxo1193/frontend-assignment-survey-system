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
  const { sessionToken, initSession, resumeSession, clearSession } = useSurveyStore();

  const [tokenInput, setTokenInput] = useState(sessionToken ?? '');
  const [createState, setCreateState] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });
  const [resumeState, setResumeState] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });

  const handleNewSession = async () => {
    setCreateState({ loading: true, error: null });
    try {
      const [session, survey] = await Promise.all([
        createSession({ surveyId: SURVEY_ID }),
        fetchSurvey(SURVEY_ID),
      ]);
      setSessionToken(session.sessionToken);
      initSession(session, survey.title);
      navigate('/survey');
    } catch (err) {
      setCreateState({ loading: false, error: (err as Error).message });
    } finally {
      setCreateState((s) => ({ ...s, loading: false }));
    }
  };

  const handleResume = async () => {
    const token = tokenInput.trim();
    if (!token) {
      setResumeState({ loading: false, error: '세션 토큰을 입력해주세요.' });
      return;
    }
    setResumeState({ loading: true, error: null });
    try {
      setSessionToken(token);
      const [session, survey] = await Promise.all([getSession(), fetchSurvey(SURVEY_ID)]);
      useSurveyStore.setState({ sessionToken: token });
      resumeSession(session, survey.title);
      navigate(session.isCompleted ? '/complete' : '/survey');
    } catch (err) {
      setSessionToken(sessionToken);
      setResumeState({ loading: false, error: (err as Error).message });
    } finally {
      setResumeState((s) => ({ ...s, loading: false }));
    }
  };

  const handleClearSession = () => {
    clearSession();
    setTokenInput('');
    setResumeState({ loading: false, error: null });
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
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-1 text-sm font-semibold text-gray-700">새 설문 시작</h2>
            <p className="mb-4 text-xs text-gray-500">새로운 세션을 생성하고 설문을 시작합니다.</p>
            {createState.error && (
              <div className="mb-4">
                <ErrorMessage message={createState.error} />
              </div>
            )}
            <Button onClick={() => void handleNewSession()} loading={createState.loading} className="w-full">
              새 설문 시작하기
            </Button>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-1 text-sm font-semibold text-gray-700">이어서 진행</h2>
            <p className="mb-4 text-xs text-gray-500">
              이전에 발급받은 세션 토큰으로 이어서 진행합니다.
            </p>
            {sessionToken && tokenInput === sessionToken && (
              <div className="mb-3 flex items-center justify-between rounded-md bg-blue-50 px-3 py-2">
                <span className="text-xs text-blue-700">진행 중인 세션이 있습니다.</span>
                <button
                  onClick={handleClearSession}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  초기화
                </button>
              </div>
            )}
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value);
                setResumeState((s) => ({ ...s, error: null }));
              }}
              placeholder="세션 토큰을 입력하세요"
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {resumeState.error && (
              <div className="mb-3">
                <ErrorMessage message={resumeState.error} />
              </div>
            )}
            <Button
              variant="secondary"
              onClick={() => void handleResume()}
              loading={resumeState.loading}
              className="w-full"
            >
              이어서 진행하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
