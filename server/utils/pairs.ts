export const allowedPairs = [
  "pepeidr",
  "dogeidr",
  "shibidr",
  "flokiidr",
  "bonkidr"
] as const;

export type AllowedPair = (typeof allowedPairs)[number];

export const pairOptions = allowedPairs.map((value) => ({
  value,
  label: `${value.replace("idr", "").toUpperCase()}/IDR`
}));

export const normalizePair = (pair: string): AllowedPair | null => {
  const normalized = pair.toLowerCase().trim();
  return allowedPairs.includes(normalized as AllowedPair)
    ? (normalized as AllowedPair)
    : null;
};
