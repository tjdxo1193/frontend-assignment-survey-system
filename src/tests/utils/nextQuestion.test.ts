import { describe, it, expect } from 'vitest';
import { resolveNextQuestionId } from '@/utils/nextQuestion';
import type { Question, SessionAnswer } from '@/types';

const makeAnswer = (questionId: string, optionIds: string[]): SessionAnswer => ({
  questionId,
  questionText: '',
  answer: { type: 'multiChoice', optionIds, submittedAt: '' },
});

describe('resolveNextQuestionId', () => {
  it('singleChoice: returns selected option nextQuestionId', () => {
    const q: Question = {
      id: 'q1',
      type: 'singleChoice',
      text: '',
      required: true,
      options: [
        { id: 'o1', label: 'A', nextQuestionId: 'q2' },
        { id: 'o2', label: 'B', nextQuestionId: 'q3' },
      ],
    };
    expect(resolveNextQuestionId(q, { optionId: 'o1' }, [])).toBe('q2');
    expect(resolveNextQuestionId(q, { optionId: 'o2' }, [])).toBe('q3');
  });

  it('singleChoice: returns null when selected option has no nextQuestionId', () => {
    const q: Question = {
      id: 'q1',
      type: 'singleChoice',
      text: '',
      required: true,
      options: [{ id: 'o1', label: 'A' }],
    };
    expect(resolveNextQuestionId(q, { optionId: 'o1' }, [])).toBeNull();
  });

  it('multiChoice: returns question nextQuestionId', () => {
    const q: Question = {
      id: 'q1',
      type: 'multiChoice',
      text: '',
      required: true,
      nextQuestionId: 'q2',
      options: [{ id: 'o1', label: 'A' }],
    };
    expect(resolveNextQuestionId(q, { optionIds: ['o1'] }, [])).toBe('q2');
  });

  it('text: returns question nextQuestionId', () => {
    const q: Question = {
      id: 'q1',
      type: 'text',
      text: '',
      required: true,
      nextQuestionId: 'q2',
    };
    expect(resolveNextQuestionId(q, { text: 'hello' }, [])).toBe('q2');
  });

  it('text: returns null when nextQuestionId is null (last question)', () => {
    const q: Question = {
      id: 'q8_final',
      type: 'text',
      text: '',
      required: false,
      nextQuestionId: null,
    };
    expect(resolveNextQuestionId(q, null, [])).toBeNull();
  });

  describe('conditional next[]', () => {
    const q: Question = {
      id: 'q5_example',
      type: 'text',
      text: '',
      required: true,
      next: [
        {
          when: { anySelectedIn: { questionId: 'q3_tech_stack', optionIds: ['q3t_o7'] } },
          go: 'q6_sfu',
        },
        { default: true, go: 'q6_workstyle' },
      ],
    };

    it('routes to q6_sfu when q3_tech_stack includes q3t_o7', () => {
      const answers = [makeAnswer('q3_tech_stack', ['q3t_o1', 'q3t_o7'])];
      expect(resolveNextQuestionId(q, { text: 'example' }, answers)).toBe('q6_sfu');
    });

    it('falls back to default when q3t_o7 not selected', () => {
      const answers = [makeAnswer('q3_tech_stack', ['q3t_o1', 'q3t_o3'])];
      expect(resolveNextQuestionId(q, { text: 'example' }, answers)).toBe('q6_workstyle');
    });

    it('falls back to default when q3_tech_stack answer is missing', () => {
      expect(resolveNextQuestionId(q, { text: 'example' }, [])).toBe('q6_workstyle');
    });
  });
});
