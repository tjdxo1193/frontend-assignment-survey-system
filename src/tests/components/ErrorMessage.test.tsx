import { ErrorMessage } from '@/components/common/ErrorMessage';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('ErrorMessage', () => {
  it('오류 메시지를 렌더링한다', () => {
    render(<ErrorMessage message="오류가 발생했습니다." />);
    expect(screen.getByText('오류가 발생했습니다.')).toBeInTheDocument();
  });

  it('onRetry 없으면 다시 시도 버튼이 표시되지 않는다', () => {
    render(<ErrorMessage message="오류" />);
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument();
  });

  it('onRetry 있으면 다시 시도 버튼이 표시된다', () => {
    render(<ErrorMessage message="오류" onRetry={vi.fn()} />);
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  it('다시 시도 버튼 클릭 시 onRetry가 호출된다', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="오류" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
