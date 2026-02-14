import type { ReactNode } from 'react';

interface BackgroundPageProps {
  backgroundImage: string;
  children: ReactNode;
}

export default function BackgroundPage({ backgroundImage, children }: BackgroundPageProps) {
  return (
    <div className="relative min-h-screen w-full">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="fixed inset-0 bg-black/60" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
