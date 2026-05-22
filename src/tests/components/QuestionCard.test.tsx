import { QuestionCard } from '@/components/survey/QuestionCard';
import type { Question } from '@/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const singleChoiceQ: Question = {
  id: 'q1',
  text: '지원 이유는?',
  type: 'singleChoice',
  required: true,
  options: [
    { id: 'o1', label: '기술적 도전', nextQuestionId: 'q2' },
    { id: 'o2', label: '성장 가능성', nextQuestionId: 'q2' },
  ],
};

const multiChoiceQ: Question = {
  id: 'q2',
  text: '관심 기술 영역은?',
  type: 'multiChoice',
  required: true,
  minSelect: 1,
  maxSelect: 2,
  options: [
    { id: 'o1', label: 'React' },
    { id: 'o2', label: 'TypeScript' },
    { id: 'o3', label: 'Node.js' },
  ],
  nextQuestionId: 'q3',
};

const textQ: Question = {
  id: 'q3',
  text: '자기소개를 입력하세요',
  type: 'text',
  required: false,
};

const requiredTextQ: Question = {
  id: 'q4',
  text: '경험을 입력하세요',
  type: 'text',
  required: true,
};

describe('QuestionCard', () => {
  describe('singleChoice', () => {
    it('문항 텍스트와 옵션 목록을 렌더링한다', () => {
      render(
        <QuestionCard
          question={singleChoiceQ}
          questionNumber={1}
          onSubmit={vi.fn()}
          isSubmitting={false}
        />
      );
      expect(screen.getByText('지원 이유는?')).toBeInTheDocument();
      expect(screen.getByText('기술적 도전')).toBeInTheDocument();
      expect(screen.getByText('성장 가능성')).toBeInTheDocument();
    });

    it('옵션 선택 후 다음 클릭 시 onSubmit({ optionId }) 호출', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(
        <QuestionCard
          question={singleChoiceQ}
          questionNumber={1}
          onSubmit={onSubmit}
          isSubmitting={false}
        />
      );
      fireEvent.click(screen.getByRole('radio', { name: '기술적 도전' }));
      fireEvent.click(screen.getByRole('button', { name: '다음' }));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ optionId: 'o1' }));
    });

    it('required 문항 미선택 시 validation error 표시', async () => {
      const onSubmit = vi.fn();
      render(
        <QuestionCard
          question={singleChoiceQ}
          questionNumber={1}
          onSubmit={onSubmit}
          isSubmitting={false}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: '다음' }));
      await waitFor(() =>
        expect(screen.getByText('필수 항목입니다.')).toBeInTheDocument()
      );
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('required 문항에 건너뛰기 버튼이 없다', () => {
      render(
        <QuestionCard
          question={singleChoiceQ}
          questionNumber={1}
          onSubmit={vi.fn()}
          isSubmitting={false}
        />
      );
      expect(screen.queryByRole('button', { name: '건너뛰기' })).not.toBeInTheDocument();
    });
  });

  describe('multiChoice', () => {
    it('옵션 목록과 min/max 힌트를 렌더링한다', () => {
      render(
        <QuestionCard
          question={multiChoiceQ}
          questionNumber={2}
          onSubmit={vi.fn()}
          isSubmitting={false}
        />
      );
      expect(screen.getByText('관심 기술 영역은?')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText(/1~2개 선택/)).toBeInTheDocument();
    });

    it('여러 옵션 선택 후 onSubmit({ optionIds }) 호출', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(
        <QuestionCard
          question={multiChoiceQ}
          questionNumber={2}
          onSubmit={onSubmit}
          isSubmitting={false}
        />
      );
      fireEvent.click(screen.getByRole('checkbox', { name: 'React' }));
      fireEvent.click(screen.getByRole('checkbox', { name: 'TypeScript' }));
      fireEvent.click(screen.getByRole('button', { name: '다음' }));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ optionIds: ['o1', 'o2'] })
      );
    });

    it('maxSelect 초과 시 추가 체크박스가 비활성화된다', () => {
      render(
        <QuestionCard
          question={multiChoiceQ}
          questionNumber={2}
          onSubmit={vi.fn()}
          isSubmitting={false}
        />
      );
      fireEvent.click(screen.getByRole('checkbox', { name: 'React' }));
      fireEvent.click(screen.getByRole('checkbox', { name: 'TypeScript' }));
      expect(screen.getByRole('checkbox', { name: 'Node.js' })).toBeDisabled();
    });

    it('required 문항 미선택 시 validation error 표시', async () => {
      const onSubmit = vi.fn();
      render(
        <QuestionCard
          question={multiChoiceQ}
          questionNumber={2}
          onSubmit={onSubmit}
          isSubmitting={false}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: '다음' }));
      await waitFor(() =>
        expect(screen.getByText('필수 항목입니다.')).toBeInTheDocument()
      );
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('text', () => {
    it('textarea와 선택 항목 힌트를 렌더링한다 (optional)', () => {
      render(
        <QuestionCard
          question={textQ}
          questionNumber={3}
          onSubmit={vi.fn()}
          isSubmitting={false}
        />
      );
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByText('선택 항목입니다. 비워두면 건너뜁니다.')).toBeInTheDocument();
    });

    it('텍스트 입력 후 onSubmit({ text }) 호출', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(
        <QuestionCard
          question={textQ}
          questionNumber={3}
          onSubmit={onSubmit}
          isSubmitting={false}
        />
      );
      fireEvent.change(screen.getByRole('textbox'), { target: { value: '안녕하세요' } });
      fireEvent.click(screen.getByRole('button', { name: '다음' }));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ text: '안녕하세요' }));
    });

    it('optional 문항에 건너뛰기 버튼이 표시된다', () => {
      render(
        <QuestionCard
          question={textQ}
          questionNumber={3}
          onSubmit={vi.fn()}
          isSubmitting={false}
        />
      );
      expect(screen.getByRole('button', { name: '건너뛰기' })).toBeInTheDocument();
    });

    it('건너뛰기 클릭 시 onSubmit(null) 호출', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(
        <QuestionCard
          question={textQ}
          questionNumber={3}
          onSubmit={onSubmit}
          isSubmitting={false}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: '건너뛰기' }));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(null));
    });

    it('required text 문항 빈 입력 시 validation error 표시', async () => {
      const onSubmit = vi.fn();
      render(
        <QuestionCard
          question={requiredTextQ}
          questionNumber={4}
          onSubmit={onSubmit}
          isSubmitting={false}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: '다음' }));
      await waitFor(() =>
        expect(screen.getByText('필수 항목입니다.')).toBeInTheDocument()
      );
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
