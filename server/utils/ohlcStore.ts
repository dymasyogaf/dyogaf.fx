import { $fetch } from "ofetch";
import type { AllowedPair } from "./pairs";

type HistoryResponse = {
  s: string;
  t?: number[];
  o?: number[];
  h?: number[];
  l?: number[];
  c?: number[];
  v?: number[];
};

export type Candle = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number | null;
};

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { t: number; data: Candle[] }>();

const buildCandles = (payload: HistoryResponse) => {
  if (!payload || payload.s !== "ok") return [];
  const times = payload.t ?? [];
  const o = payload.o ?? [];
  const h = payload.h ?? [];
  const l = payload.l ?? [];
  const c = payload.c ?? [];
  const v = payload.v ?? [];

  return times.map((time, idx) => ({
    t: time,
    o: Number(o[idx] ?? 0),
    h: Number(h[idx] ?? 0),
    l: Number(l[idx] ?? 0),
    c: Number(c[idx] ?? 0),
    v: v[idx] !== undefined ? Number(v[idx]) : null
  }));
};

export const fetchOhlc = async (
  pair: AllowedPair,
  tfMinutes: number,
  limit: number
) => {
  const key = `${pair}:${tfMinutes}:${limit}`;
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.t < CACHE_TTL_MS) {
    return cached.data;
  }

  const to = Math.floor(now / 1000);
  const from = to - tfMinutes * 60 * limit;
  const symbol = pair.toUpperCase();
  const url = `https://indodax.com/tradingview/history_v2?from=${from}&to=${to}&symbol=${symbol}&tf=${tfMinutes}`;

  const response = await $fetch<HistoryResponse>(url);
  const candles = buildCandles(response);
  cache.set(key, { t: now, data: candles });
  return candles;
};
