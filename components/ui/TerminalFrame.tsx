import type { ReactNode } from "react";

export function TerminalFrame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-sm border border-hairline/40 bg-panel/80">
      <div className="flex items-center gap-2 border-b border-hairline/40 px-3 py-2">
        <span aria-hidden className="size-2 rounded-full bg-hairline/60" />
        <span aria-hidden className="size-2 rounded-full bg-hairline/60" />
        <span aria-hidden className="size-2 rounded-full bg-hairline/60" />
        <span className="ml-2 font-mono text-xs tracking-widest text-muted uppercase">
          {title}
        </span>
      </div>
      <div className="p-4 font-mono text-sm sm:p-6">{children}</div>
    </div>
  );
}
