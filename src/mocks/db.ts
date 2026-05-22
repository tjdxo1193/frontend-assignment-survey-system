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

const STORAGE_KEY = 'msw-mock-db';

function load(): Map<string, MockSession> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    return new Map(JSON.parse(raw) as [string, MockSession][]);
  } catch {
    return new Map();
  }
}

function save(sessions: Map<string, MockSession>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...sessions.entries()]));
}

const sessions = load();

export const mockDb = {
  sessions,
  findByToken(token: string): MockSession | undefined {
    return sessions.get(token);
  },
  createSession(session: MockSession): void {
    sessions.set(session.sessionToken, session);
    save(sessions);
  },
  updateSession(token: string, patch: Partial<MockSession>): void {
    const existing = sessions.get(token);
    if (existing) {
      sessions.set(token, { ...existing, ...patch });
      save(sessions);
    }
  },
};
