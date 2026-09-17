import { GlowButton } from "@/components/ui/GlowButton";
import { TerminalFrame } from "@/components/ui/TerminalFrame";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl items-center px-4">
      <TerminalFrame title="willem@grimoire">
        <p className="text-muted">
          <span className="text-green">&gt;</span> resolve path
        </p>
        <h1 className="mt-4 text-xl text-text">404 — no such artifact</h1>
        <p className="mt-2 text-muted">
          That page does not exist. It may have been renamed or never written.
        </p>
        <div className="mt-6">
          <GlowButton href="/">Return to the grimoire</GlowButton>
        </div>
      </TerminalFrame>
    </div>
  );
}
