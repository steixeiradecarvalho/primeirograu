import {
  eq,
  prod,
  term,
  type Equation,
  type Side,
} from "./algebra.ts";

export type Chip = { id: string; label: string; side: Side };

export type BuildPuzzle = {
  id: string;
  kicker: string;
  story: string;
  prompt: string;
  varName: string;
  target: Side;
  chips: Chip[];
  traps: { side: Side; say: string }[];
  insight: string;
};

export type ValuePuzzle = {
  id: string;
  kicker: string;
  story: string;
  varName: string;
  side: Side;
  value: number;
  prompt: string;
  insight: string;
};

export type GuidedOp =
  | { op: "add"; delta: number; label: string; why: string }
  | { op: "div"; by: number; label: string; why: string };

export type SolvePuzzle = {
  id: string;
  kicker: string;
  story: string;
  equation: Equation;
  expect: number;
  mode: "guided" | "free";
  steps?: GuidedOp[];
  whisper?: string;
  insight: string;
};

export type ModelChoice = {
  id: string;
  equation: Equation;
  ok: boolean;
  say: string;
};

export type ModelPuzzle = {
  id: string;
  kicker: string;
  story: string;
  ask: string;
  choices: ModelChoice[];
  insight: string;
  expect: number;
};

const chip = (id: string, label: string, side: Side): Chip => ({ id, label, side });

export const BUILD: BuildPuzzle[] = [
  {
    id: "servidores",
    kicker: "Leitura · 01",
    story:
      "Cada servidor no ar segura 30 transações por segundo. Há s servidores ligados, e um reserva fixo segura mais 12.",
    prompt: "Monta o total de transações por segundo.",
    varName: "s",
    target: [term(30, 1), term(12, 0)],
    chips: [
      chip("30s", "30s", [term(30, 1)]),
      chip("12", "12", [term(12, 0)]),
      chip("30+s", "30 + s", [term(30, 0), term(1, 1)]),
      chip("12s", "12s", [term(12, 1)]),
      chip("s+12", "s + 12", [term(1, 1), term(12, 0)]),
      chip("42", "42", [term(42, 0)]),
    ],
    traps: [
      {
        side: [term(30, 0), term(1, 1)],
        say: "30 + s seria trinta mais um servidor. A história diz 30 por servidor: isso multiplica.",
      },
      {
        side: [term(1, 1), term(12, 0)],
        say: "Aqui cada servidor contribui 1, não 30. O 30 é o ritmo de cada um.",
      },
    ],
    insight:
      "30s quer dizer 30 por servidor. O 30 é o coeficiente. O 12 não leva letra: é o termo independente, a parte fixa.",
  },
  {
    id: "fila",
    kicker: "Leitura · 02",
    story:
      "Chegaram c pessoas. A fila é o dobro disso. Em seguida, 5 desistem e vão embora.",
    prompt: "Monta a expressão da fila que ficou.",
    varName: "c",
    target: [term(2, 1), term(-5, 0)],
    chips: [
      chip("2c", "2c", [term(2, 1)]),
      chip("-5", "-5", [term(-5, 0)]),
      chip("2+c", "2 + c", [term(2, 0), term(1, 1)]),
      chip("pack", "2(c - 5)", [prod(2, [term(1, 1), term(-5, 0)])]),
      chip("5c", "5c", [term(5, 1)]),
      chip("c-5", "c - 5", [term(1, 1), term(-5, 0)]),
    ],
    traps: [
      {
        side: [prod(2, [term(1, 1), term(-5, 0)])],
        say: "2(c − 5) seria se as 5 tivessem saído antes de dobrar. Na história, primeiro dobra, depois saem 5.",
      },
      {
        side: [term(2, 0), term(1, 1)],
        say: "Dobro é multiplicar por 2, não somar 2.",
      },
      {
        side: [term(1, 1), term(-5, 0)],
        say: "O dobro ficou de fora. c − 5 é a fila sem duplicar.",
      },
    ],
    insight: "Dobro é ×2. O −5 acontece depois, então fica fora do parêntese: 2c − 5.",
  },
  {
    id: "caixas",
    kicker: "Leitura · 03",
    story: "São 3 caixas iguais. Em cada uma, p pacotes e mais 2 de reserva.",
    prompt: "Monta o total de pacotes.",
    varName: "p",
    target: [prod(3, [term(1, 1), term(2, 0)])],
    chips: [
      chip("pack", "3(p + 2)", [prod(3, [term(1, 1), term(2, 0)])]),
      chip("open", "3p + 6", [term(3, 1), term(6, 0)]),
      chip("short", "3p + 2", [term(3, 1), term(2, 0)]),
      chip("p2", "p + 2", [term(1, 1), term(2, 0)]),
      chip("3p", "3p", [term(3, 1)]),
      chip("6", "6", [term(6, 0)]),
    ],
    traps: [
      {
        side: [term(3, 1), term(2, 0)],
        say: "3p + 2 conta a reserva uma vez só. São 2 em cada caixa, e as caixas são 3.",
      },
      {
        side: [term(1, 1), term(2, 0)],
        say: "Isso é o conteúdo de uma caixa. A história tem três delas.",
      },
    ],
    insight:
      "O parêntese é o conteúdo de uma caixa. O 3 multiplica a caixa inteira. 3(p + 2) e 3p + 6 são a mesma quantidade — uma fechada, outra aberta.",
  },
];

export const VALUE: ValuePuzzle[] = [
  {
    id: "val-s",
    kicker: "Substituição · 01",
    story: "A expressão dos servidores era 30s + 12. Subiram 4 servidores.",
    varName: "s",
    side: [term(30, 1), term(12, 0)],
    value: 4,
    prompt: "Quanto vale a expressão se s = 4?",
    insight: "Onde estava s, entrou 4. 30 × 4 + 12. A letra nunca foi mistério: era um lugar esperando número.",
  },
  {
    id: "val-p",
    kicker: "Substituição · 02",
    story: "Cada caixa tem p + 2, e são 3 caixas. Agora p = 5.",
    varName: "p",
    side: [prod(3, [term(1, 1), term(2, 0)])],
    value: 5,
    prompt: "Quanto vale 3(p + 2) se p = 5?",
    insight: "Primeiro o de dentro: 5 + 2 = 7. Depois o de fora: 3 × 7. O parêntese manda a ordem.",
  },
];

export const SOLVE: SolvePuzzle[] = [
  {
    id: "g-n",
    kicker: "Dois lados · 01",
    story: "A fila: n pessoas, mais 9 atrasados, fecham 21. Acha n.",
    equation: eq("n", [term(1, 1), term(9, 0)], [term(21, 0)]),
    expect: 12,
    mode: "guided",
    steps: [
      {
        op: "add",
        delta: -9,
        label: "Tirar 9 dos dois lados",
        why: "Saíram 9 dos dois membros. 21 virou 12. O n ficou só. A igualdade não se mexeu.",
      },
    ],
    insight: "Tirar o mesmo número dos dois lados não muda a incógnita. Só limpa o que estava em volta.",
  },
  {
    id: "g-t",
    kicker: "Dois lados · 02",
    story: "4 terminais iguais processam 28 operações no minuto. Quanto cabe em cada um?",
    equation: eq("t", [term(4, 1)], [term(28, 0)]),
    expect: 7,
    mode: "guided",
    steps: [
      {
        op: "div",
        by: 4,
        label: "Dividir os dois lados por 4",
        why: "Quatro iguais dão 28, então um é 28 ÷ 4. Os dois lados encolhem juntos.",
      },
    ],
    insight: "Dividir os dois lados pelo coeficiente é o princípio multiplicativo. O t não muda de valor.",
  },
  {
    id: "f-2x",
    kicker: "Dois lados · 03",
    story: "Dois lotes de x, mais 6 fixos, fecham 20. Desta vez o gesto é teu.",
    equation: eq("x", [term(2, 1), term(6, 0)], [term(20, 0)]),
    expect: 7,
    mode: "free",
    whisper:
      "O 6 não tem letra. Pode passar para o outro lado — o sinal troca — ou sair dos dois lados. É o mesmo gesto. Depois divide por 2.",
    insight: "Primeiro separa o que tem letra do que não tem. Depois divide. Dois gestos, uma igualdade.",
  },
  {
    id: "i-minus",
    kicker: "Isolar · 01",
    story: "O atraso era x minutos. Já se recuperaram 8, e ainda restam 13.",
    equation: eq("x", [term(1, 1), term(-8, 0)], [term(13, 0)]),
    expect: 21,
    mode: "free",
    whisper: "",
    insight: "Passar um termo negativo é somar esse valor dos dois lados. O sinal troca na passagem.",
  },
  {
    id: "i-axb",
    kicker: "Isolar · 02",
    story: "Três ciclos de x, mais 4 de aquecimento, fecham 19.",
    equation: eq("x", [term(3, 1), term(4, 0)], [term(19, 0)]),
    expect: 5,
    mode: "free",
    whisper: "",
    insight: "Forma da escola: ax + b = c. Tira o b, divide pelo a.",
  },
  {
    id: "i-paren",
    kicker: "Isolar · 03",
    story: "Duas baias. Em cada uma, x máquinas e 5 reservas. Juntas, 24 máquinas.",
    equation: eq("x", [prod(2, [term(1, 1), term(5, 0)])], [term(24, 0)]),
    expect: 7,
    mode: "free",
    whisper: "Dá para abrir o parêntese. Dá para dividir os dois lados por 2. Os dois caminhos chegam.",
    insight: "Parêntese é um pacote. Abre, ou divide o pacote inteiro. A incógnita é a mesma.",
  },
  {
    id: "i-both",
    kicker: "Isolar · 04",
    story:
      "A linha da esquerda tem 4x + 3. A da direita, 2x + 15. As duas empatam. Este é o ponto em que a matéria costuma parecer outra. Não é.",
    equation: eq("x", [term(4, 1), term(3, 0)], [term(2, 1), term(15, 0)]),
    expect: 6,
    mode: "free",
    whisper: "Tem letra dos dois lados. Passa as letras para um lado e os números para o outro. Mesma regra de sempre.",
    insight:
      "Nada de capítulo novo. O x da direita, ao passar, troca de sinal e se junta ao x da esquerda. Termos parecidos.",
  },
];

export const STATION_GUIDED = 3;

export const MODEL: ModelPuzzle = {
  id: "agencia",
  kicker: "Turno da agência",
  story:
    "A linha precisa de 160 operações por minuto. Cada terminal novo faz 15. Os antigos, juntos, já entregam 40 — e isso não muda quando você liga mais um novo.",
  ask: "Qual equação descreve quantos terminais novos, n, a linha precisa?",
  choices: [
    {
      id: "ok",
      equation: eq("n", [term(15, 1), term(40, 0)], [term(160, 0)]),
      ok: true,
      say: "15 por novo, mais 40 que já existem, igual à meta. A letra está no que varia.",
    },
    {
      id: "four",
      equation: eq("n", [term(15, 1), term(4, 0)], [term(160, 0)]),
      ok: false,
      say: "O 4 não é a produção. Os antigos produzem 40, não 4. Quantidade de máquinas e ritmo não são o mesmo número.",
    },
    {
      id: "flip",
      equation: eq("n", [term(40, 1), term(15, 0)], [term(160, 0)]),
      ok: false,
      say: "Aqui o 40 ficou multiplicando o que a gente não sabe. Quem varia é o número de novos, e cada um vale 15.",
    },
  ],
  insight: "Traduzir o texto é metade do trabalho. Isolar, você já sabe.",
  expect: 8,
};

export const MODEL_2: ModelPuzzle = {
  id: "desistencias",
  kicker: "Segundo chamado",
  story: "O dobro da fila, menos 6 desistências, deixa 18 pessoas.",
  ask: "Qual equação acha a fila f?",
  choices: [
    {
      id: "ok",
      equation: eq("f", [term(2, 1), term(-6, 0)], [term(18, 0)]),
      ok: true,
      say: "Dobro da fila, depois tira 6. 2f − 6 = 18.",
    },
    {
      id: "plus",
      equation: eq("f", [term(2, 1), term(6, 0)], [term(18, 0)]),
      ok: false,
      say: "Desistir é sair da fila: menos, não mais.",
    },
    {
      id: "nodouble",
      equation: eq("f", [term(1, 1), term(-6, 0)], [term(18, 0)]),
      ok: false,
      say: "O dobro sumiu. Sem o 2, a fila ficou pela metade do que a história disse.",
    },
  ],
  insight: "O texto diz a ordem: primeiro o dobro, depois a saída.",
  expect: 12,
};

export type ExtraSpec = { seed: number; equation: Equation; expect: number };

export function extraPuzzle(seed: number): ExtraSpec {
  const hands: ExtraSpec[] = [
    { seed: 0, equation: eq("x", [term(2, 1), term(1, 0)], [term(11, 0)]), expect: 5 },
    { seed: 1, equation: eq("x", [term(6, 1)], [term(42, 0)]), expect: 7 },
    { seed: 2, equation: eq("x", [term(1, 1), term(14, 0)], [term(20, 0)]), expect: 6 },
    { seed: 3, equation: eq("x", [term(5, 1), term(-5, 0)], [term(20, 0)]), expect: 5 },
    { seed: 4, equation: eq("x", [term(3, 1), term(2, 0)], [term(1, 1), term(12, 0)]), expect: 5 },
    { seed: 5, equation: eq("x", [prod(2, [term(1, 1), term(4, 0)])], [term(18, 0)]), expect: 5 },
  ];
  if (seed < hands.length) return { ...hands[seed]!, seed };
  const a = 2 + (seed % 7);
  const x = (seed % 11) - 2;
  const b = (seed % 9) - 3;
  const c = a * x + b;
  if (seed % 4 === 0 && a >= 4) {
    const k = 1 + (seed % (a - 1));
    return {
      seed,
      expect: x,
      equation: eq("x", [term(a - k, 1), term(b, 0)], [term(-k, 1), term(c, 0)]),
    };
  }
  if (seed % 5 === 0) {
    return {
      seed,
      expect: x,
      equation: eq("x", [prod(2, [term(1, 1), term(b, 0)])], [term(2 * x + 2 * b, 0)]),
    };
  }
  return {
    seed,
    expect: x,
    equation: eq("x", [term(a, 1), term(b, 0)], [term(c, 0)]),
  };
}

export const MANUAL = {
  title: "Como a linha funciona",
  lede: "Um turno curto. Dá para sair no meio. Quando você volta, a linha está no mesmo ponto.",
  blocks: [
    {
      h: "Expressão não é equação",
      p: "Expressão é uma conta com um lugar vazio: 30s + 12. Equação é quando essa conta vale a mesma coisa que o outro lado. O igual não é “a resposta vem depois”. É uma balança.",
    },
    {
      h: "O que tem nome",
      p: "A letra é a incógnita: o que a linha ainda não mediu. Em 30s, o 30 é o coeficiente — o ritmo de cada um. O 12 não tem letra: é o termo independente, a parte que não muda.",
    },
    {
      h: "O gesto, dos dois lados",
      p: "Pode somar, tirar ou dividir, se fizer a mesma coisa nos dois membros. Passar um termo para o outro lado é esse gesto, de uma vez. O sinal troca porque o termo saiu e foi compensado.",
    },
    {
      h: "Errar aqui é barato",
      p: "Uma jogada que preserva a igualdade continua valendo, mesmo se não chegar mais perto. Dá para desfazer. Consultar o manual não custa ponto. Testar um valor mostra se os dois lados batem.",
    },
    {
      h: "Sem nota e sem pressa",
      p: "Não tem vida perdida nem ranking. A hora extra é só traquejo, sem história nova. O relógio só aparece se você pedir.",
    },
  ],
};


