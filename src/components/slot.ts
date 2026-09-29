// Slots de identidade: a cor pertence à POSIÇÃO na comparação (A/B/C),
// nunca ao candidato — trocar de slot troca a cor. Matizes de mesmo peso
// e croma para não comunicar hierarquia entre candidatos.
export const SLOT = {
  a: {
    text: "text-[#0e7177]",
    bg: "bg-[#0e7177]",
    bgSoft: "bg-[#0e7177]/8",
    border: "border-[#0e7177]",
    borderSoft: "border-[#0e7177]/25",
    bar: "bg-[#0e7177]",
  },
  b: {
    text: "text-[#8a4e15]",
    bg: "bg-[#a65b14]",
    bgSoft: "bg-[#a65b14]/8",
    border: "border-[#a65b14]",
    borderSoft: "border-[#a65b14]/25",
    bar: "bg-[#a65b14]",
  },
  c: {
    text: "text-[#6b4e9b]",
    bg: "bg-[#6b4e9b]",
    bgSoft: "bg-[#6b4e9b]/8",
    border: "border-[#6b4e9b]",
    borderSoft: "border-[#6b4e9b]/25",
    bar: "bg-[#6b4e9b]",
  },
} as const;

export type SlotKey = keyof typeof SLOT;

export function slotOf(index: number): SlotKey {
  return (["a", "b", "c"] as SlotKey[])[index] ?? "a";
}
