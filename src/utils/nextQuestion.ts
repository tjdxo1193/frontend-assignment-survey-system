import type { Question, SessionAnswer } from '@/types';

export function resolveNextQuestionId(
  question: Question,
  answerPayload: { optionId?: string; optionIds?: string[]; text?: string } | null,
  allAnswers: SessionAnswer[]
): string | null {
  if (question.next && question.next.length > 0) {
    for (const rule of question.next) {
      if (rule.when) {
        const { anySelectedIn } = rule.when;
        const prev = allAnswers.find((a) => a.questionId === anySelectedIn.questionId);
        const prevIds = prev?.answer.optionIds ?? [];
        if (prevIds.some((id) => anySelectedIn.optionIds.includes(id))) {
          return rule.go;
        }
      } else if (rule.default) {
        return rule.go;
      }
    }
  }

  if (question.type === 'singleChoice' && answerPayload?.optionId) {
    const option = question.options?.find((o) => o.id === answerPayload.optionId);
    return option?.nextQuestionId ?? null;
  }

  return question.nextQuestionId ?? null;
}
