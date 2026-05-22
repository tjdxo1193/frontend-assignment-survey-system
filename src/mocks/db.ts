import type { SessionAnswer } from '@/types';

export interface MockSession {
  sessionId: string;
  sessionToken: string;
  surveyId: string;
  isCompleted: boolean;
  nextQuestionId: string | null;
  answers: StoredAnswer[];
}

export interface StoredAnswer {
  questionId: string;
  questionText: string;
  answer: SessionAnswer['answer'] | null;
}

const sessions = new Map<string, MockSession>();

export const mockDb = {
  sessions,
  findByToken(token: string): MockSession | undefined {
    return sessions.get(token);
  },
  createSession(session: MockSession): void {
    sessions.set(session.sessionToken, session);
  },
  updateSession(token: string, patch: Partial<MockSession>): void {
    const existing = sessions.get(token);
    if (existing) sessions.set(token, { ...existing, ...patch });
  },
};
