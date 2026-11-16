export type Simple = { k: "t"; c: number; v: 0 | 1 };
export type Product = { k: "p"; m: number; inner: Simple[] };
export type Node = Simple | Product;
export type Side = Node[];
export type SideName = "L" | "R";

export type Equation = {
  varName: string;
  L: Side;
  R: Side;
};

export const term = (c: number, v: 0 | 1 = 0): Simple => ({ k: "t", c, v });
export const prod = (m: number, inner: Simple[]): Product => ({ k: "p", m, inner });

export function eq(varName: string, L: Side, R: Side): Equation {
  return normalizeEq({ varName, L, R });
}

function combine(terms: Simple[]): Simple[] {
  let vc = 0;
  let cc = 0;
  for (const t of terms) {
    if (t.v === 1) vc += t.c;
    else cc += t.c;
  }
  const out: Simple[] = [];
  if (vc !== 0) out.push(term(vc, 1));
  if (cc !== 0) out.push(term(cc, 0));
  return out;
}

export function normalizeSide(side: Side): Side {
  const products: Product[] = [];
  const simples: Simple[] = [];
  for (const n of side) {
    if (n.k === "t") simples.push(n);
    else products.push(n);
  }
  let combined = combine(simples);
  const kept: Product[] = [];
  for (const p of products) {
    if (p.m === 0) continue;
    const inner = combine(p.inner.map((t) => ({ ...t })));
    if (inner.length === 0) continue;
    if (p.m === 1) {
      combined = combine([...combined, ...inner]);
      continue;
    }
    kept.push({ k: "p", m: p.m, inner });
  }
  const out: Node[] = [...kept];
  const v = combined.find((t) => t.v === 1);
  const c = combined.find((t) => t.v === 0);
  if (v) out.push(v);
  if (c) out.push(c);
  return out;
}

export function normalizeEq(equation: Equation): Equation {
  return {
    varName: equation.varName,
    L: normalizeSide(equation.L),
    R: normalizeSide(equation.R),
  };
}

export function expand(side: Side): Simple[] {
  const raw: Simple[] = [];
  for (const n of side) {
    if (n.k === "t") raw.push({ ...n });
    else for (const t of n.inner) raw.push(term(n.m * t.c, t.v));
  }
  return combine(raw);
}

export function coeff(simples: Simple[], v: 0 | 1): number {
  return simples.find((t) => t.v === v)?.c ?? 0;
}

function formatAbsSimple(t: Simple, name: string): string {
  if (t.v === 0) return String(Math.abs(t.c));
  const a = Math.abs(t.c);
  if (a === 1) return name;
  return `${a}${name}`;
}

function formatNode(n: Node, name: string): string {
  if (n.k === "t") {
    const body = formatAbsSimple(n, name);
    return n.c < 0 ? `-${body}` : body;
  }
  const inner = formatExpr(n.inner, name);
  const abs = Math.abs(n.m);
  const body = abs === 1 ? `(${inner})` : `${abs}(${inner})`;
  return n.m < 0 ? `-${body}` : body;
}

export function formatExpr(side: Side, name: string): string {
  const nodes = normalizeSide(side);
  if (nodes.length === 0) return "0";
  let out = "";
  nodes.forEach((node, i) => {
    const piece = formatNode(node, name);
    if (i === 0) {
      out = piece;
      return;
    }
    if (piece.startsWith("-")) out += ` - ${piece.slice(1)}`;
    else out += ` + ${piece}`;
  });
  return out;
}

export function formatEquation(equation: Equation): string {
  return `${formatExpr(equation.L, equation.varName)} = ${formatExpr(equation.R, equation.varName)}`;
}

export function nodeLabel(n: Node, name: string): string {
  return formatNode(n, name);
}

function negateNode(n: Node): Node {
  if (n.k === "t") return term(-n.c, n.v);
  return prod(-n.m, n.inner.map((t) => ({ ...t })));
}

export type OpResult = { eq: Equation; merged: boolean };

function countKinds(side: Side): { vars: number; consts: number } {
  let vars = 0;
  let consts = 0;
  for (const n of side) {
    if (n.k === "t") {
      if (n.c === 0) continue;
      if (n.v === 1) vars += 1;
      else consts += 1;
    }
  }
  return { vars, consts };
}

export function addConstBoth(equation: Equation, delta: number): OpResult {
  if (delta === 0) return { eq: equation, merged: false };
  const L = [...equation.L, term(delta, 0)];
  const R = [...equation.R, term(delta, 0)];
  const merged = countKinds(L).consts > 1 || countKinds(R).consts > 1;
  return { eq: normalizeEq({ ...equation, L, R }), merged };
}

export function moveNode(equation: Equation, from: SideName, index: number): OpResult {
  const source = from === "L" ? equation.L : equation.R;
  const node = source[index];
  if (!node) return { eq: equation, merged: false };
  const rest = source.filter((_, i) => i !== index);
  const dest = from === "L" ? equation.R : equation.L;
  const nextDest = [...dest, negateNode(node)];
  const kinds = countKinds(nextDest);
  const merged = kinds.vars > 1 || kinds.consts > 1;
  const L = from === "L" ? rest : nextDest;
  const R = from === "L" ? nextDest : rest;
  return { eq: normalizeEq({ ...equation, L, R }), merged };
}

export function distribute(equation: Equation): Equation {
  const open = (side: Side): Side => {
    const out: Node[] = [];
    for (const n of side) {
      if (n.k === "t") out.push(n);
      else for (const t of n.inner) out.push(term(n.m * t.c, t.v));
    }
    return out;
  };
  return normalizeEq({ ...equation, L: open(equation.L), R: open(equation.R) });
}

export function scale(equation: Equation, factor: number): Equation {
  if (!Number.isInteger(factor) || factor === 0 || factor === 1) return equation;
  const map = (side: Side): Side =>
    side.map((n) => (n.k === "t" ? term(n.c * factor, n.v) : prod(n.m * factor, n.inner)));
  return normalizeEq({ ...equation, L: map(equation.L), R: map(equation.R) });
}

function outerCoeffs(equation: Equation): number[] {
  const coeffs: number[] = [];
  for (const n of [...equation.L, ...equation.R]) {
    if (n.k === "t") coeffs.push(n.c);
    else coeffs.push(n.m);
  }
  return coeffs.filter((c) => c !== 0);
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function canDivide(equation: Equation, divisor: number): boolean {
  if (!Number.isInteger(divisor) || divisor <= 1) return false;
  const coeffs = outerCoeffs(equation);
  if (coeffs.length === 0) return false;
  return coeffs.every((c) => c % divisor === 0);
}

export function tryDivide(equation: Equation, divisor: number): Equation | null {
  if (!canDivide(equation, divisor)) return null;
  const map = (side: Side): Side =>
    side.map((n) =>
      n.k === "t" ? term(Math.trunc(n.c / divisor), n.v) : prod(Math.trunc(n.m / divisor), n.inner),
    );
  return normalizeEq({ ...equation, L: map(equation.L), R: map(equation.R) });
}

export function divisors(equation: Equation): number[] {
  const coeffs = outerCoeffs(equation);
  if (coeffs.length === 0) return [];
  let g = Math.abs(coeffs[0]!);
  for (const c of coeffs.slice(1)) g = gcd(g, c);
  if (g <= 1) return [];
  const out: number[] = [];
  for (let d = 2; d <= g; d += 1) {
    if (g % d === 0) out.push(d);
  }
  return out;
}

export function isSolved(equation: Equation): number | null {
  const L = normalizeSide(equation.L);
  const R = normalizeSide(equation.R);
  const isolated = (alone: Side, other: Side): number | null => {
    if (alone.length !== 1) return null;
    const head = alone[0]!;
    if (head.k !== "t" || head.v !== 1 || head.c !== 1) return null;
    if (other.length === 0) return 0;
    if (other.length === 1 && other[0]!.k === "t" && other[0]!.v === 0) return other[0]!.c;
    return null;
  };
  return isolated(L, R) ?? isolated(R, L);
}

export function progressScore(equation: Equation): number {
  if (isSolved(equation) !== null) return 0;
  const products = [...equation.L, ...equation.R].filter((n) => n.k === "p").length;
  const Le = expand(equation.L);
  const Re = expand(equation.R);
  const cL = coeff(Le, 1);
  const cR = coeff(Re, 1);
  const kL = coeff(Le, 0);
  const kR = coeff(Re, 0);
  const orientL = Math.abs(cL - 1) + Math.abs(cR) + Math.abs(kL);
  const orientR = Math.abs(cR - 1) + Math.abs(cL) + Math.abs(kR);
  return Math.min(orientL, orientR) + products * 4;
}

export function evalSide(side: Side, value: number): number {
  return expand(side).reduce((sum, t) => sum + t.c * (t.v ? value : 1), 0);
}

export function identical(a: Side, b: Side): boolean {
  const da = expand(a);
  const db = expand(b);
  return coeff(da, 1) === coeff(db, 1) && coeff(da, 0) === coeff(db, 0);
}

export function hasProduct(equation: Equation): boolean {
  return [...equation.L, ...equation.R].some((n) => n.k === "p");
}

export function hintFor(equation: Equation, level: 1 | 2 | 3): string {
  const name = equation.varName;
  const product = [...equation.L, ...equation.R].find((n) => n.k === "p");
  if (product && product.k === "p") {
    if (level === 1) return `Tem um pacote: ${nodeLabel(product, name)}. O parêntese ainda não foi aberto.`;
    if (level === 2) {
      return "Dois caminhos válidos: abrir o parêntese, ou dividir os dois lados pelo número de fora.";
    }
    return `Manual: “Abrir parênteses”, ou ÷ ${Math.abs(product.m)} dos dois lados.`;
  }

  const cL = coeff(expand(equation.L), 1);
  const cR = coeff(expand(equation.R), 1);
  const kL = coeff(expand(equation.L), 0);
  const kR = coeff(expand(equation.R), 0);

  if (cL !== 0 && cR !== 0) {
    const side: SideName = Math.abs(cL) <= Math.abs(cR) ? "L" : "R";
    const coeffOnSide = side === "L" ? cL : cR;
    const piece = formatExpr([term(coeffOnSide, 1)], name);
    if (level === 1) return `O ${name} está nos dois membros. Ainda não dá para ler o valor.`;
    if (level === 2) return `Passa um termo com ${name} para o outro lado. O sinal troca. Os parecidos se juntam.`;
    return `Passa ${piece} para o outro lado.`;
  }

  const varOnLeft = cL !== 0;
  const c = varOnLeft ? cL : cR;
  const k = varOnLeft ? kL : kR;

  if (k !== 0) {
    const piece = formatExpr([term(k, 0)], name);
    if (level === 1) {
      return `No mesmo lado do ${name} tem um número sem letra. Ele ainda está grudado.`;
    }
    if (level === 2) return "Passa esse número para o outro lado. O sinal troca. É o mesmo que tirar dos dois lados.";
    return `Passa ${piece} para o outro lado.`;
  }

  if (c === -1) {
    if (level === 1) return `O ${name} está sozinho, mas com sinal trocado.`;
    return "Troca o sinal dos dois lados. O valor escondido não muda.";
  }

  if (c !== 1 && c !== 0) {
    if (level === 1) return `O ${name} está multiplicado por ${c}.`;
    if (level === 2) return `Divide os dois lados por ${Math.abs(c)}.`;
    return `Usa ÷ ${Math.abs(c)} dos dois lados.`;
  }

  return "Quase. Olha o que ainda está no mesmo lado da letra.";
}

export function valueMiss(side: Side, name: string, x: number, answer: number): string {
  const right = evalSide(side, x);
  if (answer === right) return "";
  const expanded = expand(side);
  const c = coeff(expanded, 1);
  const k = coeff(expanded, 0);
  if (c !== 0 && answer === c + x + k) {
    return `O ${c} não soma com ${name}. Ele multiplica: ${c} × ${x} = ${c * x}.`;
  }
  if (c !== 0 && answer === c * x) {
    const fixed = k < 0 ? `− ${Math.abs(k)}` : `+ ${k}`;
    return `Faltou a parte sem letra, o ${fixed}.`;
  }
  if (answer === k) return "Isso é só a parte fixa. O termo com a letra também entra na conta.";
  const product = side.find((n) => n.k === "p");
  if (product && product.k === "p") {
    const iv = coeff(product.inner, 1);
    const ik = coeff(product.inner, 0);
    if (answer === product.m * iv * x + ik) {
      const inside = iv * x + ik;
      return `O de dentro também se multiplica. O parêntese vale ${inside}, e aí sim entra o ${product.m}.`;
    }
  }
  return `Não fechou. Onde está ${name}, coloca ${x} e refaz um pedaço por vez. O resultado certo ainda não é esse.`;
}
