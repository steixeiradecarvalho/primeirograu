import { create } from "zustand";
import { BUILD, SOLVE, STATION_GUIDED, VALUE } from "./content";

const KEY = "calibre-turno-v1";

export type Screen =
  | { t: "gate" }
  | { t: "note" }
  | { t: "companion" }
  | { t: "map" }
  | { t: "build"; i: number }
  | { t: "value"; i: number }
  | { t: "principle" }
  | { t: "solve"; i: number }
  | { t: "model"; which: 1 | 2 }
  | { t: "debrief" }
  | { t: "extra" };

export type Progress = {
  version: 1;
  name: string;
  buildDone: number;
  valueDone: number;
  principle: boolean;
  solveDone: number;
  modelDone: boolean;
  model2Done: boolean;
  modelMisses: number;
  extraSolved: number;
  hints: number;
  stallsById: Record<string, number>;
  hintsById: Record<string, number>;
  notebook: string[];
  showTime: boolean;
};

const blank = (): Progress => ({
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
  showTime: false,
});

type Store = Progress & {
  hydrated: boolean;
  screen: Screen;
  mapNote: string;
  hydrate: () => void;
  setScreen: (screen: Screen) => void;
  setMapNote: (mapNote: string) => void;
  setName: (name: string) => void;
  markBuild: (i: number, line: string) => void;
  markValue: (i: number, line: string) => void;
  markPrinciple: () => void;
  markSolve: (i: number, line: string) => void;
  markModel: (which: 1 | 2, line: string) => void;
  addModelMiss: () => void;
  addHint: (id: string) => void;
  addStall: (id: string) => void;
  addExtra: (line: string) => void;
  setShowTime: (showTime: boolean) => void;
  reset: () => void;
};

function asRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, number> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "number" && Number.isFinite(entry)) out[key] = Math.max(0, Math.floor(entry));
  }
  return out;
}

function asLines(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((line): line is string => typeof line === "string").slice(-20);
}

function asCount(value: unknown, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(0, Math.floor(value)));
}

function pick(s: Store): Progress {
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
    showTime: s.showTime,
  };
}

function persist(progress: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    /* private mode */
  }
}

function withLine(list: string[], line: string): string[] {
  if (!line || list[list.length - 1] === line) return list;
  return [...list, line].slice(-20);
}

function bump(map: Record<string, number>, id: string): Record<string, number> {
  return { ...map, [id]: (map[id] ?? 0) + 1 };
}

export function lineState(progress: Progress): { lit: number; active: number } {
  const flags = [
    progress.buildDone >= BUILD.length,
    progress.valueDone >= VALUE.length,
    progress.solveDone >= STATION_GUIDED,
    progress.solveDone >= SOLVE.length,
    progress.modelDone,
  ];
  const lit = flags.filter(Boolean).length;
  const active = flags.findIndex((flag) => !flag);
  return { lit, active: active === -1 ? 4 : active };
}

export const useCalibre = create<Store>((set, get) => ({
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
        const saved = JSON.parse(raw) as Partial<Progress>;
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
    } catch {
      /* keep blank */
    }
    const started =
      base.name.length > 0 ||
      base.buildDone > 0 ||
      base.valueDone > 0 ||
      base.principle ||
      base.solveDone > 0;
    set({ ...base, hydrated: true, screen: started ? { t: "map" } : { t: "gate" }, mapNote: "" });
  },
  setScreen: (screen) => set({ screen, mapNote: "" }),
  setMapNote: (mapNote) => set({ mapNote }),
  setName: (name) => {
    const next = { ...pick(get()), name: name.slice(0, 24) };
    persist(next);
    set(next);
  },
  markBuild: (i, line) => {
    const next = {
      ...pick(get()),
      buildDone: Math.max(get().buildDone, Math.min(BUILD.length, i + 1)),
      notebook: withLine(get().notebook, line),
    };
    persist(next);
    set(next);
  },
  markValue: (i, line) => {
    const next = {
      ...pick(get()),
      valueDone: Math.max(get().valueDone, Math.min(VALUE.length, i + 1)),
      notebook: withLine(get().notebook, line),
    };
    persist(next);
    set(next);
  },
  markPrinciple: () => {
    const next = { ...pick(get()), principle: true };
    persist(next);
    set(next);
  },
  markSolve: (i, line) => {
    const next = {
      ...pick(get()),
      solveDone: Math.max(get().solveDone, Math.min(SOLVE.length, i + 1)),
      notebook: withLine(get().notebook, line),
    };
    persist(next);
    set(next);
  },
  markModel: (which, line) => {
    const next = {
      ...pick(get()),
      modelDone: which === 1 ? true : get().modelDone,
      model2Done: which === 2 ? true : get().model2Done,
      notebook: withLine(get().notebook, line),
    };
    persist(next);
    set(next);
  },
  addModelMiss: () => {
    const next = { ...pick(get()), modelMisses: get().modelMisses + 1 };
    persist(next);
    set(next);
  },
  addHint: (id) => {
    const next = {
      ...pick(get()),
      hints: get().hints + 1,
      hintsById: bump(get().hintsById, id),
    };
    persist(next);
    set(next);
  },
  addStall: (id) => {
    const next = { ...pick(get()), stallsById: bump(get().stallsById, id) };
    persist(next);
    set(next);
  },
  addExtra: (line) => {
    const next = {
      ...pick(get()),
      extraSolved: get().extraSolved + 1,
      notebook: withLine(get().notebook, line),
    };
    persist(next);
    set(next);
  },
  setShowTime: (showTime) => {
    const next = { ...pick(get()), showTime };
    persist(next);
    set(next);
  },
  reset: () => {
    const next = { ...blank(), name: get().name };
    persist(next);
    set({ ...next, hydrated: true, screen: { t: "map" }, mapNote: "Turno zerado. A linha espera de novo." });
  },
}));
