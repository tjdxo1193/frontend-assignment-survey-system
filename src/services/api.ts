import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

const ERROR_MESSAGES: Record<number, string> = {
  400: '답변 형식이 올바르지 않습니다.',
  401: '세션 토큰이 유효하지 않습니다.',
  403: '이미 완료된 설문입니다.',
  404: '설문 또는 문항을 찾을 수 없습니다.',
};

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message as string | undefined;
      const message =
        serverMsg ??
        (status ? ERROR_MESSAGES[status] : undefined) ??
        '네트워크 오류가 발생했습니다. 다시 시도해 주세요.';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(new Error('네트워크 오류가 발생했습니다. 다시 시도해 주세요.'));
  }
);

export function setSessionToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common['X-Session-Token'] = token;
  } else {
    delete apiClient.defaults.headers.common['X-Session-Token'];
  }
}
