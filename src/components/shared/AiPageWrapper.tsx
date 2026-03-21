import { ReactNode } from 'react';

interface AiPageWrapperProps {
  children: ReactNode;
}

export function AiPageWrapper({ children }: AiPageWrapperProps) {
  return (
    <div className="relative min-h-[60vh]">
      {/* Animated blurred background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 right-0 h-64 w-64 rounded-full bg-accent/30 blur-3xl animate-[pulse_8s_ease-in-out_infinite_1s]" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-primary/10 blur-3xl animate-[pulse_7s_ease-in-out_infinite_2s]" />
      </div>

      {/* Glass card */}
      <div className="relative rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl p-8 shadow-lg animate-fade-in">
        {children}
      </div>
    </div>
  );
}
