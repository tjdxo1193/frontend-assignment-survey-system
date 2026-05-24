import type { AnswerPayload } from '@/types';

type OptionLike = { id: string; label: string };

export function buildAnswerLabel(
  questionType: string,
  options: OptionLike[] | undefined,
  payload: AnswerPayload
): string {
  if (!payload) return '';
  if (questionType === 'singleChoice' && payload.optionId) {
    return options?.find((o) => o.id === payload.optionId)?.label ?? payload.optionId;
  }
  if (questionType === 'multiChoice' && payload.optionIds) {
    return payload.optionIds
      .map((id) => options?.find((o) => o.id === id)?.label ?? id)
      .join(', ');
  }
  if (questionType === 'text' && payload.text !== undefined) {
    return payload.text;
  }
  return '';
}
