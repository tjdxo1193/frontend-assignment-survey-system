import type { QuestionOption } from '@/types';

interface Props {
  options: QuestionOption[];
  value: string | null;
  onChange: (optionId: string) => void;
}

export function SingleChoiceInput({ options, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <label
            key={option.id}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
              selected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <input
              type="radio"
              name="single-choice"
              value={option.id}
              checked={selected}
              onChange={() => onChange(option.id)}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-sm font-medium ${selected ? 'text-blue-700' : 'text-gray-700'}`}>
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
