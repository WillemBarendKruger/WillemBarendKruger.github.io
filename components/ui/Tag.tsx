export function Tag({ children }: { children: string }) {
  return (
    <span className="inline-block rounded-sm border border-hairline/40 px-2 py-1 font-mono text-xs text-muted">
      {children}
    </span>
  );
}
