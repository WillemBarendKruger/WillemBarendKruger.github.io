import Link from "next/link";
import type { ReactNode } from "react";

export function GlowButton({
  href,
  children,
  variant = "primary",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  external?: boolean;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-sm border px-4 py-2 font-mono text-sm tracking-wide transition-all";
  const styles =
    variant === "primary"
      ? "border-cyan/60 text-cyan hover:bg-cyan/10 hover:shadow-glow-md"
      : "border-hairline/50 text-muted hover:border-cyan/50 hover:text-cyan";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={`${base} ${styles}`}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
