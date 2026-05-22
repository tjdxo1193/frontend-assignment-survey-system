import { setSessionToken } from '@/services/api';
import type {
  CreateSessionResponseDto,
  GetSessionResponseDto,
  Question,
  SessionAnswer,
  SubmitAnswerResponseDto,
} from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SurveyState {
  sessionToken: string | null;
  sessionId: string | null;
  surveyId: string | null;
  surveyTitle: string | null;
  isCompleted: boolean;
  nextQuestionId: string | null;
  currentQuestion: Question | null;
  answers: SessionAnswer[];
  isLoading: boolean;
  error: string | null;

  initSession: (res: CreateSessionResponseDto, surveyTitle: string) => void;
  resumeSession: (res: GetSessionResponseDto, surveyTitle: string) => void;
  setCurrentQuestion: (q: Question) => void;
  applySubmit: (res: SubmitAnswerResponseDto, answer: SessionAnswer) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  clearSession: () => void;
}

const INITIAL_STATE = {
  sessionToken: null,
  sessionId: null,
  surveyId: null,
  surveyTitle: null,
  isCompleted: false,
  nextQuestionId: null,
  currentQuestion: null,
  answers: [],
  isLoading: false,
  error: null,
};

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      initSession: (res, surveyTitle) => {
        setSessionToken(res.sessionToken);
        set({
          sessionToken: res.sessionToken,
          sessionId: res.sessionId,
          surveyId: res.surveyId,
          surveyTitle,
          isCompleted: res.isCompleted,
          nextQuestionId: res.nextQuestionId,
          currentQuestion: null,
          answers: [],
          error: null,
        });
      },

      resumeSession: (res, surveyTitle) => {
        set({
          sessionId: res.sessionId,
          surveyId: res.surveyId,
          surveyTitle,
          isCompleted: res.isCompleted,
          nextQuestionId: res.nextQuestionId,
          answers: res.answers,
          currentQuestion: null,
          error: null,
        });
      },

      setCurrentQuestion: (q) => set({ currentQuestion: q }),

      applySubmit: (res, answer) =>
        set((state) => ({
          nextQuestionId: res.nextQuestionId,
          isCompleted: res.completed,
          answers: answer ? [...state.answers, answer] : state.answers,
          currentQuestion: null,
        })),

      setLoading: (v) => set({ isLoading: v }),

      setError: (msg) => set({ error: msg }),

      clearSession: () => {
        setSessionToken(null);
        set(INITIAL_STATE);
      },
    }),
    {
      name: 'survey-session',
      partialize: (state) => ({
        sessionToken: state.sessionToken,
        sessionId: state.sessionId,
        surveyId: state.surveyId,
        surveyTitle: state.surveyTitle,
        isCompleted: state.isCompleted,
        nextQuestionId: state.nextQuestionId,
      }),
    }
  )
);
