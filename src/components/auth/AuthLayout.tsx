import React, { useEffect, useRef } from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Persistent auth background and global cursor glow tracker for Login/Signup.
 * Keeps the animated gradient mounted between route transitions to avoid snaps.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let rafId: number | null = null;
    const handleMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const update = () => {
        const targets = el.querySelectorAll<HTMLElement>('.cursor-glow-border');
        targets.forEach((btn) => {
          const rect = btn.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          btn.style.setProperty('--glow-x', `${x}%`);
          btn.style.setProperty('--glow-y', `${y}%`);
        });
      };
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };
    window.addEventListener('mousemove', handleMove);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMove);
    };
  }, []);

  return (
    // `dark` forces the on-brand near-black auth surface regardless of the
    // app's chosen theme — the calendar product stays light, the entry is
    // cohesive with the rest of the portfolio.
    <div
      ref={containerRef}
      className="dark auth-gradient-bg min-h-svh w-full flex items-center justify-center p-4 sm:p-6 md:p-10"
    >
      <div className="relative z-10 flex w-full flex-col items-center">
        <div className="mb-8 flex items-center gap-2 font-mono text-sm font-semibold tracking-tight text-white">
          task<span className="text-white/40">_</span>flow
        </div>
        {children}
      </div>
    </div>
  );
}
