/**
 * Session-related type definitions based on API spec
 */

export interface CreateSessionRequestDto {
  surveyId: string;
}

export interface CreateSessionResponseDto {
  sessionId: string;
  sessionToken: string;
  surveyId: string;
  isCompleted: boolean;
  nextQuestionId: string;
}

export interface SessionAnswer {
  questionId: string;
  questionText: string;
  answer: {
    type: string;
    optionId?: string;
    optionIds?: string[];
    text?: string;
    label?: string;
    submittedAt: string;
  };
}

export interface GetSessionResponseDto {
  sessionId: string;
  surveyId: string;
  isCompleted: boolean;
  nextQuestionId: string | null;
  answers: SessionAnswer[];
}

export type AnswerPayload = {
  optionId?: string;
  optionIds?: string[];
  text?: string;
} | null;

export interface SubmitAnswerRequestDto {
  questionId: string;
  answer: AnswerPayload;
}

export interface SubmitAnswerResponseDto {
  nextQuestionId: string | null;
  completed: boolean;
  submittedAt: string;
}
