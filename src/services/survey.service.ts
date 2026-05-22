import { apiClient } from './api';
import type { SurveyResponseDto, QuestionResponseDto } from '@/types';

export async function fetchSurvey(surveyId: string): Promise<SurveyResponseDto> {
  const res = await apiClient.get<SurveyResponseDto>(`/surveys/${surveyId}`);
  return res.data;
}

export async function fetchQuestion(surveyId: string, questionId: string): Promise<QuestionResponseDto> {
  const res = await apiClient.get<QuestionResponseDto>(`/surveys/${surveyId}/questions/${questionId}`);
  return res.data;
}
