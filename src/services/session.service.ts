import { apiClient } from './api';
import type {
  CreateSessionRequestDto,
  CreateSessionResponseDto,
  GetSessionResponseDto,
  SubmitAnswerRequestDto,
  SubmitAnswerResponseDto,
} from '@/types';

export async function createSession(dto: CreateSessionRequestDto): Promise<CreateSessionResponseDto> {
  const res = await apiClient.post<CreateSessionResponseDto>('/sessions', dto);
  return res.data;
}

export async function getSession(): Promise<GetSessionResponseDto> {
  const res = await apiClient.get<GetSessionResponseDto>('/sessions');
  return res.data;
}

export async function submitAnswer(dto: SubmitAnswerRequestDto): Promise<SubmitAnswerResponseDto> {
  const res = await apiClient.post<SubmitAnswerResponseDto>('/sessions/answers', dto);
  return res.data;
}
