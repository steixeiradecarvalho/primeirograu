import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as ArrowLeft } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C-8wP2QL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var term = (c, v = 0) => ({
	k: "t",
	c,
	v
});
var prod = (m, inner) => ({
	k: "p",
	m,
	inner
});
function eq(varName, L, R) {
	return normalizeEq({
		varName,
		L,
		R
	});
}
function combine(terms) {
	let vc = 0;
	let cc = 0;
	for (const t of terms) if (t.v === 1) vc += t.c;
	else cc += t.c;
	const out = [];
	if (vc !== 0) out.push(term(vc, 1));
	if (cc !== 0) out.push(term(cc, 0));
	return out;
}
function normalizeSide(side) {
	const products = [];
	const simples = [];
	for (const n of side) if (n.k === "t") simples.push(n);
	else products.push(n);
	let combined = combine(simples);
	const kept = [];
	for (const p of products) {
		if (p.m === 0) continue;
		const inner = combine(p.inner.map((t) => ({ ...t })));
		if (inner.length === 0) continue;
		if (p.m === 1) {
			combined = combine([...combined, ...inner]);
			continue;
		}
		kept.push({
			k: "p",
			m: p.m,
			inner
		});
	}
	const out = [...kept];
	const v = combined.find((t) => t.v === 1);
	const c = combined.find((t) => t.v === 0);
	if (v) out.push(v);
	if (c) out.push(c);
	return out;
}
function normalizeEq(equation) {
	return {
		varName: equation.varName,
		L: normalizeSide(equation.L),
		R: normalizeSide(equation.R)
	};
}
function expand(side) {
	const raw = [];
	for (const n of side) if (n.k === "t") raw.push({ ...n });
	else for (const t of n.inner) raw.push(term(n.m * t.c, t.v));
	return combine(raw);
}
function coeff(simples, v) {
	return simples.find((t) => t.v === v)?.c ?? 0;
}
function formatAbsSimple(t, name) {
	if (t.v === 0) return String(Math.abs(t.c));
	const a = Math.abs(t.c);
	if (a === 1) return name;
	return `${a}${name}`;
}
function formatNode(n, name) {
	if (n.k === "t") {
		const body = formatAbsSimple(n, name);
		return n.c < 0 ? `-${body}` : body;
	}
	const inner = formatExpr(n.inner, name);
	const abs = Math.abs(n.m);
	const body = abs === 1 ? `(${inner})` : `${abs}(${inner})`;
	return n.m < 0 ? `-${body}` : body;
}
function formatExpr(side, name) {
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
function formatEquation(equation) {
	return `${formatExpr(equation.L, equation.varName)} = ${formatExpr(equation.R, equation.varName)}`;
}
function nodeLabel(n, name) {
	return formatNode(n, name);
}
function negateNode(n) {
	if (n.k === "t") return term(-n.c, n.v);
	return prod(-n.m, n.inner.map((t) => ({ ...t })));
}
function countKinds(side) {
	let vars = 0;
	let consts = 0;
	for (const n of side) if (n.k === "t") {
		if (n.c === 0) continue;
		if (n.v === 1) vars += 1;
		else consts += 1;
	}
	return {
		vars,
		consts
	};
}
function addConstBoth(equation, delta) {
	if (delta === 0) return {
		eq: equation,
		merged: false
	};
	const L = [...equation.L, term(delta, 0)];
	const R = [...equation.R, term(delta, 0)];
	const merged = countKinds(L).consts > 1 || countKinds(R).consts > 1;
	return {
		eq: normalizeEq({
			...equation,
			L,
			R
		}),
		merged
	};
}
function moveNode(equation, from, index) {
	const source = from === "L" ? equation.L : equation.R;
	const node = source[index];
	if (!node) return {
		eq: equation,
		merged: false
	};
	const rest = source.filter((_, i) => i !== index);
	const nextDest = [...from === "L" ? equation.R : equation.L, negateNode(node)];
	const kinds = countKinds(nextDest);
	const merged = kinds.vars > 1 || kinds.consts > 1;
	const L = from === "L" ? rest : nextDest;
	const R = from === "L" ? nextDest : rest;
	return {
		eq: normalizeEq({
			...equation,
			L,
			R
		}),
		merged
	};
}
function distribute(equation) {
	const open = (side) => {
		const out = [];
		for (const n of side) if (n.k === "t") out.push(n);
		else for (const t of n.inner) out.push(term(n.m * t.c, t.v));
		return out;
	};
	return normalizeEq({
		...equation,
		L: open(equation.L),
		R: open(equation.R)
	});
}
function scale(equation, factor) {
	if (!Number.isInteger(factor) || factor === 0 || factor === 1) return equation;
	const map = (side) => side.map((n) => n.k === "t" ? term(n.c * factor, n.v) : prod(n.m * factor, n.inner));
	return normalizeEq({
		...equation,
		L: map(equation.L),
		R: map(equation.R)
	});
}
function outerCoeffs(equation) {
	const coeffs = [];
	for (const n of [...equation.L, ...equation.R]) if (n.k === "t") coeffs.push(n.c);
	else coeffs.push(n.m);
	return coeffs.filter((c) => c !== 0);
}
function gcd(a, b) {
	let x = Math.abs(a);
	let y = Math.abs(b);
	while (y) {
		const t = y;
		y = x % y;
		x = t;
	}
	return x;
}
function canDivide(equation, divisor) {
	if (!Number.isInteger(divisor) || divisor <= 1) return false;
	const coeffs = outerCoeffs(equation);
	if (coeffs.length === 0) return false;
	return coeffs.every((c) => c % divisor === 0);
}
function tryDivide(equation, divisor) {
	if (!canDivide(equation, divisor)) return null;
	const map = (side) => side.map((n) => n.k === "t" ? term(Math.trunc(n.c / divisor), n.v) : prod(Math.trunc(n.m / divisor), n.inner));
	return normalizeEq({
		...equation,
		L: map(equation.L),
		R: map(equation.R)
	});
}
function divisors(equation) {
	const coeffs = outerCoeffs(equation);
	if (coeffs.length === 0) return [];
	let g = Math.abs(coeffs[0]);
	for (const c of coeffs.slice(1)) g = gcd(g, c);
	if (g <= 1) return [];
	const out = [];
	for (let d = 2; d <= g; d += 1) if (g % d === 0) out.push(d);
	return out;
}
function isSolved(equation) {
	const L = normalizeSide(equation.L);
	const R = normalizeSide(equation.R);
	const isolated = (alone, other) => {
		if (alone.length !== 1) return null;
		const head = alone[0];
		if (head.k !== "t" || head.v !== 1 || head.c !== 1) return null;
		if (other.length === 0) return 0;
		if (other.length === 1 && other[0].k === "t" && other[0].v === 0) return other[0].c;
		return null;
	};
	return isolated(L, R) ?? isolated(R, L);
}
function progressScore(equation) {
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
function evalSide(side, value) {
	return expand(side).reduce((sum, t) => sum + t.c * (t.v ? value : 1), 0);
}
function identical(a, b) {
	const da = expand(a);
	const db = expand(b);
	return coeff(da, 1) === coeff(db, 1) && coeff(da, 0) === coeff(db, 0);
}
function hasProduct(equation) {
	return [...equation.L, ...equation.R].some((n) => n.k === "p");
}
function hintFor(equation, level) {
	const name = equation.varName;
	const product = [...equation.L, ...equation.R].find((n) => n.k === "p");
	if (product && product.k === "p") {
		if (level === 1) return `Tem um pacote: ${nodeLabel(product, name)}. O parêntese ainda não foi aberto.`;
		if (level === 2) return "Dois caminhos válidos: abrir o parêntese, ou dividir os dois lados pelo número de fora.";
		return `Manual: “Abrir parênteses”, ou ÷ ${Math.abs(product.m)} dos dois lados.`;
	}
	const cL = coeff(expand(equation.L), 1);
	const cR = coeff(expand(equation.R), 1);
	const kL = coeff(expand(equation.L), 0);
	const kR = coeff(expand(equation.R), 0);
	if (cL !== 0 && cR !== 0) {
		const piece = formatExpr([term((Math.abs(cL) <= Math.abs(cR) ? "L" : "R") === "L" ? cL : cR, 1)], name);
		if (level === 1) return `O ${name} está nos dois membros. Ainda não dá para ler o valor.`;
		if (level === 2) return `Passa um termo com ${name} para o outro lado. O sinal troca. Os parecidos se juntam.`;
		return `Passa ${piece} para o outro lado.`;
	}
	const varOnLeft = cL !== 0;
	const c = varOnLeft ? cL : cR;
	const k = varOnLeft ? kL : kR;
	if (k !== 0) {
		const piece = formatExpr([term(k, 0)], name);
		if (level === 1) return `No mesmo lado do ${name} tem um número sem letra. Ele ainda está grudado.`;
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
function valueMiss(side, name, x, answer) {
	if (answer === evalSide(side, x)) return "";
	const expanded = expand(side);
	const c = coeff(expanded, 1);
	const k = coeff(expanded, 0);
	if (c !== 0 && answer === c + x + k) return `O ${c} não soma com ${name}. Ele multiplica: ${c} × ${x} = ${c * x}.`;
	if (c !== 0 && answer === c * x) return `Faltou a parte sem letra, o ${k < 0 ? `− ${Math.abs(k)}` : `+ ${k}`}.`;
	if (answer === k) return "Isso é só a parte fixa. O termo com a letra também entra na conta.";
	const product = side.find((n) => n.k === "p");
	if (product && product.k === "p") {
		const iv = coeff(product.inner, 1);
		const ik = coeff(product.inner, 0);
		if (answer === product.m * iv * x + ik) return `O de dentro também se multiplica. O parêntese vale ${iv * x + ik}, e aí sim entra o ${product.m}.`;
	}
	return `Não fechou. Onde está ${name}, coloca ${x} e refaz um pedaço por vez. O resultado certo ainda não é esse.`;
}
var chip = (id, label, side) => ({
	id,
	label,
	side
});
var BUILD = [
	{
		id: "servidores",
		kicker: "Leitura · 01",
		story: "Cada servidor no ar segura 30 transações por segundo. Há s servidores ligados, e um reserva fixo segura mais 12.",
		prompt: "Monta o total de transações por segundo.",
		varName: "s",
		target: [term(30, 1), term(12, 0)],
		chips: [
			chip("30s", "30s", [term(30, 1)]),
			chip("12", "12", [term(12, 0)]),
			chip("30+s", "30 + s", [term(30, 0), term(1, 1)]),
			chip("12s", "12s", [term(12, 1)]),
			chip("s+12", "s + 12", [term(1, 1), term(12, 0)]),
			chip("42", "42", [term(42, 0)])
		],
		traps: [{
			side: [term(30, 0), term(1, 1)],
			say: "30 + s seria trinta mais um servidor. A história diz 30 por servidor: isso multiplica."
		}, {
			side: [term(1, 1), term(12, 0)],
			say: "Aqui cada servidor contribui 1, não 30. O 30 é o ritmo de cada um."
		}],
		insight: "30s quer dizer 30 por servidor. O 30 é o coeficiente. O 12 não leva letra: é o termo independente, a parte fixa."
	},
	{
		id: "fila",
		kicker: "Leitura · 02",
		story: "Chegaram c pessoas. A fila é o dobro disso. Em seguida, 5 desistem e vão embora.",
		prompt: "Monta a expressão da fila que ficou.",
		varName: "c",
		target: [term(2, 1), term(-5, 0)],
		chips: [
			chip("2c", "2c", [term(2, 1)]),
			chip("-5", "-5", [term(-5, 0)]),
			chip("2+c", "2 + c", [term(2, 0), term(1, 1)]),
			chip("pack", "2(c - 5)", [prod(2, [term(1, 1), term(-5, 0)])]),
			chip("5c", "5c", [term(5, 1)]),
			chip("c-5", "c - 5", [term(1, 1), term(-5, 0)])
		],
		traps: [
			{
				side: [prod(2, [term(1, 1), term(-5, 0)])],
				say: "2(c − 5) seria se as 5 tivessem saído antes de dobrar. Na história, primeiro dobra, depois saem 5."
			},
			{
				side: [term(2, 0), term(1, 1)],
				say: "Dobro é multiplicar por 2, não somar 2."
			},
			{
				side: [term(1, 1), term(-5, 0)],
				say: "O dobro ficou de fora. c − 5 é a fila sem duplicar."
			}
		],
		insight: "Dobro é ×2. O −5 acontece depois, então fica fora do parêntese: 2c − 5."
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
			chip("6", "6", [term(6, 0)])
		],
		traps: [{
			side: [term(3, 1), term(2, 0)],
			say: "3p + 2 conta a reserva uma vez só. São 2 em cada caixa, e as caixas são 3."
		}, {
			side: [term(1, 1), term(2, 0)],
			say: "Isso é o conteúdo de uma caixa. A história tem três delas."
		}],
		insight: "O parêntese é o conteúdo de uma caixa. O 3 multiplica a caixa inteira. 3(p + 2) e 3p + 6 são a mesma quantidade — uma fechada, outra aberta."
	}
];
var VALUE = [{
	id: "val-s",
	kicker: "Substituição · 01",
	story: "A expressão dos servidores era 30s + 12. Subiram 4 servidores.",
	varName: "s",
	side: [term(30, 1), term(12, 0)],
	value: 4,
	prompt: "Quanto vale a expressão se s = 4?",
	insight: "Onde estava s, entrou 4. 30 × 4 + 12. A letra nunca foi mistério: era um lugar esperando número."
}, {
	id: "val-p",
	kicker: "Substituição · 02",
	story: "Cada caixa tem p + 2, e são 3 caixas. Agora p = 5.",
	varName: "p",
	side: [prod(3, [term(1, 1), term(2, 0)])],
	value: 5,
	prompt: "Quanto vale 3(p + 2) se p = 5?",
	insight: "Primeiro o de dentro: 5 + 2 = 7. Depois o de fora: 3 × 7. O parêntese manda a ordem."
}];
var SOLVE = [
	{
		id: "g-n",
		kicker: "Dois lados · 01",
		story: "A fila: n pessoas, mais 9 atrasados, fecham 21. Acha n.",
		equation: eq("n", [term(1, 1), term(9, 0)], [term(21, 0)]),
		expect: 12,
		mode: "guided",
		steps: [{
			op: "add",
			delta: -9,
			label: "Tirar 9 dos dois lados",
			why: "Saíram 9 dos dois membros. 21 virou 12. O n ficou só. A igualdade não se mexeu."
		}],
		insight: "Tirar o mesmo número dos dois lados não muda a incógnita. Só limpa o que estava em volta."
	},
	{
		id: "g-t",
		kicker: "Dois lados · 02",
		story: "4 terminais iguais processam 28 operações no minuto. Quanto cabe em cada um?",
		equation: eq("t", [term(4, 1)], [term(28, 0)]),
		expect: 7,
		mode: "guided",
		steps: [{
			op: "div",
			by: 4,
			label: "Dividir os dois lados por 4",
			why: "Quatro iguais dão 28, então um é 28 ÷ 4. Os dois lados encolhem juntos."
		}],
		insight: "Dividir os dois lados pelo coeficiente é o princípio multiplicativo. O t não muda de valor."
	},
	{
		id: "f-2x",
		kicker: "Dois lados · 03",
		story: "Dois lotes de x, mais 6 fixos, fecham 20. Desta vez o gesto é teu.",
		equation: eq("x", [term(2, 1), term(6, 0)], [term(20, 0)]),
		expect: 7,
		mode: "free",
		whisper: "O 6 não tem letra. Pode passar para o outro lado — o sinal troca — ou sair dos dois lados. É o mesmo gesto. Depois divide por 2.",
		insight: "Primeiro separa o que tem letra do que não tem. Depois divide. Dois gestos, uma igualdade."
	},
	{
		id: "i-minus",
		kicker: "Isolar · 01",
		story: "O atraso era x minutos. Já se recuperaram 8, e ainda restam 13.",
		equation: eq("x", [term(1, 1), term(-8, 0)], [term(13, 0)]),
		expect: 21,
		mode: "free",
		whisper: "",
		insight: "Passar um termo negativo é somar esse valor dos dois lados. O sinal troca na passagem."
	},
	{
		id: "i-axb",
		kicker: "Isolar · 02",
		story: "Três ciclos de x, mais 4 de aquecimento, fecham 19.",
		equation: eq("x", [term(3, 1), term(4, 0)], [term(19, 0)]),
		expect: 5,
		mode: "free",
		whisper: "",
		insight: "Forma da escola: ax + b = c. Tira o b, divide pelo a."
	},
	{
		id: "i-paren",
		kicker: "Isolar · 03",
		story: "Duas baias. Em cada uma, x máquinas e 5 reservas. Juntas, 24 máquinas.",
		equation: eq("x", [prod(2, [term(1, 1), term(5, 0)])], [term(24, 0)]),
		expect: 7,
		mode: "free",
		whisper: "Dá para abrir o parêntese. Dá para dividir os dois lados por 2. Os dois caminhos chegam.",
		insight: "Parêntese é um pacote. Abre, ou divide o pacote inteiro. A incógnita é a mesma."
	},
	{
		id: "i-both",
		kicker: "Isolar · 04",
		story: "A linha da esquerda tem 4x + 3. A da direita, 2x + 15. As duas empatam. Este é o ponto em que a matéria costuma parecer outra. Não é.",
		equation: eq("x", [term(4, 1), term(3, 0)], [term(2, 1), term(15, 0)]),
		expect: 6,
		mode: "free",
		whisper: "Tem letra dos dois lados. Passa as letras para um lado e os números para o outro. Mesma regra de sempre.",
		insight: "Nada de capítulo novo. O x da direita, ao passar, troca de sinal e se junta ao x da esquerda. Termos parecidos."
	}
];
var MODEL = {
	id: "agencia",
	kicker: "Turno da agência",
	story: "A linha precisa de 160 operações por minuto. Cada terminal novo faz 15. Os antigos, juntos, já entregam 40 — e isso não muda quando você liga mais um novo.",
	ask: "Qual equação descreve quantos terminais novos, n, a linha precisa?",
	choices: [
		{
			id: "ok",
			equation: eq("n", [term(15, 1), term(40, 0)], [term(160, 0)]),
			ok: true,
			say: "15 por novo, mais 40 que já existem, igual à meta. A letra está no que varia."
		},
		{
			id: "four",
			equation: eq("n", [term(15, 1), term(4, 0)], [term(160, 0)]),
			ok: false,
			say: "O 4 não é a produção. Os antigos produzem 40, não 4. Quantidade de máquinas e ritmo não são o mesmo número."
		},
		{
			id: "flip",
			equation: eq("n", [term(40, 1), term(15, 0)], [term(160, 0)]),
			ok: false,
			say: "Aqui o 40 ficou multiplicando o que a gente não sabe. Quem varia é o número de novos, e cada um vale 15."
		}
	],
	insight: "Traduzir o texto é metade do trabalho. Isolar, você já sabe.",
	expect: 8
};
var MODEL_2 = {
	id: "desistencias",
	kicker: "Segundo chamado",
	story: "O dobro da fila, menos 6 desistências, deixa 18 pessoas.",
	ask: "Qual equação acha a fila f?",
	choices: [
		{
			id: "ok",
			equation: eq("f", [term(2, 1), term(-6, 0)], [term(18, 0)]),
			ok: true,
			say: "Dobro da fila, depois tira 6. 2f − 6 = 18."
		},
		{
			id: "plus",
			equation: eq("f", [term(2, 1), term(6, 0)], [term(18, 0)]),
			ok: false,
			say: "Desistir é sair da fila: menos, não mais."
		},
		{
			id: "nodouble",
			equation: eq("f", [term(1, 1), term(-6, 0)], [term(18, 0)]),
			ok: false,
			say: "O dobro sumiu. Sem o 2, a fila ficou pela metade do que a história disse."
		}
	],
	insight: "O texto diz a ordem: primeiro o dobro, depois a saída.",
	expect: 12
};
function extraPuzzle(seed) {
	const hands = [
		{
			seed: 0,
			equation: eq("x", [term(2, 1), term(1, 0)], [term(11, 0)]),
			expect: 5
		},
		{
			seed: 1,
			equation: eq("x", [term(6, 1)], [term(42, 0)]),
			expect: 7
		},
		{
			seed: 2,
			equation: eq("x", [term(1, 1), term(14, 0)], [term(20, 0)]),
			expect: 6
		},
		{
			seed: 3,
			equation: eq("x", [term(5, 1), term(-5, 0)], [term(20, 0)]),
			expect: 5
		},
		{
			seed: 4,
			equation: eq("x", [term(3, 1), term(2, 0)], [term(1, 1), term(12, 0)]),
			expect: 5
		},
		{
			seed: 5,
			equation: eq("x", [prod(2, [term(1, 1), term(4, 0)])], [term(18, 0)]),
			expect: 5
		}
	];
	if (seed < hands.length) return {
		...hands[seed],
		seed
	};
	const a = 2 + seed % 7;
	const x = seed % 11 - 2;
	const b = seed % 9 - 3;
	const c = a * x + b;
	if (seed % 4 === 0 && a >= 4) {
		const k = 1 + seed % (a - 1);
		return {
			seed,
			expect: x,
			equation: eq("x", [term(a - k, 1), term(b, 0)], [term(-k, 1), term(c, 0)])
		};
	}
	if (seed % 5 === 0) return {
		seed,
		expect: x,
		equation: eq("x", [prod(2, [term(1, 1), term(b, 0)])], [term(2 * x + 2 * b, 0)])
	};
	return {
		seed,
		expect: x,
		equation: eq("x", [term(a, 1), term(b, 0)], [term(c, 0)])
	};
}
var MANUAL = {
	title: "Como a linha funciona",
	lede: "Um turno curto. Dá para sair no meio. Quando você volta, a linha está no mesmo ponto.",
	blocks: [
		{
			h: "Expressão não é equação",
			p: "Expressão é uma conta com um lugar vazio: 30s + 12. Equação é quando essa conta vale a mesma coisa que o outro lado. O igual não é “a resposta vem depois”. É uma balança."
		},
		{
			h: "O que tem nome",
			p: "A letra é a incógnita: o que a linha ainda não mediu. Em 30s, o 30 é o coeficiente — o ritmo de cada um. O 12 não tem letra: é o termo independente, a parte que não muda."
		},
		{
			h: "O gesto, dos dois lados",
			p: "Pode somar, tirar ou dividir, se fizer a mesma coisa nos dois membros. Passar um termo para o outro lado é esse gesto, de uma vez. O sinal troca porque o termo saiu e foi compensado."
		},
		{
			h: "Errar aqui é barato",
			p: "Uma jogada que preserva a igualdade continua valendo, mesmo se não chegar mais perto. Dá para desfazer. Consultar o manual não custa ponto. Testar um valor mostra se os dois lados batem."
		},
		{
			h: "Sem nota e sem pressa",
			p: "Não tem vida perdida nem ranking. A hora extra é só traquejo, sem história nova. O relógio só aparece se você pedir."
		}
	]
};
var COMPANION = {
	title: "Para quem acompanha",
	lede: "Desenho da sessão. O aluno pode abrir isto; não encontra diagnóstico, nota nem relato da prova.",
	blocks: [
		{
			h: "Por que esta forma",
			p: "Ele infere a partir de fala curta e perdeu o fio justo quando a aula entrou em equação de primeiro grau. A sessão não revisa a aritmética. Reapresenta o igual como balança, no cenário que já fez sentido: capacidade de uma linha, ritmo por terminal, parte fixa."
		},
		{
			h: "Uma sentada, três camadas",
			p: "Leitura monta a expressão e nomeia coeficiente, termo e parêntese no ato, com as trocas clássicas ao lado: somar em vez de multiplicar, parêntese no lugar errado, reserva contada uma vez. Substituição devolve a letra ao lugar de número. Isolar começa guiado — mesmo gesto nos dois lados — e só então vira o atalho da escola, “passar para o outro lado”."
		},
		{
			h: "Onde o fio costuma cair",
			p: "Parêntese e incógnita nos dois membros entram como a mesma regra, dita em voz alta, não como capítulo novo. Para quem descarrilhou nesse ponto, a ameaça é a novidade aparente."
		},
		{
			h: "Autonomia sem humilhação",
			p: "Sem cronômetro obrigatório, sem vida, sem ranking. Erro que preserva a igualdade é aceito e nomeado. Dica em três degraus, sem custo. “Testar um valor” instala o hábito de checar, que a prova cobra sem avisar. O progresso fica no aparelho."
		},
		{
			h: "O que olhar depois",
			p: "A nota de turno, no fim, diz se ele sustentou ax + b = c, o pacote com parêntese e a letra dos dois lados — e se a tradução do texto trocou ritmo com quantidade. A aula seguinte pode ser texto livre para equação, já com o isolamento firme."
		}
	]
};
var KEY = "calibre-turno-v1";
var blank = () => ({
	version: 1,
	name: "",
	buildDone: 0,
	valueDone: 0,
	principle: false,
	solveDone: 0,
	modelDone: false,
	model2Done: false,
	modelMisses: 0,
	extraSolved: 0,
	hints: 0,
	stallsById: {},
	hintsById: {},
	notebook: [],
	showTime: false
});
function asRecord(value) {
	if (!value || typeof value !== "object") return {};
	const out = {};
	for (const [key, entry] of Object.entries(value)) if (typeof entry === "number" && Number.isFinite(entry)) out[key] = Math.max(0, Math.floor(entry));
	return out;
}
function asLines(value) {
	if (!Array.isArray(value)) return [];
	return value.filter((line) => typeof line === "string").slice(-20);
}
function asCount(value, max) {
	if (typeof value !== "number" || !Number.isFinite(value)) return 0;
	return Math.min(max, Math.max(0, Math.floor(value)));
}
function pick(s) {
	return {
		version: 1,
		name: s.name,
		buildDone: s.buildDone,
		valueDone: s.valueDone,
		principle: s.principle,
		solveDone: s.solveDone,
		modelDone: s.modelDone,
		model2Done: s.model2Done,
		modelMisses: s.modelMisses,
		extraSolved: s.extraSolved,
		hints: s.hints,
		stallsById: s.stallsById,
		hintsById: s.hintsById,
		notebook: s.notebook,
		showTime: s.showTime
	};
}
function persist(progress) {
	try {
		localStorage.setItem(KEY, JSON.stringify(progress));
	} catch {}
}
function withLine(list, line) {
	if (!line || list[list.length - 1] === line) return list;
	return [...list, line].slice(-20);
}
function bump(map, id) {
	return {
		...map,
		[id]: (map[id] ?? 0) + 1
	};
}
function lineState(progress) {
	const flags = [
		progress.buildDone >= BUILD.length,
		progress.valueDone >= VALUE.length,
		progress.solveDone >= 3,
		progress.solveDone >= SOLVE.length,
		progress.modelDone
	];
	const lit = flags.filter(Boolean).length;
	const active = flags.findIndex((flag) => !flag);
	return {
		lit,
		active: active === -1 ? 4 : active
	};
}
var useCalibre = create((set, get) => ({
	...blank(),
	hydrated: false,
	screen: { t: "gate" },
	mapNote: "",
	hydrate: () => {
		if (get().hydrated) return;
		const base = blank();
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) {
				const saved = JSON.parse(raw);
				if (saved.version === 1) {
					base.name = typeof saved.name === "string" ? saved.name.slice(0, 24) : "";
					base.buildDone = asCount(saved.buildDone, BUILD.length);
					base.valueDone = asCount(saved.valueDone, VALUE.length);
					base.principle = Boolean(saved.principle);
					base.solveDone = asCount(saved.solveDone, SOLVE.length);
					base.modelDone = Boolean(saved.modelDone);
					base.model2Done = Boolean(saved.model2Done);
					base.modelMisses = asCount(saved.modelMisses, 99);
					base.extraSolved = asCount(saved.extraSolved, 999);
					base.hints = asCount(saved.hints, 999);
					base.stallsById = asRecord(saved.stallsById);
					base.hintsById = asRecord(saved.hintsById);
					base.notebook = asLines(saved.notebook);
					base.showTime = Boolean(saved.showTime);
				}
			}
		} catch {}
		const started = base.name.length > 0 || base.buildDone > 0 || base.valueDone > 0 || base.principle || base.solveDone > 0;
		set({
			...base,
			hydrated: true,
			screen: started ? { t: "map" } : { t: "gate" },
			mapNote: ""
		});
	},
	setScreen: (screen) => set({
		screen,
		mapNote: ""
	}),
	setMapNote: (mapNote) => set({ mapNote }),
	setName: (name) => {
		const next = {
			...pick(get()),
			name: name.slice(0, 24)
		};
		persist(next);
		set(next);
	},
	markBuild: (i, line) => {
		const next = {
			...pick(get()),
			buildDone: Math.max(get().buildDone, Math.min(BUILD.length, i + 1)),
			notebook: withLine(get().notebook, line)
		};
		persist(next);
		set(next);
	},
	markValue: (i, line) => {
		const next = {
			...pick(get()),
			valueDone: Math.max(get().valueDone, Math.min(VALUE.length, i + 1)),
			notebook: withLine(get().notebook, line)
		};
		persist(next);
		set(next);
	},
	markPrinciple: () => {
		const next = {
			...pick(get()),
			principle: true
		};
		persist(next);
		set(next);
	},
	markSolve: (i, line) => {
		const next = {
			...pick(get()),
			solveDone: Math.max(get().solveDone, Math.min(SOLVE.length, i + 1)),
			notebook: withLine(get().notebook, line)
		};
		persist(next);
		set(next);
	},
	markModel: (which, line) => {
		const next = {
			...pick(get()),
			modelDone: which === 1 ? true : get().modelDone,
			model2Done: which === 2 ? true : get().model2Done,
			notebook: withLine(get().notebook, line)
		};
		persist(next);
		set(next);
	},
	addModelMiss: () => {
		const next = {
			...pick(get()),
			modelMisses: get().modelMisses + 1
		};
		persist(next);
		set(next);
	},
	addHint: (id) => {
		const next = {
			...pick(get()),
			hints: get().hints + 1,
			hintsById: bump(get().hintsById, id)
		};
		persist(next);
		set(next);
	},
	addStall: (id) => {
		const next = {
			...pick(get()),
			stallsById: bump(get().stallsById, id)
		};
		persist(next);
		set(next);
	},
	addExtra: (line) => {
		const next = {
			...pick(get()),
			extraSolved: get().extraSolved + 1,
			notebook: withLine(get().notebook, line)
		};
		persist(next);
		set(next);
	},
	setShowTime: (showTime) => {
		const next = {
			...pick(get()),
			showTime
		};
		persist(next);
		set(next);
	},
	reset: () => {
		const next = {
			...blank(),
			name: get().name
		};
		persist(next);
		set({
			...next,
			hydrated: true,
			screen: { t: "map" },
			mapNote: "Turno zerado. A linha espera de novo."
		});
	}
}));
function cx(...inputs) {
	return twMerge(clsx(inputs));
}
function Mark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M9 5v22M9 8h11M9 24h11",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2.2",
			strokeLinecap: "square"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "23",
			cy: "16",
			r: "2.4",
			fill: "currentColor"
		})]
	});
}
function Lamps({ lit, active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-1.5",
		role: "img",
		"aria-label": `${lit} de 5 estações em ritmo`,
		children: Array.from({ length: 5 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cx("h-1.5 flex-1 rounded-full", index < lit ? "bg-amber" : index === active ? "bg-moss" : "bg-panel-2") }, index))
	});
}
function Top({ title, kicker, onBack, lamps }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "mb-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [onBack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onBack,
					className: "grid size-11 shrink-0 place-items-center rounded-full bg-panel text-bone",
					"aria-label": "Voltar à linha",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-5" })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-8 shrink-0 text-amber" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-widest text-amber",
						children: "CALIBRE"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "truncate text-xl font-semibold leading-tight",
						children: title
					})]
				})]
			}),
			kicker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: kicker
			}) : null,
			lamps ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lamps, {
					lit: lamps.lit,
					active: lamps.active
				})
			}) : null
		]
	});
}
function Primary({ children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		...props,
		className: cx("inline-flex min-h-12 w-full items-center justify-center rounded-card bg-amber px-4 py-3 text-base font-semibold text-amber-ink disabled:opacity-40", props.className),
		children
	});
}
function Ghost({ children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		...props,
		className: cx("inline-flex min-h-11 items-center justify-center rounded-card px-3 py-2 text-sm font-medium text-muted disabled:opacity-40", props.className),
		children
	});
}
function Manual() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteCard, {
		kicker: "NA LINHA",
		note: MANUAL
	});
}
function CompanionNote() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteCard, {
		kicker: "ACOMPANHAMENTO",
		note: COMPANION
	});
}
function NoteCard({ kicker, note }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-card bg-bone p-6 text-ink-bone",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-widest text-quiet",
				children: kicker
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 text-2xl font-semibold leading-tight",
				children: note.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-base leading-relaxed",
				children: note.lede
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-5",
				children: note.blocks.map((block) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-semibold",
					children: block.h
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm leading-relaxed text-quiet",
					children: block.p
				})] }, block.h))
			})
		]
	});
}
function Whisper({ children, tone = "idle" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		"aria-live": "polite",
		className: cx("min-h-16 text-sm leading-relaxed", tone === "good" && "text-moss", tone === "miss" && "text-clay", tone === "idle" && "text-muted"),
		children
	});
}
function chosenSide(puzzle, ids) {
	return ids.flatMap((id) => puzzle.chips.find((chip) => chip.id === id)?.side ?? []);
}
function BuildRound({ puzzle, index, total, lamps, onBack, onDone }) {
	const [ids, setIds] = (0, import_react.useState)([]);
	const [note, setNote] = (0, import_react.useState)("Toca os pedaços que a história pede. A ordem não importa.");
	const [tone, setTone] = (0, import_react.useState)("idle");
	const [done, setDone] = (0, import_react.useState)(false);
	const side = chosenSide(puzzle, ids);
	function toggle(id) {
		if (done) return;
		setTone("idle");
		setIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
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
			setNote(opened || !packed ? puzzle.insight : `${puzzle.insight} Você abriu o parêntese. Vale do mesmo jeito.`);
			return;
		}
		const trap = puzzle.traps.find((item) => identical(side, item.side));
		setTone("miss");
		setNote(trap?.say ?? "Essa combinação não é a da história. Tira um pedaço e lê de novo o que multiplica e o que só soma.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Top, {
				title: "Leitura",
				kicker: `${puzzle.kicker} · ${index + 1} de ${total}`,
				onBack,
				lamps
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-base leading-relaxed",
				children: puzzle.story
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm font-medium text-amber",
				children: puzzle.prompt
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cx("mt-4 rounded-card border bg-bone p-4 text-ink-bone", tone === "miss" ? "border-clay" : "border-bone"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-widest text-quiet",
						children: "EXPRESSÃO"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 min-h-10 font-mono text-eq leading-tight",
						children: ids.length === 0 ? "—" : formatExpr(side, puzzle.varName)
					}),
					ids.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: ids.map((id) => {
							const chip = puzzle.chips.find((item) => item.id === id);
							if (!chip) return null;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => toggle(id),
								className: "min-h-11 rounded-full bg-bone-2 px-3 font-mono text-base text-ink-bone",
								children: chip.label
							}, id);
						})
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid grid-cols-2 gap-2",
				children: puzzle.chips.map((chip) => {
					const on = ids.includes(chip.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => toggle(chip.id),
						"aria-pressed": on,
						className: cx("min-h-12 rounded-2xl border px-3 font-mono text-base", on ? "border-amber bg-amber text-amber-ink" : "border-line bg-panel text-bone"),
						children: chip.label
					}, chip.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Whisper, {
					tone,
					children: note
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-auto pt-4",
				children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
					onClick: () => onDone(formatExpr(puzzle.target, puzzle.varName)),
					children: "Seguir"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
						onClick: check,
						children: "É esta"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
						onClick: () => setIds([]),
						disabled: ids.length === 0,
						children: "Limpar"
					})]
				})
			})
		]
	});
}
function Keypad({ onKey }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-3 gap-2",
		children: [
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"-",
			"0",
			"⌫"
		].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onKey(key),
			className: "min-h-12 rounded-2xl bg-panel font-mono text-lg text-bone",
			"aria-label": key === "⌫" ? "Apagar" : key === "-" ? "Trocar sinal" : key,
			children: key === "-" ? "−" : key
		}, key))
	});
}
function pushDigit(current, key) {
	if (key === "⌫") return current.slice(0, -1);
	if (key === "-") {
		if (current.startsWith("-")) return current.slice(1);
		return `-${current}`;
	}
	if (current.replace("-", "").length >= 5) return current;
	if (current === "0") return key;
	if (current === "-0") return `-${key}`;
	return current + key;
}
function readNumber(raw) {
	if (raw === "" || raw === "-") return null;
	const value = Number(raw);
	if (!Number.isFinite(value)) return null;
	return value;
}
function applyStep(equation, step) {
	if (step.op === "add") return addConstBoth(equation, step.delta).eq;
	return tryDivide(equation, step.by) ?? equation;
}
function SolveRound({ puzzle, lamps, onBack, onDone, timed = false }) {
	const addHint = useCalibre((s) => s.addHint);
	const addStall = useCalibre((s) => s.addStall);
	const showTime = useCalibre((s) => s.showTime);
	const setShowTime = useCalibre((s) => s.setShowTime);
	const [equation, setEquation] = (0, import_react.useState)(puzzle.equation);
	const [history, setHistory] = (0, import_react.useState)([]);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [hintLevel, setHintLevel] = (0, import_react.useState)(0);
	const [note, setNote] = (0, import_react.useState)(puzzle.whisper || "A igualdade aguenta, desde que os dois lados recebam o mesmo tratamento.");
	const [tone, setTone] = (0, import_react.useState)("idle");
	const [stamp, setStamp] = (0, import_react.useState)(null);
	const [testing, setTesting] = (0, import_react.useState)(false);
	const [guess, setGuess] = (0, import_react.useState)("");
	const [elapsed, setElapsed] = (0, import_react.useState)(0);
	const guidedStep = puzzle.mode === "guided" ? puzzle.steps?.[history.length] : void 0;
	const name = equation.varName;
	(0, import_react.useEffect)(() => {
		if (!timed || !showTime || stamp !== null) return;
		const id = window.setInterval(() => setElapsed((value) => value + 1), 1e3);
		return () => window.clearInterval(id);
	}, [
		timed,
		showTime,
		stamp,
		puzzle.id
	]);
	function commit(next, message, merged) {
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
	function select(side, index) {
		if (stamp !== null || guidedStep) return;
		setSelected((current) => current?.side === side && current.index === index ? null : {
			side,
			index
		});
	}
	function passSelected() {
		if (!selected) return;
		const node = equation[selected.side][selected.index];
		if (!node) return;
		const moved = moveNode(equation, selected.side, selected.index);
		commit(moved.eq, `Passou ${nodeLabel(node, name)} de lado e o sinal trocou. É tirar dos dois lados, num gesto só.`, moved.merged);
	}
	function consult() {
		const level = Math.min(3, hintLevel + 1);
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
			setNote(stamp !== null ? `Bateu. ${name} = ${value} equilibra os dois membros.` : `Bateu. ${name} = ${value} equilibra os dois membros. Isola mesmo assim — a prova pede o gesto, não só o chute.`);
			return;
		}
		setTone("miss");
		setNote(`Com ${name} = ${value}: esquerda ${left}, direita ${right}. Não é esse.`);
	}
	const selectedNode = selected ? equation[selected.side][selected.index] : void 0;
	const clock = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Top, {
				title: puzzle.mode === "guided" ? "Os dois lados" : "Isolar",
				kicker: puzzle.kicker,
				onBack,
				lamps
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-base leading-relaxed",
				children: puzzle.story
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 font-mono text-xs text-faint",
				children: ["Pedido · ", formatEquation(puzzle.equation)]
			}),
			timed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-center justify-between text-xs text-faint",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 underline",
					onClick: () => setShowTime(!showTime),
					children: showTime ? "Esconder o tempo" : "Mostrar o tempo"
				}), showTime ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono",
					children: clock
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sem cronômetro." })]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-card bg-bone p-4 text-ink-bone",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "sr-only",
					children: formatEquation(equation)
				}), stamp !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "calibre-rise py-3 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-widest text-quiet",
						children: "ISOLADO"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-4xl",
						children: [
							name,
							" = ",
							stamp
						]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideRow, {
							label: "Esquerda",
							side: equation.L,
							name,
							active: selected?.side === "L" ? selected.index : null,
							frozen: Boolean(guidedStep),
							onSelect: (index) => select("L", index)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-bone-2" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xl text-ink-bone",
									children: "="
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-bone-2" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideRow, {
							label: "Direita",
							side: equation.R,
							name,
							active: selected?.side === "R" ? selected.index : null,
							frozen: Boolean(guidedStep),
							onSelect: (index) => select("R", index)
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Whisper, {
					tone,
					children: note
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-auto space-y-3 pt-2",
				children: stamp !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
					onClick: () => onDone(`${formatEquation(puzzle.equation)} → ${name} = ${stamp}`),
					children: "Seguir"
				}) : guidedStep ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
					onClick: () => {
						commit(applyStep(equation, guidedStep), guidedStep.why, false);
					},
					children: guidedStep.label
				}) : testing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keypad, { onKey: (key) => setGuess((current) => pushDigit(current, key)) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center font-mono text-2xl",
						children: guess === "" ? "—" : guess
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Primary, {
						onClick: testGuess,
						children: ["Testar ", name]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
						className: "w-full",
						onClick: () => setTesting(false),
						children: "Voltar aos gestos"
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					selectedNode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Primary, {
						onClick: passSelected,
						children: [
							"Passar ",
							nodeLabel(selectedNode, name),
							" para o outro lado"
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-sm text-faint",
						children: "Toca um termo para passar de lado."
					}),
					hasProduct(equation) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
						className: selectedNode ? "bg-panel text-bone" : void 0,
						onClick: () => commit(distribute(equation), "O parêntese abriu. O número de fora multiplicou cada termo de dentro.", false),
						children: "Abrir parênteses"
					}) : null,
					divisors(equation).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: divisors(equation).map((divisor) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "min-h-11 flex-1 rounded-2xl bg-panel px-3 font-mono text-base text-bone",
							onClick: () => {
								const next = tryDivide(equation, divisor);
								if (!next) return;
								commit(next, `Os dois lados foram divididos por ${divisor}. A igualdade ficou.`, false);
							},
							children: ["÷ ", divisor]
						}, divisor))
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
								onClick: () => commit(scale(equation, -1), "Os dois lados trocaram de sinal. O valor escondido é o mesmo.", false),
								children: "Trocar sinais"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
								onClick: undo,
								disabled: history.length === 0,
								children: "Desfazer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
								onClick: () => setTesting(true),
								children: "Testar um valor"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
								onClick: consult,
								children: "Consultar o manual"
							})
						]
					})
				] })
			})
		]
	});
}
function SideRow({ label, side, name, active, frozen, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs font-semibold tracking-widest text-quiet",
		children: label.toUpperCase()
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-2 flex min-h-12 flex-wrap gap-2",
		children: side.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-2xl",
			children: "0"
		}) : side.map((node, index) => {
			const labelText = nodeLabel(node, name);
			if (frozen) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "inline-flex min-h-12 items-center rounded-2xl bg-bone-2 px-3 font-mono text-2xl",
				children: labelText
			}, `${labelText}-${index}`);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-pressed": active === index,
				onClick: () => onSelect(index),
				className: cx("inline-flex min-h-12 items-center rounded-2xl px-3 font-mono text-2xl", active === index ? "bg-amber text-amber-ink" : "bg-bone-2 text-ink-bone"),
				children: labelText
			}, `${labelText}-${index}`);
		})
	})] });
}
function ModelRound({ which, lamps, onBack, onDone }) {
	const puzzle = which === 1 ? MODEL : MODEL_2;
	const addModelMiss = useCalibre((s) => s.addModelMiss);
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [misses, setMisses] = (0, import_react.useState)({});
	const choice = puzzle.choices.find((item) => item.id === picked) ?? null;
	if (choice?.ok) {
		const solve = {
			id: puzzle.id,
			kicker: puzzle.kicker,
			story: "A leitura fechou. Agora isola, com os mesmos gestos.",
			equation: choice.equation,
			expect: puzzle.expect,
			mode: "free",
			whisper: choice.say,
			insight: puzzle.insight
		};
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SolveRound, {
			puzzle: solve,
			lamps,
			onBack,
			onDone
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Top, {
				title: which === 1 ? "Turno da agência" : "Segundo chamado",
				kicker: puzzle.kicker,
				onBack,
				lamps
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-base leading-relaxed",
				children: puzzle.story
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm font-medium text-amber",
				children: puzzle.ask
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 space-y-3",
				children: puzzle.choices.map((item) => {
					const miss = misses[item.id];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							if (item.ok) {
								setPicked(item.id);
								return;
							}
							setMisses((current) => ({
								...current,
								[item.id]: item.say
							}));
							if (!miss) addModelMiss();
						},
						className: cx("w-full rounded-card border px-4 py-4 text-left", miss ? "border-clay bg-panel" : "border-line bg-panel"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-lg",
							children: formatEquation(item.equation)
						}), miss ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-2 block text-sm leading-relaxed text-clay",
							children: miss
						}) : null]
					}, item.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Whisper, { children: "Três leituras. Só uma conta a história do jeito que ela foi dita." })
			})
		]
	});
}
function ValueRound({ puzzle, index, total, lamps, onBack, onDone }) {
	const [raw, setRaw] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("Troca a letra pelo número e faz a conta.");
	const [tone, setTone] = (0, import_react.useState)("idle");
	const [done, setDone] = (0, import_react.useState)(false);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Top, {
				title: "Substituição",
				kicker: `${puzzle.kicker} · ${index + 1} de ${total}`,
				onBack,
				lamps
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-base leading-relaxed",
				children: puzzle.story
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-card bg-bone p-4 text-ink-bone",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-eq leading-tight",
						children: formatExpr(puzzle.side, puzzle.varName)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-sm text-quiet",
						children: [
							puzzle.varName,
							" = ",
							puzzle.value
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-xs font-semibold tracking-widest text-quiet",
						children: "VALE"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-3xl",
						children: raw === "" ? "—" : raw
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm font-medium text-amber",
				children: puzzle.prompt
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Whisper, {
					tone,
					children: note
				})
			}),
			done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-auto pt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
					onClick: () => onDone(`${formatExpr(puzzle.side, puzzle.varName)} com ${puzzle.varName} = ${puzzle.value} → ${expected}`),
					children: "Seguir"
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-auto space-y-3 pt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keypad, { onKey: (key) => setRaw((current) => pushDigit(current, key)) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
					onClick: submit,
					children: "Ver se fecha"
				})]
			})
		]
	});
}
var FOCUS = {
	"f-2x": "o primeiro isolamento livre",
	"i-minus": "o termo negativo",
	"i-axb": "a forma ax + b = c",
	"i-paren": "o parêntese",
	"i-both": "a letra nos dois lados",
	agencia: "a tradução do turno da agência",
	desistencias: "o segundo chamado"
};
function lessonNote(progress) {
	const heavy = Object.entries(progress.stallsById).filter(([, count]) => count >= 3).map(([id]) => FOCUS[id]).filter((item) => Boolean(item));
	const hinted = Object.entries(progress.hintsById).filter(([, count]) => count >= 2).map(([id]) => FOCUS[id]).filter((item) => Boolean(item));
	const lines = [];
	if (progress.solveDone >= SOLVE.length && heavy.length === 0) lines.push("Sustentou ax + b = c, o parêntese e a letra nos dois membros. Próximo passo: escrever a equação a partir do texto, sem opções, e só então isolar.");
	if (heavy.length > 0) lines.push(`Ponto fino: ${heavy.join(", ")}. Não é buraco de base. É o lugar de narrar um lado de cada vez, juntos.`);
	else if (hinted.length > 0) lines.push(`O manual foi aberto mais de uma vez em ${hinted.join(", ")}. O princípio está ao alcance; o gesto ainda agradece companhia.`);
	if (progress.modelMisses > 0) lines.push("Na tradução do texto, uma leitura chegou a trocar ritmo com quantidade, ou a ordem da operação. É o melhor gancho da aula seguinte.");
	if (lines.length === 0) return "O turno ainda está em curso. Esta nota se completa quando as estações fecham.";
	return lines.join(" ");
}
function CalibreApp() {
	const hydrate = useCalibre((s) => s.hydrate);
	const screen = useCalibre((s) => s.screen);
	const setScreen = useCalibre((s) => s.setScreen);
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-ink text-bone lg:grid lg:grid-cols-[minmax(0,40rem)_minmax(18rem,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex min-h-dvh w-full min-w-0 flex-col overflow-x-hidden px-5 py-6 sm:px-8 lg:px-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenBody, { screen })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			className: "hidden bg-ink lg:block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky top-0 flex max-h-dvh flex-col gap-4 overflow-auto p-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Manual, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
					className: "justify-start",
					onClick: () => setScreen({ t: "companion" }),
					children: "Para quem acompanha"
				})]
			})
		})]
	});
}
function ScreenBody({ screen }) {
	const progress = useCalibre();
	const lamps = lineState(progress);
	const setScreen = progress.setScreen;
	if (screen.t === "gate") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gate, {});
	if (screen.t === "note") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Top, {
			title: "A linha",
			onBack: () => setScreen(progress.name ? { t: "map" } : { t: "gate" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Manual, {})]
	});
	if (screen.t === "companion") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Top, {
			title: "Acompanhamento",
			onBack: () => setScreen(progress.name ? { t: "map" } : { t: "gate" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanionNote, {})]
	});
	if (screen.t === "map") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, {});
	if (screen.t === "build") {
		const puzzle = BUILD[screen.i];
		if (!puzzle) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, {});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildRound, {
			puzzle,
			index: screen.i,
			total: BUILD.length,
			lamps,
			onBack: () => setScreen({ t: "map" }),
			onDone: (line) => {
				const wasFrontier = progress.buildDone === screen.i;
				progress.markBuild(screen.i, line);
				if (screen.i + 1 < BUILD.length) setScreen({
					t: "build",
					i: screen.i + 1
				});
				else if (wasFrontier) setScreen({
					t: "value",
					i: 0
				});
				else setScreen({ t: "map" });
			}
		}, puzzle.id);
	}
	if (screen.t === "value") {
		const puzzle = VALUE[screen.i];
		if (!puzzle) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, {});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueRound, {
			puzzle,
			index: screen.i,
			total: VALUE.length,
			lamps,
			onBack: () => setScreen({ t: "map" }),
			onDone: (line) => {
				const wasFrontier = progress.valueDone === screen.i;
				progress.markValue(screen.i, line);
				if (screen.i + 1 < VALUE.length) setScreen({
					t: "value",
					i: screen.i + 1
				});
				else if (wasFrontier) setScreen({ t: "principle" });
				else setScreen({ t: "map" });
			}
		}, puzzle.id);
	}
	if (screen.t === "principle") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Principle, {});
	if (screen.t === "solve") {
		const puzzle = SOLVE[screen.i];
		if (!puzzle) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, {});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SolveRound, {
			puzzle,
			lamps,
			onBack: () => setScreen({ t: "map" }),
			onDone: (line) => {
				const wasFrontier = progress.solveDone === screen.i;
				progress.markSolve(screen.i, line);
				if (wasFrontier && screen.i + 1 < SOLVE.length) setScreen({
					t: "solve",
					i: screen.i + 1
				});
				else if (wasFrontier) setScreen({
					t: "model",
					which: 1
				});
				else if (screen.i + 1 < (screen.i < 3 ? 3 : SOLVE.length)) setScreen({
					t: "solve",
					i: screen.i + 1
				});
				else setScreen({ t: "map" });
			}
		}, puzzle.id);
	}
	if (screen.t === "model") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelRound, {
		which: screen.which,
		lamps,
		onBack: () => setScreen({ t: "map" }),
		onDone: (line) => {
			progress.markModel(screen.which, line);
			setScreen({ t: "debrief" });
		}
	}, screen.which);
	if (screen.t === "debrief") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Debrief, {});
	if (screen.t === "extra") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Extra, { lamps });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, {});
}
function Gate() {
	const setName = useCalibre((s) => s.setName);
	const setScreen = useCalibre((s) => s.setScreen);
	const stored = useCalibre((s) => s.name);
	const [name, setLocal] = (0, import_react.useState)(stored);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Top, {
				title: "Calibre",
				kicker: "Equações de primeiro grau, no ritmo de uma linha."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 text-base leading-relaxed",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Uma linha de agência precisa saber quantas operações cabem por minuto. Isso se escreve com uma letra: o número que ainda não foi medido." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Calibre é um turno curto para ler essa escrita e deixar a letra sozinha. Sem prova. Sem pressa." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Se você acompanha uma frase até o fim, já acompanha uma equação. O resto é o mesmo gesto, dos dois lados." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: "Pode errar. Uma jogada que preserva a igualdade continua sendo matemática."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-8",
				onSubmit: (event) => {
					event.preventDefault();
					setName(name.trim());
					setScreen({ t: "map" });
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-sm text-muted",
						htmlFor: "turno-name",
						children: "Seu nome no turno"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "turno-name",
						value: name,
						onChange: (event) => setLocal(event.target.value),
						maxLength: 24,
						placeholder: "Pode ficar em branco",
						className: "mt-2 min-h-12 w-full rounded-card border border-line bg-panel px-4 text-bone outline-none placeholder:text-faint"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
							type: "submit",
							children: "Entrar na linha"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
				className: "mt-2 w-full",
				onClick: () => setScreen({ t: "note" }),
				children: "Como a linha funciona"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
				className: "w-full",
				onClick: () => setScreen({ t: "companion" }),
				children: "Para quem acompanha"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-auto pt-8 text-sm text-faint",
				children: "Dá para sair no meio. O turno fica neste aparelho."
			})
		]
	});
}
function Map() {
	const progress = useCalibre();
	const [armReset, setArmReset] = (0, import_react.useState)(false);
	const lamps = lineState(progress);
	const buildOpen = true;
	const valueOpen = progress.buildDone >= BUILD.length;
	const balanceOpen = progress.valueDone >= VALUE.length;
	const isolateOpen = progress.solveDone >= 3;
	const modelOpen = progress.solveDone >= SOLVE.length;
	const extraOpen = progress.solveDone >= 3;
	const stations = [
		{
			title: "Leitura",
			detail: "Montar a expressão que a história pede.",
			open: buildOpen,
			done: progress.buildDone >= BUILD.length,
			go: () => progress.setScreen({
				t: "build",
				i: progress.buildDone >= BUILD.length ? 0 : progress.buildDone
			})
		},
		{
			title: "Substituição",
			detail: "Trocar a letra por um número e calcular.",
			open: valueOpen,
			done: progress.valueDone >= VALUE.length,
			go: () => progress.setScreen({
				t: "value",
				i: progress.valueDone >= VALUE.length ? 0 : progress.valueDone
			})
		},
		{
			title: "Os dois lados",
			detail: "Mexer na igualdade sem quebrá-la.",
			open: balanceOpen,
			done: progress.solveDone >= 3,
			go: () => {
				if (!progress.principle) {
					progress.setScreen({ t: "principle" });
					return;
				}
				const i = progress.solveDone >= 3 ? 0 : progress.solveDone;
				progress.setScreen({
					t: "solve",
					i
				});
			}
		},
		{
			title: "Isolar",
			detail: "Quatro equações, sem trilho. Inclusive letra dos dois lados.",
			open: isolateOpen,
			done: progress.solveDone >= SOLVE.length,
			go: () => {
				const i = progress.solveDone >= SOLVE.length ? 3 : Math.max(3, progress.solveDone);
				progress.setScreen({
					t: "solve",
					i
				});
			}
		},
		{
			title: "Turno da agência",
			detail: "Ler o problema. Só então isolar.",
			open: modelOpen,
			done: progress.modelDone,
			go: () => progress.setScreen({
				t: "model",
				which: 1
			})
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Top, {
				title: progress.name ? progress.name : "A linha",
				kicker: "Cinco estações. Um turno. Sem nota.",
				lamps
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: stations.map((station, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						if (!station.open) {
							progress.setMapNote("A estação anterior deixa esta pronta. A linha é curta.");
							return;
						}
						progress.setMapNote("");
						station.go();
					},
					className: "flex w-full items-start gap-4 rounded-card border border-line bg-panel px-4 py-4 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-0.5 font-mono text-sm text-amber",
						children: ["0", index + 1]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block text-base font-semibold",
							children: [
								station.title,
								station.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 text-sm font-medium text-moss",
									children: "em ritmo"
								}) : null,
								!station.open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 text-sm font-medium text-faint",
									children: "fechada"
								}) : null
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-sm leading-relaxed text-muted",
							children: station.detail
						})]
					})]
				}, station.title))
			}),
			progress.notebook.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-card border border-line bg-panel px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-amber",
					children: "FOLHA"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-1 font-mono text-sm text-bone",
					children: progress.notebook.slice(-3).map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, line))
				})]
			}) : null,
			progress.mapNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-clay",
				"aria-live": "polite",
				children: progress.mapNote
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-faint",
				children: "Sai no meio se quiser. Quando voltar, a linha está onde você deixou."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col",
				children: [
					extraOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Ghost, {
						className: "w-full justify-start",
						onClick: () => progress.setScreen({ t: "extra" }),
						children: ["Hora extra · traquejo sem história", progress.extraSolved > 0 ? ` · ${progress.extraSolved}` : ""]
					}) : null,
					progress.modelDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
						className: "w-full justify-start",
						onClick: () => progress.setScreen({ t: "debrief" }),
						children: "Nota de turno"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
						className: "w-full justify-start",
						onClick: () => progress.setScreen({ t: "note" }),
						children: "Como a linha funciona"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
						className: "w-full justify-start",
						onClick: () => {
							if (!armReset) {
								setArmReset(true);
								return;
							}
							progress.reset();
							setArmReset(false);
						},
						children: armReset ? "Confirmar: zerar o turno" : "Recomeçar o turno"
					})
				]
			})
		]
	});
}
function Principle() {
	const markPrinciple = useCalibre((s) => s.markPrinciple);
	const setScreen = useCalibre((s) => s.setScreen);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Top, {
				title: "O sinal de igual",
				kicker: "Antes de mexer",
				onBack: () => setScreen({ t: "map" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 text-base leading-relaxed",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Uma expressão é uma conta com um lugar vazio. 30s + 12 ainda não é uma pergunta." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Uma equação diz: esta conta vale este número. Os dois lados se chamam membros. Esquerdo e direito." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A letra é a incógnita — o valor que a linha ainda não mediu. Na escola o nome é esse. Aqui também." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Você pode mudar a equação se fizer a mesma coisa nos dois membros. Tirar 9 dos dois. Dividir os dois por 4. A incógnita não muda. Só fica mais fácil de ver." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Passar um termo para o outro lado é esse gesto, feito de uma vez. O sinal troca porque o termo saiu de um membro e foi compensado no outro." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-auto pt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
					onClick: () => {
						markPrinciple();
						setScreen({
							t: "solve",
							i: 0
						});
					},
					children: "Ver isso na linha"
				})
			})
		]
	});
}
function Debrief() {
	const progress = useCalibre();
	const lamps = lineState(progress);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Top, {
				title: progress.modelDone ? "Linha em ritmo" : "Nota de turno",
				kicker: progress.name ? `Turno de ${progress.name}` : "Turno",
				onBack: () => progress.setScreen({ t: "map" }),
				lamps
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-base leading-relaxed",
				children: "Você leu expressões, trocou letra por número e isolou a incógnita sem romper a igualdade. Não foi prova. Foi ajuste."
			}),
			progress.notebook.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-card bg-bone p-4 text-ink-bone",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-quiet",
					children: "FOLHA DO TURNO"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2 font-mono text-sm leading-relaxed",
					children: progress.notebook.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, line))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "mt-4 rounded-card border border-line bg-panel p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-amber",
					children: "PARA A PRÓXIMA AULA"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: lessonNote(progress)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-auto space-y-2 pt-6",
				children: [
					!progress.model2Done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
						onClick: () => progress.setScreen({
							t: "model",
							which: 2
						}),
						children: "Segundo chamado"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
						onClick: () => progress.setScreen({ t: "extra" }),
						children: "Ficar mais um pouco"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
						className: "w-full",
						onClick: () => progress.setScreen({ t: "map" }),
						children: "Voltar à linha"
					}),
					progress.model2Done ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
						className: "w-full",
						onClick: () => progress.setScreen({ t: "extra" }),
						children: "Hora extra, sem história"
					})
				]
			})
		]
	});
}
function Extra({ lamps }) {
	const extraSolved = useCalibre((s) => s.extraSolved);
	const addExtra = useCalibre((s) => s.addExtra);
	const setScreen = useCalibre((s) => s.setScreen);
	const spec = extraPuzzle(extraSolved);
	const puzzle = {
		id: `extra-${spec.seed}`,
		kicker: "Hora extra",
		story: "Sem narrativa nova. Só o gesto, até a letra ficar sozinha. Sai quando quiser.",
		equation: spec.equation,
		expect: spec.expect,
		mode: "free",
		insight: "Traquejo. O próximo não cobra nota."
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SolveRound, {
		puzzle,
		lamps,
		timed: true,
		onBack: () => setScreen({ t: "map" }),
		onDone: (line) => addExtra(line)
	}, spec.seed);
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalibreApp, {});
}
//#endregion
export { Home as component };
