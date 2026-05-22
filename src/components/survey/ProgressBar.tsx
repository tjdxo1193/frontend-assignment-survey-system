interface Props {
  answeredCount: number;
}

export function ProgressBar({ answeredCount }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
      <span>{answeredCount}개 완료</span>
      <div className="flex gap-1">
        {Array.from({ length: Math.max(answeredCount, 1) }).map((_, i) => (
          <div key={i} className="h-1.5 w-4 rounded-full bg-blue-500" />
        ))}
        <div className="h-1.5 w-4 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}
