import type { QuestionOption } from '@/types';

interface Props {
  options: QuestionOption[];
  values: string[];
  onChange: (ids: string[]) => void;
  minSelect?: number;
  maxSelect?: number;
}

export function MultiChoiceInput({ options, values, onChange, minSelect, maxSelect }: Props) {
  const toggle = (id: string) => {
    if (values.includes(id)) {
      onChange(values.filter((v) => v !== id));
    } else {
      if (maxSelect !== undefined && values.length >= maxSelect) return;
      onChange([...values, id]);
    }
  };

  const hint =
    minSelect !== undefined && maxSelect !== undefined
      ? `${minSelect}~${maxSelect}개 선택 (현재 ${values.length}개)`
      : maxSelect !== undefined
        ? `최대 ${maxSelect}개 선택 (현재 ${values.length}개)`
        : minSelect !== undefined
          ? `최소 ${minSelect}개 선택 (현재 ${values.length}개)`
          : null;

  return (
    <div className="flex flex-col gap-2">
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const checked = values.includes(option.id);
          const disabled = !checked && maxSelect !== undefined && values.length >= maxSelect;
          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                checked
                  ? 'border-blue-500 bg-blue-50'
                  : disabled
                    ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-50'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <input
                type="checkbox"
                value={option.id}
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(option.id)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span
                className={`text-sm font-medium ${checked ? 'text-blue-700' : 'text-gray-700'}`}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
