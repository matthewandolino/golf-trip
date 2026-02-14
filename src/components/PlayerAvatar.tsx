const COLORS = [
  '#2d5a3f', '#c9a84c', '#8b5e3c', '#4a7c59',
  '#6b4c8a', '#c95c4c', '#4c8a8b', '#8a6b4c',
];

interface PlayerAvatarProps {
  name: string;
  playerId?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PlayerAvatar({ name, playerId, size = 'md', className = '' }: PlayerAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colorIndex = playerId
    ? parseInt(playerId, 10) % COLORS.length
    : name.charCodeAt(0) % COLORS.length;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0 ${className}`}
      style={{ backgroundColor: COLORS[colorIndex] }}
    >
      {initials}
    </div>
  );
}
