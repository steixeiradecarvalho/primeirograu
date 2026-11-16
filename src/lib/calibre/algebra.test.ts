import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addConstBoth,
  distribute,
  divisors,
  eq,
  formatEquation,
  identical,
  isSolved,
  moveNode,
  prod,
  progressScore,
  term,
  tryDivide,
  type Equation,
} from "./algebra.ts";
import { BUILD, MODEL, MODEL_2, SOLVE, extraPuzzle } from "./content.ts";

function autoSolve(equation: Equation): number | null {
  const seen = new Set<string>();
  const walk = (current: Equation, depth: number): number | null => {
    const key = formatEquation(current);
    if (seen.has(key)) return null;
    seen.add(key);
    const done = isSolved(current);
    if (done !== null) return done;
    if (depth > 12) return null;
    const score = progressScore(current);
    const options: Equation[] = [];
    if ([...current.L, ...current.R].some((n) => n.k === "p")) options.push(distribute(current));
    for (const d of divisors(current)) {
      const next = tryDivide(current, d);
      if (next) options.push(next);
    }
    options.push({ ...current, L: current.L.map((n) => (n.k === "t" ? term(n.c * -1, n.v) : prod(n.m * -1, n.inner))), R: current.R.map((n) => (n.k === "t" ? term(n.c * -1, n.v) : prod(n.m * -1, n.inner))) });
    for (const side of ["L", "R"] as const) {
      current[side].forEach((_, index) => {
        options.push(moveNode(current, side, index).eq);
      });
    }
    for (const option of options) {
      const normalized = option.varName ? option : option;
      if (progressScore(normalized) > score) continue;
      const found = walk(normalized, depth + 1);
      if (found !== null) return found;
    }
    return null;
  };
  return walk(equation, 0);
}

describe("calibre algebra", () => {
  it("formats the school forms", () => {
    assert.equal(formatEquation(SOLVE[0]!.equation), "n + 9 = 21");
    assert.equal(formatEquation(SOLVE[1]!.equation), "4t = 28");
    assert.equal(formatEquation(SOLVE[2]!.equation), "2x + 6 = 20");
    assert.equal(formatEquation(SOLVE[3]!.equation), "x - 8 = 13");
    assert.equal(formatEquation(SOLVE[4]!.equation), "3x + 4 = 19");
    assert.equal(formatEquation(SOLVE[5]!.equation), "2(x + 5) = 24");
    assert.equal(formatEquation(SOLVE[6]!.equation), "4x + 3 = 2x + 15");
    assert.equal(formatEquation(MODEL.choices[0]!.equation), "15n + 40 = 160");
    assert.equal(formatEquation(MODEL_2.choices[0]!.equation), "2f - 6 = 18");
  });

  it("keeps both sides honest on the guided moves", () => {
    const stepped = addConstBoth(SOLVE[0]!.equation, -9).eq;
    assert.equal(isSolved(stepped), 12);
    const divided = tryDivide(SOLVE[1]!.equation, 4);
    assert.equal(divided && isSolved(divided), 7);
  });

  it("accepts both paths through parentheses", () => {
    const opened = distribute(SOLVE[5]!.equation);
    assert.equal(formatEquation(opened), "2x + 10 = 24");
    const divided = tryDivide(SOLVE[5]!.equation, 2);
    assert.ok(divided);
    assert.equal(formatEquation(divided), "x + 5 = 12");
  });

  it("flips the sign when a term changes side and merges like terms", () => {
    const moved = moveNode(SOLVE[6]!.equation, "R", 0);
    assert.equal(moved.merged, true);
    assert.equal(formatEquation(moved.eq), "2x + 3 = 15");
    const cleared = moveNode(SOLVE[3]!.equation, "L", 1);
    assert.equal(formatEquation(cleared.eq), "x = 21");
    assert.equal(isSolved(cleared.eq), 21);
  });

  it("treats expanded and packed expressions as the same amount", () => {
    const packed = BUILD[2]!.target;
    assert.equal(identical(packed, [term(3, 1), term(6, 0)]), true);
    assert.equal(identical(packed, [term(3, 1), term(2, 0)]), false);
  });

  it("solves every shift equation to the expected integer", () => {
    for (const puzzle of SOLVE) {
      assert.equal(autoSolve(puzzle.equation), puzzle.expect, puzzle.id);
    }
    assert.equal(autoSolve(MODEL.choices[0]!.equation), MODEL.expect);
    assert.equal(autoSolve(MODEL_2.choices[0]!.equation), MODEL_2.expect);
    for (let seed = 0; seed < 24; seed += 1) {
      const extra = extraPuzzle(seed);
      assert.equal(autoSolve(extra.equation), extra.expect, `extra ${seed} ${formatEquation(extra.equation)}`);
    }
  });

  it("refuses a division that would break the integers", () => {
    assert.deepEqual(divisors(SOLVE[4]!.equation), []);
    assert.equal(tryDivide(SOLVE[4]!.equation, 3), null);
    assert.deepEqual(divisors(eq("x", [term(2, 1), term(10, 0)], [term(24, 0)])), [2]);
  });
});
