import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { COMPANION, MANUAL } from "@/lib/calibre/content";
import { cx } from "@/lib/calibre/cx";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-ink text-bone lg:grid lg:grid-cols-[minmax(0,40rem)_minmax(18rem,1fr)]">
      <div className="flex min-h-dvh w-full flex-col px-5 py-6 sm:px-8 lg:px-10">{children}</div>
      <aside className="hidden bg-ink lg:block">
        <div className="sticky top-0 max-h-dvh overflow-auto p-8">
          <Manual />
        </div>
      </aside>
    </div>
  );
}

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path
        d="M9 5v22M9 8h11M9 24h11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="square"
      />
      <circle cx="23" cy="16" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function Lamps({ lit, active }: { lit: number; active: number }) {
  return (
    <div className="flex gap-1.5" role="img" aria-label={`${lit} de 5 estações em ritmo`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={cx(
            "h-1.5 flex-1 rounded-full",
            index < lit ? "bg-amber" : index === active ? "bg-moss" : "bg-panel-2",
          )}
        />
      ))}
    </div>
  );
}

export function Top({
  title,
  kicker,
  onBack,
  lamps,
}: {
  title: string;
  kicker?: string;
  onBack?: () => void;
  lamps?: { lit: number; active: number };
}) {
  return (
    <header className="mb-6">
      <div className="flex items-center gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-panel text-bone"
            aria-label="Voltar à linha"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <Mark className="size-8 shrink-0 text-amber" />
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-widest text-amber">CALIBRE</p>
          <h1 className="truncate text-xl font-semibold leading-tight">{title}</h1>
        </div>
      </div>
      {kicker ? <p className="mt-3 text-sm text-muted">{kicker}</p> : null}
      {lamps ? (
        <div className="mt-4">
          <Lamps lit={lamps.lit} active={lamps.active} />
        </div>
      ) : null}
    </header>
  );
}

export function Primary({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cx(
        "inline-flex min-h-12 w-full items-center justify-center rounded-card bg-amber px-4 py-3 text-base font-semibold text-amber-ink disabled:opacity-40",
        props.className,
      )}
    >
      {children}
    </button>
  );
}

export function Ghost({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cx(
        "inline-flex min-h-11 items-center justify-center rounded-card px-3 py-2 text-sm font-medium text-muted disabled:opacity-40",
        props.className,
      )}
    >
      {children}
    </button>
  );
}

export function Manual() {
  return <NoteCard kicker="NA LINHA" note={MANUAL} />;
}

export function CompanionNote() {
  return <NoteCard kicker="ACOMPANHAMENTO" note={COMPANION} />;
}

function NoteCard({
  kicker,
  note,
}: {
  kicker: string;
  note: { title: string; lede: string; blocks: { h: string; p: string }[] };
}) {
  return (
    <article className="rounded-card bg-bone p-6 text-ink-bone">
      <p className="text-xs font-semibold tracking-widest text-quiet">{kicker}</p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight">{note.title}</h2>
      <p className="mt-3 text-base leading-relaxed">{note.lede}</p>
      <div className="mt-6 space-y-5">
        {note.blocks.map((block) => (
          <section key={block.h}>
            <h3 className="text-base font-semibold">{block.h}</h3>
            <p className="mt-1 text-sm leading-relaxed text-quiet">{block.p}</p>
          </section>
        ))}
      </div>
    </article>
  );
}

export function Whisper({ children, tone = "idle" }: { children: ReactNode; tone?: "idle" | "good" | "miss" }) {
  return (
    <p
      aria-live="polite"
      className={cx(
        "min-h-16 text-sm leading-relaxed",
        tone === "good" && "text-moss",
        tone === "miss" && "text-clay",
        tone === "idle" && "text-muted",
      )}
    >
      {children}
    </p>
  );
}
