import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import type { Question } from '@/types';
import { validateAnswer } from '@/utils/validation';
import { useState } from 'react';
import { MultiChoiceInput } from './MultiChoiceInput';
import { SingleChoiceInput } from './SingleChoiceInput';
import { TextInput } from './TextInput';

type AnswerPayload = { optionId?: string; optionIds?: string[]; text?: string } | null;

interface Props {
  question: Question;
  questionNumber: number;
  onSubmit: (answer: AnswerPayload) => Promise<void>;
  isSubmitting: boolean;
}

export function QuestionCard({ question, questionNumber, onSubmit, isSubmitting }: Props) {
  const [singleValue, setSingleValue] = useState<string | null>(null);
  const [multiValues, setMultiValues] = useState<string[]>([]);
  const [textValue, setTextValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const buildPayload = (): AnswerPayload => {
    if (question.type === 'singleChoice') return singleValue ? { optionId: singleValue } : null;
    if (question.type === 'multiChoice')
      return multiValues.length > 0 ? { optionIds: multiValues } : null;
    if (question.type === 'text') return textValue.trim() ? { text: textValue.trim() } : null;
    return null;
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    const result = validateAnswer(question, payload);
    if (!result.valid) {
      setValidationError(result.error ?? '입력을 확인해주세요.');
      return;
    }
    setValidationError(null);
    await onSubmit(payload);
  };

  const canSkip = !question.required;
  const hasAnswer =
    (question.type === 'singleChoice' && singleValue !== null) ||
    (question.type === 'multiChoice' && multiValues.length > 0) ||
    (question.type === 'text' && textValue.trim().length > 0);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
          Q{questionNumber}
        </span>
        {question.required && <span className="text-xs font-medium text-red-500">필수</span>}
      </div>
      <h2 className="mb-5 text-base font-semibold leading-relaxed text-gray-900">
        {question.text}
      </h2>

      {question.type === 'singleChoice' && question.options && (
        <SingleChoiceInput
          options={question.options}
          value={singleValue}
          onChange={setSingleValue}
        />
      )}
      {question.type === 'multiChoice' && question.options && (
        <MultiChoiceInput
          options={question.options}
          values={multiValues}
          onChange={setMultiValues}
          minSelect={question.minSelect}
          maxSelect={question.maxSelect}
        />
      )}
      {question.type === 'text' && (
        <TextInput value={textValue} onChange={setTextValue} required={question.required} />
      )}

      {validationError && (
        <div className="mt-4">
          <ErrorMessage message={validationError} />
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        {canSkip && !hasAnswer ? (
          <span className="text-xs text-gray-400">건너뛰기 가능</span>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          {canSkip && (
            <Button
              variant="ghost"
              onClick={() => {
                setValidationError(null);
                void onSubmit(null);
              }}
              disabled={isSubmitting}
            >
              건너뛰기
            </Button>
          )}
          <Button
            onClick={() => void handleSubmit()}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
