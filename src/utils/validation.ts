import type { Question } from '@/types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAnswer(
  question: Question,
  answer: { optionId?: string; optionIds?: string[]; text?: string } | null
): ValidationResult {
  if (answer === null) {
    if (question.required) return { valid: false, error: '필수 항목입니다.' };
    return { valid: true };
  }

  if (question.type === 'singleChoice') {
    if (!answer.optionId) return { valid: false, error: '항목을 선택해주세요.' };
    const exists = question.options?.some((o) => o.id === answer.optionId) ?? false;
    if (!exists) return { valid: false, error: '유효하지 않은 선택입니다.' };
  }

  if (question.type === 'multiChoice') {
    const ids = answer.optionIds ?? [];
    if (question.minSelect !== undefined && ids.length < question.minSelect)
      return { valid: false, error: `최소 ${question.minSelect}개 이상 선택해주세요.` };
    if (question.required && ids.length === 0) return { valid: false, error: '항목을 선택해주세요.' };
    if (question.maxSelect !== undefined && ids.length > question.maxSelect)
      return { valid: false, error: `최대 ${question.maxSelect}개까지 선택 가능합니다.` };
    const validSet = new Set(question.options?.map((o) => o.id) ?? []);
    if (ids.some((id) => !validSet.has(id))) return { valid: false, error: '유효하지 않은 선택입니다.' };
  }

  if (question.type === 'text') {
    if (question.required && !answer.text?.trim()) return { valid: false, error: '내용을 입력해주세요.' };
  }

  return { valid: true };
}
