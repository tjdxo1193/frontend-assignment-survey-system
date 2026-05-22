interface Props {
  value: string;
  onChange: (text: string) => void;
  required: boolean;
  placeholder?: string;
}

export function TextInput({ value, onChange, required, placeholder }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder={
          placeholder ?? (required ? '답변을 입력해주세요.' : '(선택) 답변을 입력해주세요.')
        }
        className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm text-gray-800 placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
      {!required && <p className="text-xs text-gray-400">선택 항목입니다. 비워두면 건너뜁니다.</p>}
    </div>
  );
}
