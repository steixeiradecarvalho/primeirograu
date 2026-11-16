import { useState } from "react";
import { formatExpr, identical, type Side } from "@/lib/calibre/algebra";
import type { BuildPuzzle } from "@/lib/calibre/content";
import { cx } from "@/lib/calibre/cx";
import { Ghost, Primary, Top, Whisper } from "./ui";

function chosenSide(puzzle: BuildPuzzle, ids: string[]): Side {
  return ids.flatMap((id) => puzzle.chips.find((chip) => chip.id === id)?.side ?? []);
}

export function BuildRound({
  puzzle,
  index,
  total,
  lamps,
  onBack,
  onDone,
}: {
  puzzle: BuildPuzzle;
  index: number;
  total: number;
  lamps: { lit: number; active: number };
  onBack: () => void;
  onDone: (line: string) => void;
}) {
  const [ids, setIds] = useState<string[]>([]);
  const [note, setNote] = useState("Toca os pedaços que a história pede. A ordem não importa.");
  const [tone, setTone] = useState<"idle" | "good" | "miss">("idle");
  const [done, setDone] = useState(false);
  const side = chosenSide(puzzle, ids);

  function toggle(id: string) {
    if (done) return;
    setTone("idle");
    setIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function check() {
    if (ids.length === 0) {
      setTone("miss");
      setNote("Ainda está vazio. Escolhe pelo menos um pedaço.");
      return;
    }
    if (identical(side, puzzle.target)) {
      setDone(true);
      setTone("good");
      const opened = side.some((node) => node.k === "p");
      const packed = puzzle.target.some((node) => node.k === "p");
      setNote(
        opened || !packed
          ? puzzle.insight
          : `${puzzle.insight} Você abriu o parêntese. Vale do mesmo jeito.`,
      );
      return;
    }
    const trap = puzzle.traps.find((item) => identical(side, item.side));
    setTone("miss");
    setNote(trap?.say ?? "Essa combinação não é a da história. Tira um pedaço e lê de novo o que multiplica e o que só soma.");
  }

  return (
    <div className="flex flex-1 flex-col">
      <Top title="Leitura" kicker={`${puzzle.kicker} · ${index + 1} de ${total}`} onBack={onBack} lamps={lamps} />
      <p className="text-base leading-relaxed">{puzzle.story}</p>
      <p className="mt-3 text-sm font-medium text-amber">{puzzle.prompt}</p>
      <div
        className={cx(
          "mt-4 rounded-card border bg-bone p-4 text-ink-bone",
          tone === "miss" ? "border-clay" : "border-bone",
        )}
      >
        <p className="text-xs font-semibold tracking-widest text-quiet">EXPRESSÃO</p>
        <p className="mt-2 min-h-10 font-mono text-eq leading-tight">
          {ids.length === 0 ? "—" : formatExpr(side, puzzle.varName)}
        </p>
        {ids.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {ids.map((id) => {
              const chip = puzzle.chips.find((item) => item.id === id);
              if (!chip) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  className="min-h-11 rounded-full bg-bone-2 px-3 font-mono text-base text-ink-bone"
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {puzzle.chips.map((chip) => {
          const on = ids.includes(chip.id);
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => toggle(chip.id)}
              aria-pressed={on}
              className={cx(
                "min-h-12 rounded-2xl border px-3 font-mono text-base",
                on
                  ? "border-amber bg-amber text-amber-ink"
                  : "border-line bg-panel text-bone",
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <Whisper tone={tone}>{note}</Whisper>
      </div>
      <div className="mt-auto pt-4">
        {done ? (
          <Primary onClick={() => onDone(formatExpr(puzzle.target, puzzle.varName))}>Seguir</Primary>
        ) : (
          <div className="flex flex-col gap-1">
            <Primary onClick={check}>É esta</Primary>
            <Ghost onClick={() => setIds([])} disabled={ids.length === 0}>
              Limpar
            </Ghost>
          </div>
        )}
      </div>
    </div>
  );
}
