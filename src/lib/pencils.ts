export const PENCILS = [
  "var(--color-pencil-blue)",
  "var(--color-pencil-red)",
  "var(--color-pencil-green)",
  "var(--color-pencil-purple)",
  "var(--color-pencil-orange)",
  "var(--color-pencil-pink)",
] as const;

export const pencilAt = (i: number) => PENCILS[i % PENCILS.length];
