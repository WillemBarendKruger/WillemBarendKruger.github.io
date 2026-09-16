import type { ReactNode } from "react";

const ACCENT = {
  green: "border-green/25 hover:border-green/50",
  cyan: "border-cyan/25 hover:border-cyan/50",
  purple: "border-purple/25 hover:border-purple/50",
} as const;

export function Panel({
  children,
  accent = "purple",
  className = "",
}: {
  children: ReactNode;
  accent?: keyof typeof ACCENT;
  className?: string;
}) {
  return (
    <div
      className={`rounded-sm border bg-panel/60 backdrop-blur-sm transition-colors ${ACCENT[accent]} ${className}`}
    >
      {children}
    </div>
  );
}
