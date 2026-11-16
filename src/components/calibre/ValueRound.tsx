import { useState } from "react";
import { evalSide, formatExpr, valueMiss } from "@/lib/calibre/algebra";
import type { ValuePuzzle } from "@/lib/calibre/content";
import { Keypad, pushDigit, readNumber } from "./Keypad";
import { Primary, Top, Whisper } from "./ui";

export function ValueRound({
  puzzle,
  index,
  total,
  lamps,
  onBack,
  onDone,
}: {
  puzzle: ValuePuzzle;
  index: number;
  total: number;
  lamps: { lit: number; active: number };
  onBack: () => void;
  onDone: (line: string) => void;
}) {
  const [raw, setRaw] = useState("");
  const [note, setNote] = useState("Troca a letra pelo número e faz a conta.");
  const [tone, setTone] = useState<"idle" | "good" | "miss">("idle");
  const [done, setDone] = useState(false);
  const expected = evalSide(puzzle.side, puzzle.value);

  function submit() {
    const answer = readNumber(raw);
    if (answer === null) {
      setTone("miss");
      setNote("Digita um número. O sinal, se precisar, é a tecla −.");
      return;
    }
    if (answer === expected) {
      setDone(true);
      setTone("good");
      setNote(puzzle.insight);
      return;
    }
    setTone("miss");
    setNote(valueMiss(puzzle.side, puzzle.varName, puzzle.value, answer));
  }

  return (
    <div className="flex flex-1 flex-col">
      <Top
        title="Substituição"
        kicker={`${puzzle.kicker} · ${index + 1} de ${total}`}
        onBack={onBack}
        lamps={lamps}
      />
      <p className="text-base leading-relaxed">{puzzle.story}</p>
      <div className="mt-4 rounded-card bg-bone p-4 text-ink-bone">
        <p className="font-mono text-eq leading-tight">{formatExpr(puzzle.side, puzzle.varName)}</p>
        <p className="mt-2 font-mono text-sm text-quiet">
          {puzzle.varName} = {puzzle.value}
        </p>
        <p className="mt-4 text-xs font-semibold tracking-widest text-quiet">VALE</p>
        <p className="font-mono text-3xl">{raw === "" ? "—" : raw}</p>
      </div>
      <p className="mt-4 text-sm font-medium text-amber">{puzzle.prompt}</p>
      <div className="mt-3">
        <Whisper tone={tone}>{note}</Whisper>
      </div>
      {done ? (
        <div className="mt-auto pt-4">
          <Primary
            onClick={() =>
              onDone(`${formatExpr(puzzle.side, puzzle.varName)} com ${puzzle.varName} = ${puzzle.value} → ${expected}`)
            }
          >
            Seguir
          </Primary>
        </div>
      ) : (
        <div className="mt-auto space-y-3 pt-4">
          <Keypad onKey={(key) => setRaw((current) => pushDigit(current, key))} />
          <Primary onClick={submit}>Ver se fecha</Primary>
        </div>
      )}
    </div>
  );
}
