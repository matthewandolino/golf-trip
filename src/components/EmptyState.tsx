import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
}

export default function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="text-white/30 mb-4">{icon}</div>
      <h3 className="text-lg text-white/70 mb-2">{title}</h3>
      <p className="text-sm text-white/40">{message}</p>
    </div>
  );
}
