import { apiClient } from '@/services/api';
import axios from 'axios';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

const BASE = 'http://localhost:3000';
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

describe('apiClient interceptor', () => {
  it('status 코드에 대응하는 오류 메시지로 reject한다 (404)', async () => {
    server.use(http.get(`${BASE}/test-404`, () => HttpResponse.json({}, { status: 404 })));
    await expect(apiClient.get('/test-404')).rejects.toThrow('설문 또는 문항을 찾을 수 없습니다.');
  });

  it('서버가 message를 반환하면 해당 메시지로 reject한다', async () => {
    server.use(
      http.get(`${BASE}/test-msg`, () =>
        HttpResponse.json({ message: '서버 커스텀 오류' }, { status: 400 })
      )
    );
    await expect(apiClient.get('/test-msg')).rejects.toThrow('서버 커스텀 오류');
  });

  it('non-AxiosError는 기본 네트워크 오류 메시지로 reject한다', async () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(false);
    server.use(http.get(`${BASE}/test-non-axios`, () => HttpResponse.json({}, { status: 500 })));
    await expect(apiClient.get('/test-non-axios')).rejects.toThrow(
      '네트워크 오류가 발생했습니다. 다시 시도해 주세요.'
    );
  });
});
