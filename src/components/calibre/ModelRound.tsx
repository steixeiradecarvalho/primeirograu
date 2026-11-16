import { useState } from "react";
import { formatEquation } from "@/lib/calibre/algebra";
import { MODEL, MODEL_2, type ModelPuzzle, type SolvePuzzle } from "@/lib/calibre/content";
import { cx } from "@/lib/calibre/cx";
import { useCalibre } from "@/lib/calibre/store";
import { SolveRound } from "./SolveRound";
import { Top, Whisper } from "./ui";

export function ModelRound({
  which,
  lamps,
  onBack,
  onDone,
}: {
  which: 1 | 2;
  lamps: { lit: number; active: number };
  onBack: () => void;
  onDone: (line: string) => void;
}) {
  const puzzle: ModelPuzzle = which === 1 ? MODEL : MODEL_2;
  const addModelMiss = useCalibre((s) => s.addModelMiss);
  const [picked, setPicked] = useState<string | null>(null);
  const [misses, setMisses] = useState<Record<string, string>>({});
  const choice = puzzle.choices.find((item) => item.id === picked) ?? null;

  if (choice?.ok) {
    const solve: SolvePuzzle = {
      id: puzzle.id,
      kicker: puzzle.kicker,
      story: "A leitura fechou. Agora isola, com os mesmos gestos.",
      equation: choice.equation,
      expect: puzzle.expect,
      mode: "free",
      whisper: choice.say,
      insight: puzzle.insight,
    };
    return <SolveRound puzzle={solve} lamps={lamps} onBack={onBack} onDone={onDone} />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Top
        title={which === 1 ? "Turno da agência" : "Segundo chamado"}
        kicker={puzzle.kicker}
        onBack={onBack}
        lamps={lamps}
      />
      <p className="text-base leading-relaxed">{puzzle.story}</p>
      <p className="mt-3 text-sm font-medium text-amber">{puzzle.ask}</p>
      <div className="mt-4 space-y-3">
        {puzzle.choices.map((item) => {
          const miss = misses[item.id];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.ok) {
                  setPicked(item.id);
                  return;
                }
                setMisses((current) => ({ ...current, [item.id]: item.say }));
                if (!miss) addModelMiss();
              }}
              className={cx(
                "w-full rounded-card border px-4 py-4 text-left",
                miss ? "border-clay bg-panel" : "border-line bg-panel",
              )}
            >
              <span className="font-mono text-lg">{formatEquation(item.equation)}</span>
              {miss ? <span className="mt-2 block text-sm leading-relaxed text-clay">{miss}</span> : null}
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <Whisper>Três leituras. Só uma conta a história do jeito que ela foi dita.</Whisper>
      </div>
    </div>
  );
}
