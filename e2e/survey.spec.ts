import { test, expect } from '@playwright/test';

test.describe('설문 시작 및 진행', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { localStorage.removeItem('survey-session'); localStorage.removeItem('msw-mock-db'); });
    await page.reload();
  });

  test('홈 페이지가 올바르게 렌더링된다', async ({ page }) => {
    await expect(page.getByText('유닛블랙 지원 동기 설문')).toBeVisible();
    await expect(page.getByRole('button', { name: '새 설문 시작하기' })).toBeVisible();
  });

  test('새 세션을 생성하고 첫 번째 문항으로 이동한다', async ({ page }) => {
    await page.getByRole('button', { name: '새 설문 시작하기' }).click();
    await expect(page).toHaveURL('/survey');
    await expect(page.getByText('우리 회사에 지원하는 주된 이유는 무엇인가요?')).toBeVisible({ timeout: 5000 });
  });

  test('singleChoice 선택 후 다음 문항으로 이동한다', async ({ page }) => {
    await page.getByRole('button', { name: '새 설문 시작하기' }).click();
    await expect(page.getByText('우리 회사에 지원하는 주된 이유는 무엇인가요?')).toBeVisible({ timeout: 5000 });

    await page.getByText('기술적 도전을 원해서').click();
    await page.getByRole('button', { name: '다음' }).click();

    await expect(page.getByText('가장 매력적인 기술 영역은?')).toBeVisible({ timeout: 5000 });
  });

  test('required 문항에서 선택 없이 다음 클릭 시 검증 오류가 표시된다', async ({ page }) => {
    await page.getByRole('button', { name: '새 설문 시작하기' }).click();
    await expect(page.getByText('우리 회사에 지원하는 주된 이유는 무엇인가요?')).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: '다음' }).click();
    await expect(page.getByText('필수 항목입니다.')).toBeVisible();
  });
});

test.describe('세션 재개', () => {
  test('localStorage 토큰으로 세션을 이어서 진행한다', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { localStorage.removeItem('survey-session'); localStorage.removeItem('msw-mock-db'); });
    await page.reload();

    await page.getByRole('button', { name: '새 설문 시작하기' }).click();
    await expect(page.getByText('우리 회사에 지원하는 주된 이유는 무엇인가요?')).toBeVisible({ timeout: 5000 });

    await page.getByText('기술적 도전을 원해서').click();
    await page.getByRole('button', { name: '다음' }).click();
    await expect(page.getByText('가장 매력적인 기술 영역은?')).toBeVisible({ timeout: 5000 });

    const token = await page.evaluate(() => {
      const raw = localStorage.getItem('survey-session');
      if (!raw) return null;
      return JSON.parse(raw)?.state?.sessionToken as string | null;
    });
    expect(token).toBeTruthy();

    await page.goto('/');
    await expect(page.getByText('진행 중인 세션이 있습니다.')).toBeVisible({ timeout: 3000 });
    const inputValue = await page.locator('input[placeholder*="세션 토큰"]').inputValue();
    expect(inputValue).toBe(token!);

    await page.getByRole('button', { name: '이어서 진행하기' }).click();
    await expect(page).toHaveURL('/survey');
    await expect(page.getByText('가장 매력적인 기술 영역은?')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('오류 처리', () => {
  test('잘못된 세션 토큰 입력 시 에러 메시지가 표시된다', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { localStorage.removeItem('survey-session'); localStorage.removeItem('msw-mock-db'); });
    await page.reload();

    const input = page.locator('input[placeholder*="세션 토큰"]');
    await input.fill('invalid-token-xyz');
    await page.getByRole('button', { name: '이어서 진행하기' }).click();

    await expect(page.getByText('유효하지 않은 세션 토큰입니다.')).toBeVisible({ timeout: 5000 });
  });
});
