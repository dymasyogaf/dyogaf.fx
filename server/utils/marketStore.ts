import { $fetch } from "ofetch";
import type { AllowedPair } from "./pairs";

type TickerPayload = {
  last: string;
  high: string;
  low: string;
  vol_idr: string;
  buy: string;
  sell: string;
};

type HistoryPoint = { t: number; price: number };

const CACHE_TTL_MS = 3000;
const HISTORY_WINDOW_MS = 2 * 60 * 60 * 1000;
const HISTORY_MAX_POINTS = 1000;

const tickerCache = new Map<string, { t: number; data: TickerPayload }>();
const priceHistory = new Map<string, HistoryPoint[]>();

const recordHistory = (pair: AllowedPair, price: number) => {
  const now = Date.now();
  const list = priceHistory.get(pair) ?? [];
  list.push({ t: now, price });
  const cutoff = now - HISTORY_WINDOW_MS;
  const trimmed = list.filter((item) => item.t >= cutoff).slice(-HISTORY_MAX_POINTS);
  priceHistory.set(pair, trimmed);
};

const getChange = (pair: AllowedPair, minutes: number, latest: number) => {
  const list = priceHistory.get(pair) ?? [];
  if (!list.length) return null;
  const target = Date.now() - minutes * 60 * 1000;
  const past = [...list].reverse().find((item) => item.t <= target);
  if (!past || !past.price) return null;
  return ((latest - past.price) / past.price) * 100;
};

export const fetchTicker = async (pair: AllowedPair) => {
  const key = `ticker:${pair}`;
  const cached = tickerCache.get(key);
  const now = Date.now();
  if (cached && now - cached.t < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `https://indodax.com/api/ticker/${pair}`;
  const response = await $fetch<{ ticker: TickerPayload }>(url);
  const ticker = response.ticker;
  tickerCache.set(key, { t: now, data: ticker });

  const lastPrice = Number(ticker.last);
  if (lastPrice) {
    recordHistory(pair, lastPrice);
  }

  return ticker;
};

export const getMarketSnapshot = async (pair: AllowedPair) => {
  const ticker = await fetchTicker(pair);
  const last = Number(ticker.last);
  const change15m = last ? getChange(pair, 15, last) : null;
  const change1h = last ? getChange(pair, 60, last) : null;
  const volume24h = Number(ticker.vol_idr);

  const lastUpdated = new Date();
  const lastUpdatedWib = lastUpdated.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "short"
  });

  return {
    pair,
    last,
    change15m,
    change1h,
    volume24h,
    lastUpdated: lastUpdated.toISOString(),
    lastUpdatedWib,
    ticker
  };
};
