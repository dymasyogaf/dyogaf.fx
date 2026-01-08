export type TimeframeOption = {
  label: string;
  minutes: number;
};

export const timeframeOptions: TimeframeOption[] = [
  { label: "3 menit", minutes: 3 },
  { label: "15 menit", minutes: 15 },
  { label: "30 menit", minutes: 30 },
  { label: "60 menit", minutes: 60 },
  { label: "1 hari", minutes: 1440 },
  { label: "7 hari", minutes: 10080 },
  { label: "30 hari", minutes: 43200 }
];

export const normalizeTimeframe = (value: string | number | undefined) => {
  const minutes = Number(value ?? 15);
  return timeframeOptions.find((option) => option.minutes === minutes) ?? null;
};

export const formatTimeframeLabel = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  if (minutes === 60) return "1h";
  if (minutes === 1440) return "1D";
  if (minutes === 10080) return "7D";
  if (minutes === 43200) return "30D";
  return `${minutes}m`;
};
