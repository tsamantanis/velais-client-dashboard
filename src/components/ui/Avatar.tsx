interface AvatarProps {
  initials: string;
  className?: string;
}

export function Avatar({ initials, className = "" }: AvatarProps) {
  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600 ${className}`}
    >
      {initials}
    </div>
  );
}
