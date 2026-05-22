import { Button } from '@/components/common/Button';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('Button', () => {
  it('children 텍스트를 렌더링한다', () => {
    render(<Button>확인</Button>);
    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
  });

  it('loading=true 일 때 스피너 svg를 렌더링하고 비활성화된다', () => {
    render(<Button loading>저장 중</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.querySelector('svg')).toBeInTheDocument();
  });

  it('disabled=true 일 때 버튼이 비활성화된다', () => {
    render(<Button disabled>비활성</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('onClick 핸들러를 호출한다', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>클릭</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('variant=secondary 클래스가 적용된다', () => {
    render(<Button variant="secondary">secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-white');
  });

  it('variant=ghost 클래스가 적용된다', () => {
    render(<Button variant="ghost">ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-gray-500');
  });
});
