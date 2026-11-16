export function Keypad({ onKey }: { onKey: (key: string) => void }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "0", "⌫"];
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onKey(key)}
          className="min-h-12 rounded-2xl bg-panel font-mono text-lg text-bone"
          aria-label={key === "⌫" ? "Apagar" : key === "-" ? "Trocar sinal" : key}
        >
          {key === "-" ? "−" : key}
        </button>
      ))}
    </div>
  );
}

export function pushDigit(current: string, key: string): string {
  if (key === "⌫") return current.slice(0, -1);
  if (key === "-") {
    if (current.startsWith("-")) return current.slice(1);
    return `-${current}`;
  }
  const digits = current.replace("-", "");
  if (digits.length >= 5) return current;
  if (current === "0") return key;
  if (current === "-0") return `-${key}`;
  return current + key;
}

export function readNumber(raw: string): number | null {
  if (raw === "" || raw === "-") return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  return value;
}
