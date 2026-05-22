/**
 * Example API Service Implementation
 *
 * This is a reference implementation showing how to structure API calls.
 * You can use this as a starting point or implement your own approach.
 *
 * Feel free to:
 * - Use fetch, axios, or any other HTTP client
 * - Implement your own error handling strategy
 * - Add interceptors, retries, etc.
 * - Structure this differently based on your preferences
 */

import type {
  SurveyResponseDto,
  QuestionResponseDto,
  CreateSessionRequestDto,
  CreateSessionResponseDto,
  GetSessionResponseDto,
  SubmitAnswerRequestDto,
  SubmitAnswerResponseDto,
} from '@/types';

const API_BASE_URL = 'http://localhost:3000';
const SESSION_TOKEN_HEADER = 'X-Session-Token';

/**
 * Example: Get survey by ID
 * GET /surveys/:surveyId
 */
export async function getSurvey(surveyId: string): Promise<SurveyResponseDto> {
  const response = await fetch(`${API_BASE_URL}/surveys/${surveyId}`);
  if (!response.ok) throw new Error('Failed to fetch survey');
  return response.json();
}

/**
 * Example: Get specific question
 * GET /surveys/:surveyId/questions/:questionId
 */
export async function getQuestion(
  surveyId: string,
  questionId: string
): Promise<QuestionResponseDto> {
  const response = await fetch(
    `${API_BASE_URL}/surveys/${surveyId}/questions/${questionId}`
  );
  if (!response.ok) throw new Error('Failed to fetch question');
  return response.json();
}

/**
 * Example: Create new session
 * POST /sessions
 */
export async function createSession(
  request: CreateSessionRequestDto
): Promise<CreateSessionResponseDto> {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to create session');
  return response.json();
}

/**
 * Example: Get session by token
 * GET /sessions
 * Header: X-Session-Token
 */
export async function getSession(
  sessionToken: string
): Promise<GetSessionResponseDto> {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    headers: { [SESSION_TOKEN_HEADER]: sessionToken },
  });
  if (!response.ok) throw new Error('Failed to fetch session');
  return response.json();
}

/**
 * Example: Submit answer
 * POST /sessions/answers
 * Header: X-Session-Token
 */
export async function submitAnswer(
  sessionToken: string,
  request: SubmitAnswerRequestDto
): Promise<SubmitAnswerResponseDto> {
  const response = await fetch(`${API_BASE_URL}/sessions/answers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [SESSION_TOKEN_HEADER]: sessionToken,
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to submit answer');
  return response.json();
}
