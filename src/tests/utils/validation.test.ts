import { describe, it, expect } from 'vitest';
import { validateAnswer } from '@/utils/validation';
import type { Question } from '@/types';

const singleQ: Question = {
  id: 'q1',
  type: 'singleChoice',
  text: '',
  required: true,
  options: [
    { id: 'o1', label: 'A', nextQuestionId: 'q2' },
    { id: 'o2', label: 'B', nextQuestionId: 'q3' },
  ],
};

const multiQ: Question = {
  id: 'q2',
  type: 'multiChoice',
  text: '',
  required: true,
  minSelect: 1,
  maxSelect: 3,
  options: [
    { id: 'o1', label: 'A' },
    { id: 'o2', label: 'B' },
    { id: 'o3', label: 'C' },
    { id: 'o4', label: 'D' },
  ],
};

const textQ: Question = { id: 'q3', type: 'text', text: '', required: true };
const optionalTextQ: Question = { id: 'q4', type: 'text', text: '', required: false };

describe('validateAnswer', () => {
  describe('null answer', () => {
    it('is invalid for required question', () => {
      const r = validateAnswer(singleQ, null);
      expect(r.valid).toBe(false);
      expect(r.error).toBe('필수 항목입니다.');
    });

    it('is valid for optional question', () => {
      expect(validateAnswer(optionalTextQ, null).valid).toBe(true);
    });
  });

  describe('singleChoice', () => {
    it('valid when optionId exists in options', () => {
      expect(validateAnswer(singleQ, { optionId: 'o1' }).valid).toBe(true);
    });

    it('invalid when optionId missing', () => {
      const r = validateAnswer(singleQ, {});
      expect(r.valid).toBe(false);
    });

    it('invalid when optionId not in options list', () => {
      const r = validateAnswer(singleQ, { optionId: 'unknown' });
      expect(r.valid).toBe(false);
    });
  });

  describe('multiChoice', () => {
    it('valid within min/max range', () => {
      expect(validateAnswer(multiQ, { optionIds: ['o1', 'o2'] }).valid).toBe(true);
    });

    it('invalid when below minSelect', () => {
      const r = validateAnswer(multiQ, { optionIds: [] });
      expect(r.valid).toBe(false);
      expect(r.error).toContain('1개 이상');
    });

    it('invalid when above maxSelect', () => {
      const r = validateAnswer(multiQ, { optionIds: ['o1', 'o2', 'o3', 'o4'] });
      expect(r.valid).toBe(false);
      expect(r.error).toContain('3개까지');
    });

    it('invalid when unknown optionId included', () => {
      const r = validateAnswer(multiQ, { optionIds: ['o1', 'unknown'] });
      expect(r.valid).toBe(false);
    });
  });

  describe('text', () => {
    it('valid when text has content', () => {
      expect(validateAnswer(textQ, { text: '내용 있음' }).valid).toBe(true);
    });

    it('invalid when required text is empty', () => {
      const r = validateAnswer(textQ, { text: '' });
      expect(r.valid).toBe(false);
    });

    it('invalid when required text is only whitespace', () => {
      const r = validateAnswer(textQ, { text: '   ' });
      expect(r.valid).toBe(false);
    });

    it('valid when optional text is empty', () => {
      expect(validateAnswer(optionalTextQ, { text: '' }).valid).toBe(true);
    });
  });
});
