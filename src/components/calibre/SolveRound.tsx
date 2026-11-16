import { useEffect, useState } from "react";
import {
  addConstBoth,
  distribute,
  divisors,
  evalSide,
  formatEquation,
  hasProduct,
  hintFor,
  isSolved,
  moveNode,
  nodeLabel,
  progressScore,
  scale,
  tryDivide,
  type Equation,
  type SideName,
} from "@/lib/calibre/algebra";
import type { GuidedOp, SolvePuzzle } from "@/lib/calibre/content";
import { cx } from "@/lib/calibre/cx";
import { useCalibre } from "@/lib/calibre/store";
import { Keypad, pushDigit, readNumber } from "./Keypad";
import { Ghost, Primary, Top, Whisper } from "./ui";

function applyStep(equation: Equation, step: GuidedOp): Equation {
  if (step.op === "add") return addConstBoth(equation, step.delta).eq;
  return tryDivide(equation, step.by) ?? equation;
}

export function SolveRound({
  puzzle,
  lamps,
  onBack,
  onDone,
  timed = false,
}: {
  puzzle: SolvePuzzle;
  lamps: { lit: number; active: number };
  onBack: () => void;
  onDone: (line: string) => void;
  timed?: boolean;
}) {
  const addHint = useCalibre((s) => s.addHint);
  const addStall = useCalibre((s) => s.addStall);
  const showTime = useCalibre((s) => s.showTime);
  const setShowTime = useCalibre((s) => s.setShowTime);
  const [equation, setEquation] = useState(puzzle.equation);
  const [history, setHistory] = useState<Equation[]>([]);
  const [selected, setSelected] = useState<{ side: SideName; index: number } | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [note, setNote] = useState(puzzle.whisper || "A igualdade aguenta, desde que os dois lados recebam o mesmo tratamento.");
  const [tone, setTone] = useState<"idle" | "good" | "miss">("idle");
  const [stamp, setStamp] = useState<number | null>(null);
  const [testing, setTesting] = useState(false);
  const [guess, setGuess] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const guidedStep = puzzle.mode === "guided" ? puzzle.steps?.[history.length] : undefined;
  const name = equation.varName;

  useEffect(() => {
    if (!timed || !showTime || stamp !== null) return;
    const id = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [timed, showTime, stamp, puzzle.id]);

  function commit(next: Equation, message: string, merged: boolean) {
    const before = progressScore(equation);
    const after = progressScore(next);
    setHistory((stack) => [...stack, equation]);
    setEquation(next);
    setSelected(null);
    setTesting(false);
    const solved = isSolved(next);
    if (solved !== null) {
      setStamp(solved);
      setTone("good");
      setNote(puzzle.mode === "guided" ? message : puzzle.insight);
      return;
    }
    const mergeLine = merged ? " Termos parecidos se juntaram num termo só." : "";
    if (after < before) {
      setTone("good");
      setNote(`${message}${mergeLine}`);
      return;
    }
    setTone("idle");
    setNote(`${message} Valeu — a igualdade segurou. Só não chegou mais perto. Desfaz se quiser.${mergeLine}`);
    addStall(puzzle.id);
  }

  function select(side: SideName, index: number) {
    if (stamp !== null || guidedStep) return;
    setSelected((current) =>
      current?.side === side && current.index === index ? null : { side, index },
    );
  }

  function passSelected() {
    if (!selected) return;
    const node = equation[selected.side][selected.index];
    if (!node) return;
    const moved = moveNode(equation, selected.side, selected.index);
    commit(
      moved.eq,
      `Passou ${nodeLabel(node, name)} de lado e o sinal trocou. É tirar dos dois lados, num gesto só.`,
      moved.merged,
    );
  }

  function consult() {
    const level = Math.min(3, hintLevel + 1) as 1 | 2 | 3;
    setHintLevel(level);
    setTone("idle");
    setNote(hintFor(equation, level));
    addHint(puzzle.id);
  }

  function undo() {
    setHistory((stack) => {
      const previous = stack[stack.length - 1];
      if (!previous) return stack;
      setEquation(previous);
      setSelected(null);
      setStamp(null);
      setTone("idle");
      setNote("Voltou um gesto.");
      return stack.slice(0, -1);
    });
  }

  function testGuess() {
    const value = readNumber(guess);
    if (value === null) {
      setTone("miss");
      setNote("Escolhe um número para colocar no lugar da letra.");
      return;
    }
    const left = evalSide(equation.L, value);
    const right = evalSide(equation.R, value);
    if (left === right) {
      setTone("good");
      setNote(
        stamp !== null
          ? `Bateu. ${name} = ${value} equilibra os dois membros.`
          : `Bateu. ${name} = ${value} equilibra os dois membros. Isola mesmo assim — a prova pede o gesto, não só o chute.`,
      );
      return;
    }
    setTone("miss");
    setNote(`Com ${name} = ${value}: esquerda ${left}, direita ${right}. Não é esse.`);
  }

  const selectedNode = selected ? equation[selected.side][selected.index] : undefined;
  const clock = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-1 flex-col">
      <Top title={puzzle.mode === "guided" ? "Os dois lados" : "Isolar"} kicker={puzzle.kicker} onBack={onBack} lamps={lamps} />
      <p className="text-base leading-relaxed">{puzzle.story}</p>
      <p className="mt-3 font-mono text-xs text-faint">Pedido · {formatEquation(puzzle.equation)}</p>
      {timed ? (
        <div className="mt-2 flex items-center justify-between text-xs text-faint">
          <button type="button" className="min-h-11 underline" onClick={() => setShowTime(!showTime)}>
            {showTime ? "Esconder o tempo" : "Mostrar o tempo"}
          </button>
          {showTime ? <span className="font-mono">{clock}</span> : <span>Sem cronômetro.</span>}
        </div>
      ) : null}
      <div className="mt-4 rounded-card bg-bone p-4 text-ink-bone">
        <p className="sr-only">{formatEquation(equation)}</p>
        {stamp !== null ? (
          <div className="calibre-rise py-3 text-center">
            <p className="text-xs font-semibold tracking-widest text-quiet">ISOLADO</p>
            <p className="mt-2 font-mono text-4xl">
              {name} = {stamp}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <SideRow
              label="Esquerda"
              side={equation.L}
              name={name}
              active={selected?.side === "L" ? selected.index : null}
              frozen={Boolean(guidedStep)}
              onSelect={(index) => select("L", index)}
            />
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-bone-2" />
              <span className="font-mono text-xl text-ink-bone">=</span>
              <span className="h-px flex-1 bg-bone-2" />
            </div>
            <SideRow
              label="Direita"
              side={equation.R}
              name={name}
              active={selected?.side === "R" ? selected.index : null}
              frozen={Boolean(guidedStep)}
              onSelect={(index) => select("R", index)}
            />
          </div>
        )}
      </div>
      <div className="mt-4">
        <Whisper tone={tone}>{note}</Whisper>
      </div>
      <div className="mt-auto space-y-3 pt-2">
        {stamp !== null ? (
          <Primary onClick={() => onDone(`${formatEquation(puzzle.equation)} → ${name} = ${stamp}`)}>
            Seguir
          </Primary>
        ) : guidedStep ? (
          <Primary
            onClick={() => {
              const next = applyStep(equation, guidedStep);
              commit(next, guidedStep.why, false);
            }}
          >
            {guidedStep.label}
          </Primary>
        ) : testing ? (
          <>
            <Keypad onKey={(key) => setGuess((current) => pushDigit(current, key))} />
            <p className="text-center font-mono text-2xl">{guess === "" ? "—" : guess}</p>
            <Primary onClick={testGuess}>Testar {name}</Primary>
            <Ghost className="w-full" onClick={() => setTesting(false)}>
              Voltar aos gestos
            </Ghost>
          </>
        ) : (
          <>
            {selectedNode ? (
              <Primary onClick={passSelected}>Passar {nodeLabel(selectedNode, name)} para o outro lado</Primary>
            ) : (
              <p className="text-center text-sm text-faint">Toca um termo para passar de lado.</p>
            )}
            {hasProduct(equation) ? (
              <Primary
                className={selectedNode ? "bg-panel text-bone" : undefined}
                onClick={() =>
                  commit(
                    distribute(equation),
                    "O parêntese abriu. O número de fora multiplicou cada termo de dentro.",
                    false,
                  )
                }
              >
                Abrir parênteses
              </Primary>
            ) : null}
            {divisors(equation).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {divisors(equation).map((divisor) => (
                  <button
                    key={divisor}
                    type="button"
                    className="min-h-11 flex-1 rounded-2xl bg-panel px-3 font-mono text-base text-bone"
                    onClick={() => {
                      const next = tryDivide(equation, divisor);
                      if (!next) return;
                      commit(next, `Os dois lados foram divididos por ${divisor}. A igualdade ficou.`, false);
                    }}
                  >
                    ÷ {divisor}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Ghost onClick={() => commit(scale(equation, -1), "Os dois lados trocaram de sinal. O valor escondido é o mesmo.", false)}>
                Trocar sinais
              </Ghost>
              <Ghost onClick={undo} disabled={history.length === 0}>
                Desfazer
              </Ghost>
              <Ghost onClick={() => setTesting(true)}>Testar um valor</Ghost>
              <Ghost onClick={consult}>Consultar o manual</Ghost>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SideRow({
  label,
  side,
  name,
  active,
  frozen,
  onSelect,
}: {
  label: string;
  side: Equation["L"];
  name: string;
  active: number | null;
  frozen: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-quiet">{label.toUpperCase()}</p>
      <div className="mt-2 flex min-h-12 flex-wrap gap-2">
        {side.length === 0 ? (
          <span className="font-mono text-2xl">0</span>
        ) : (
          side.map((node, index) => {
            const labelText = nodeLabel(node, name);
            if (frozen) {
              return (
                <span key={`${labelText}-${index}`} className="inline-flex min-h-12 items-center rounded-2xl bg-bone-2 px-3 font-mono text-2xl">
                  {labelText}
                </span>
              );
            }
            return (
              <button
                key={`${labelText}-${index}`}
                type="button"
                aria-pressed={active === index}
                onClick={() => onSelect(index)}
                className={cx(
                  "inline-flex min-h-12 items-center rounded-2xl px-3 font-mono text-2xl",
                  active === index ? "bg-amber text-amber-ink" : "bg-bone-2 text-ink-bone",
                )}
              >
                {labelText}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
