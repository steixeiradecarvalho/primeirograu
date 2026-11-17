import { useEffect, useState } from "react";
import { extraPuzzle, BUILD, SOLVE, STATION_GUIDED, VALUE, type SolvePuzzle } from "@/lib/calibre/content";
import { lineState, useCalibre } from "@/lib/calibre/store";
import { BuildRound } from "./BuildRound";
import { ModelRound } from "./ModelRound";
import { SolveRound } from "./SolveRound";
import { ValueRound } from "./ValueRound";
import { Ghost, Manual, Primary, Top } from "./ui";

export function CalibreApp() {
  const hydrate = useCalibre((s) => s.hydrate);
  const screen = useCalibre((s) => s.screen);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const atGate = screen.t === "gate";

  return (
    <div
      className={
        atGate
          ? "min-h-dvh bg-ink text-bone"
          : "min-h-dvh bg-ink text-bone lg:grid lg:grid-cols-[minmax(0,40rem)_minmax(18rem,1fr)]"
      }
    >
      <main
        className={
          atGate
            ? "mx-auto flex min-h-dvh w-full min-w-0 max-w-xl flex-col overflow-x-hidden px-5 py-6 sm:px-8"
            : "flex min-h-dvh w-full min-w-0 flex-col overflow-x-hidden px-5 py-6 sm:px-8 lg:px-10"
        }
      >
        <ScreenBody screen={screen} />
      </main>
      {atGate ? null : (
        <aside className="hidden bg-ink lg:block">
          <div className="sticky top-0 flex max-h-dvh flex-col gap-4 overflow-auto p-8">
            <Manual />
          </div>
        </aside>
      )}
    </div>
  );
}

function ScreenBody({ screen }: { screen: ReturnType<typeof useCalibre.getState>["screen"] }) {
  const progress = useCalibre();
  const lamps = lineState(progress);
  const setScreen = progress.setScreen;

  if (screen.t === "gate") return <Gate />;
  if (screen.t === "note") {
    return (
      <div className="flex flex-1 flex-col">
        <Top title="A missão" onBack={() => setScreen(progress.name ? { t: "map" } : { t: "gate" })} />
        <Manual />
      </div>
    );
  }
  if (screen.t === "map") return <Map />;
  if (screen.t === "build") {
    const puzzle = BUILD[screen.i];
    if (!puzzle) return <Map />;
    return (
      <BuildRound
        key={puzzle.id}
        puzzle={puzzle}
        index={screen.i}
        total={BUILD.length}
        lamps={lamps}
        onBack={() => setScreen({ t: "map" })}
        onDone={(line) => {
          const wasFrontier = progress.buildDone === screen.i;
          progress.markBuild(screen.i, line);
          if (screen.i + 1 < BUILD.length) setScreen({ t: "build", i: screen.i + 1 });
          else if (wasFrontier) setScreen({ t: "value", i: 0 });
          else setScreen({ t: "map" });
        }}
      />
    );
  }
  if (screen.t === "value") {
    const puzzle = VALUE[screen.i];
    if (!puzzle) return <Map />;
    return (
      <ValueRound
        key={puzzle.id}
        puzzle={puzzle}
        index={screen.i}
        total={VALUE.length}
        lamps={lamps}
        onBack={() => setScreen({ t: "map" })}
        onDone={(line) => {
          const wasFrontier = progress.valueDone === screen.i;
          progress.markValue(screen.i, line);
          if (screen.i + 1 < VALUE.length) setScreen({ t: "value", i: screen.i + 1 });
          else if (wasFrontier) setScreen({ t: "principle" });
          else setScreen({ t: "map" });
        }}
      />
    );
  }
  if (screen.t === "principle") return <Principle />;
  if (screen.t === "solve") {
    const puzzle = SOLVE[screen.i];
    if (!puzzle) return <Map />;
    return (
      <SolveRound
        key={puzzle.id}
        puzzle={puzzle}
        lamps={lamps}
        onBack={() => setScreen({ t: "map" })}
        onDone={(line) => {
          const wasFrontier = progress.solveDone === screen.i;
          progress.markSolve(screen.i, line);
          if (wasFrontier && screen.i + 1 < SOLVE.length) setScreen({ t: "solve", i: screen.i + 1 });
          else if (wasFrontier) setScreen({ t: "model", which: 1 });
          else if (screen.i + 1 < (screen.i < STATION_GUIDED ? STATION_GUIDED : SOLVE.length)) {
            setScreen({ t: "solve", i: screen.i + 1 });
          } else setScreen({ t: "map" });
        }}
      />
    );
  }
  if (screen.t === "model") {
    return (
      <ModelRound
        key={screen.which}
        which={screen.which}
        lamps={lamps}
        onBack={() => setScreen({ t: "map" })}
        onDone={(line) => {
          progress.markModel(screen.which, line);
          setScreen({ t: "debrief" });
        }}
      />
    );
  }
  if (screen.t === "debrief") return <Debrief />;
  if (screen.t === "extra") return <Extra lamps={lamps} />;
  return <Map />;
}

function Gate() {
  const setName = useCalibre((s) => s.setName);
  const setScreen = useCalibre((s) => s.setScreen);
  const stored = useCalibre((s) => s.name);
  const [name, setLocal] = useState(stored);

  return (
    <div className="flex flex-1 flex-col">
      <Top title="Calibre" kicker="Equações de primeiro grau." />
      <p className="text-base leading-relaxed">Você dimensiona o foguete. Se sair no meio, a missão fica neste aparelho.</p>
      <form
        className="mt-8"
        onSubmit={(event) => {
          event.preventDefault();
          setName(name.trim());
          setScreen({ t: "map" });
        }}
      >
        <label className="block text-sm text-muted" htmlFor="turno-name">
          Seu nome
        </label>
        <input
          id="turno-name"
          value={name}
          onChange={(event) => setLocal(event.target.value)}
          maxLength={24}
          placeholder="Opcional"
          autoComplete="nickname"
          className="mt-2 min-h-12 w-full rounded-card border border-line bg-panel px-4 text-bone outline-none placeholder:text-faint"
        />
        <div className="mt-4">
          <Primary type="submit">Começar</Primary>
        </div>
      </form>
    </div>
  );
}

function Map() {
  const progress = useCalibre();
  const [armReset, setArmReset] = useState(false);
  const lamps = lineState(progress);
  const buildOpen = true;
  const valueOpen = progress.buildDone >= BUILD.length;
  const balanceOpen = progress.valueDone >= VALUE.length;
  const isolateOpen = progress.solveDone >= STATION_GUIDED;
  const modelOpen = progress.solveDone >= SOLVE.length;
  const extraOpen = progress.solveDone >= STATION_GUIDED;

  const stations = [
    {
      title: "Leitura",
      detail: "Montar a expressão que a história pede.",
      open: buildOpen,
      done: progress.buildDone >= BUILD.length,
      go: () => progress.setScreen({ t: "build", i: progress.buildDone >= BUILD.length ? 0 : progress.buildDone }),
    },
    {
      title: "Substituição",
      detail: "Trocar a letra por um número e calcular.",
      open: valueOpen,
      done: progress.valueDone >= VALUE.length,
      go: () => progress.setScreen({ t: "value", i: progress.valueDone >= VALUE.length ? 0 : progress.valueDone }),
    },
    {
      title: "Os dois lados",
      detail: "Mexer na igualdade sem quebrá-la.",
      open: balanceOpen,
      done: progress.solveDone >= STATION_GUIDED,
      go: () => {
        if (!progress.principle) {
          progress.setScreen({ t: "principle" });
          return;
        }
        const i = progress.solveDone >= STATION_GUIDED ? 0 : progress.solveDone;
        progress.setScreen({ t: "solve", i });
      },
    },
    {
      title: "Isolar",
      detail: "Quatro equações, sem trilho. Inclusive letra dos dois lados.",
      open: isolateOpen,
      done: progress.solveDone >= SOLVE.length,
      go: () => {
        const i = progress.solveDone >= SOLVE.length ? STATION_GUIDED : Math.max(STATION_GUIDED, progress.solveDone);
        progress.setScreen({ t: "solve", i });
      },
    },
    {
      title: "O lançamento",
      detail: "Ler o plano. Só então isolar.",
      open: modelOpen,
      done: progress.modelDone,
      go: () => progress.setScreen({ t: "model", which: 1 }),
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <Top
        title={progress.name ? progress.name : "A missão"}
        kicker="Cinco estações. Uma missão. Sem nota."
        lamps={lamps}
      />
      <div className="space-y-3">
        {stations.map((station, index) => (
          <button
            key={station.title}
            type="button"
            onClick={() => {
              if (!station.open) {
                progress.setMapNote("A estação anterior abre esta. A missão é curta.");
                return;
              }
              progress.setMapNote("");
              station.go();
            }}
            className="flex w-full items-start gap-4 rounded-card border border-line bg-panel px-4 py-4 text-left"
          >
            <span className="mt-0.5 font-mono text-sm text-amber">0{index + 1}</span>
            <span className="min-w-0">
              <span className="block text-base font-semibold">
                {station.title}
                {station.done ? <span className="ml-2 text-sm font-medium text-moss">no plano</span> : null}
                {!station.open ? <span className="ml-2 text-sm font-medium text-faint">fechada</span> : null}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">{station.detail}</span>
            </span>
          </button>
        ))}
      </div>
      {progress.notebook.length > 0 ? (
        <div className="mt-5 rounded-card border border-line bg-panel px-4 py-3">
          <p className="text-xs font-semibold tracking-widest text-amber">FOLHA</p>
          <ul className="mt-2 space-y-1 font-mono text-sm text-bone">
            {progress.notebook.slice(-3).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {progress.mapNote ? (
        <p className="mt-4 text-sm text-clay" aria-live="polite">
          {progress.mapNote}
        </p>
      ) : (
        <p className="mt-4 text-sm text-faint">Sai no meio se quiser. Quando voltar, a missão está onde você deixou.</p>
      )}
      <div className="mt-6 flex flex-col">
        {extraOpen ? (
          <Ghost className="w-full justify-start" onClick={() => progress.setScreen({ t: "extra" })}>
            Hora extra · traquejo sem história
            {progress.extraSolved > 0 ? ` · ${progress.extraSolved}` : ""}
          </Ghost>
        ) : null}
        {progress.modelDone ? (
          <Ghost className="w-full justify-start" onClick={() => progress.setScreen({ t: "debrief" })}>
            Folha da missão
          </Ghost>
        ) : null}
        <Ghost className="w-full justify-start" onClick={() => progress.setScreen({ t: "note" })}>
          Como a missão conta
        </Ghost>
        <Ghost
          className="w-full justify-start"
          onClick={() => {
            if (!armReset) {
              setArmReset(true);
              return;
            }
            progress.reset();
            setArmReset(false);
          }}
        >
          {armReset ? "Confirmar: zerar a missão" : "Recomeçar a missão"}
        </Ghost>
      </div>
    </div>
  );
}

function Principle() {
  const markPrinciple = useCalibre((s) => s.markPrinciple);
  const setScreen = useCalibre((s) => s.setScreen);
  return (
    <div className="flex flex-1 flex-col">
      <Top title="O sinal de igual" kicker="Antes de mexer" onBack={() => setScreen({ t: "map" })} />
      <div className="space-y-4 text-base leading-relaxed">
        <p>Uma expressão é uma conta com um lugar vazio. 30s + 12 ainda não é uma pergunta.</p>
        <p>
          Uma equação diz: esta conta vale este número. Os dois lados se chamam membros. Esquerdo e direito.
        </p>
        <p>A letra é a incógnita — o valor que a missão ainda não mediu. Na escola o nome é esse. Aqui também.</p>
        <p>
          Você pode mudar a equação se fizer a mesma coisa nos dois membros. Tirar 9 dos dois. Dividir os dois por
          4. A incógnita não muda. Só fica mais fácil de ver.
        </p>
        <p>
          Passar um termo para o outro lado é esse gesto, feito de uma vez. O sinal troca porque o termo saiu de
          um membro e foi compensado no outro.
        </p>
      </div>
      <div className="mt-auto pt-8">
        <Primary
          onClick={() => {
            markPrinciple();
            setScreen({ t: "solve", i: 0 });
          }}
        >
          Ver isso no foguete
        </Primary>
      </div>
    </div>
  );
}

function Debrief() {
  const progress = useCalibre();
  const lamps = lineState(progress);
  return (
    <div className="flex flex-1 flex-col">
      <Top
        title="Plano fechado"
        kicker={progress.name ? progress.name : "Missão"}
        onBack={() => progress.setScreen({ t: "map" })}
        lamps={lamps}
      />
      <p className="text-base leading-relaxed">A folha ficou com o que você isolou.</p>
      {progress.notebook.length > 0 ? (
        <div className="mt-5 rounded-card bg-bone p-4 text-ink-bone">
          <p className="text-xs font-semibold tracking-widest text-quiet">FOLHA DA MISSÃO</p>
          <ul className="mt-3 space-y-2 font-mono text-sm leading-relaxed">
            {progress.notebook.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-auto space-y-2 pt-6">
        {!progress.model2Done ? (
          <Primary onClick={() => progress.setScreen({ t: "model", which: 2 })}>Segundo chamado</Primary>
        ) : (
          <Primary onClick={() => progress.setScreen({ t: "extra" })}>Ficar mais um pouco</Primary>
        )}
        <Ghost className="w-full" onClick={() => progress.setScreen({ t: "map" })}>
          Voltar à missão
        </Ghost>
        {progress.model2Done ? null : (
          <Ghost className="w-full" onClick={() => progress.setScreen({ t: "extra" })}>
            Hora extra, sem história
          </Ghost>
        )}
      </div>
    </div>
  );
}

function Extra({ lamps }: { lamps: { lit: number; active: number } }) {
  const extraSolved = useCalibre((s) => s.extraSolved);
  const addExtra = useCalibre((s) => s.addExtra);
  const setScreen = useCalibre((s) => s.setScreen);
  const spec = extraPuzzle(extraSolved);
  const puzzle: SolvePuzzle = {
    id: `extra-${spec.seed}`,
    kicker: "Hora extra",
    story: "Sem narrativa nova. Só o gesto, até a letra ficar sozinha. Sai quando quiser.",
    equation: spec.equation,
    expect: spec.expect,
    mode: "free",
    insight: "Traquejo. O próximo não cobra nota.",
  };
  return (
    <SolveRound
      key={spec.seed}
      puzzle={puzzle}
      lamps={lamps}
      timed
      onBack={() => setScreen({ t: "map" })}
      onDone={(line) => addExtra(line)}
    />
  );
}
