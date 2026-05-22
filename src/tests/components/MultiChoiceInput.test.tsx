import { MultiChoiceInput } from '@/components/survey/MultiChoiceInput';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const options = [
  { id: 'o1', label: 'NestJS' },
  { id: 'o2', label: 'Go' },
  { id: 'o3', label: 'Redis' },
];

describe('MultiChoiceInput', () => {
  it('옵션 목록을 렌더링한다', () => {
    render(<MultiChoiceInput options={options} values={[]} onChange={vi.fn()} />);
    expect(screen.getByText('NestJS')).toBeInTheDocument();
    expect(screen.getByText('Go')).toBeInTheDocument();
    expect(screen.getByText('Redis')).toBeInTheDocument();
  });

  it('이미 선택된 항목을 클릭하면 해제된다', () => {
    const onChange = vi.fn();
    render(<MultiChoiceInput options={options} values={['o1', 'o2']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'NestJS' }));
    expect(onChange).toHaveBeenCalledWith(['o2']);
  });

  it('maxSelect 초과 시 새 항목을 선택할 수 없다', () => {
    const onChange = vi.fn();
    render(
      <MultiChoiceInput options={options} values={['o1', 'o2']} onChange={onChange} maxSelect={2} />
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Redis' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('maxSelect 미만이면 새 항목을 선택할 수 있다', () => {
    const onChange = vi.fn();
    render(
      <MultiChoiceInput options={options} values={['o1']} onChange={onChange} maxSelect={2} />
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Go' }));
    expect(onChange).toHaveBeenCalledWith(['o1', 'o2']);
  });

  it('minSelect/maxSelect 힌트를 렌더링한다', () => {
    render(
      <MultiChoiceInput
        options={options}
        values={[]}
        onChange={vi.fn()}
        minSelect={1}
        maxSelect={3}
      />
    );
    expect(screen.getByText(/1~3개 선택/)).toBeInTheDocument();
  });

  it('maxSelect만 있을 때 힌트를 렌더링한다', () => {
    render(<MultiChoiceInput options={options} values={[]} onChange={vi.fn()} maxSelect={2} />);
    expect(screen.getByText(/최대 2개 선택/)).toBeInTheDocument();
  });

  it('minSelect만 있을 때 힌트를 렌더링한다', () => {
    render(<MultiChoiceInput options={options} values={[]} onChange={vi.fn()} minSelect={1} />);
    expect(screen.getByText(/최소 1개 선택/)).toBeInTheDocument();
  });
});
