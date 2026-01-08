import { createError, defineEventHandler, getQuery } from "h3";
import { normalizePair } from "../utils/pairs";
import { enforceRateLimit } from "../utils/rateLimit";
import { fetchOhlc } from "../utils/ohlcStore";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const pair = normalizePair(String(query.pair ?? ""));
  const tf = Number(query.tf ?? 15);
  const limit = Math.min(Number(query.limit ?? 96), 1000);

  if (!pair) {
    throw createError({
      statusCode: 400,
      statusMessage: "Unsupported pair"
    });
  }

  if (!Number.isFinite(tf) || tf !== 15) {
    throw createError({
      statusCode: 400,
      statusMessage: "Unsupported timeframe"
    });
  }

  if (!Number.isFinite(limit) || limit <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid limit"
    });
  }

  enforceRateLimit(event, `ohlc:${pair}:${tf}`, 20, 60_000);

  try {
    const candles = await fetchOhlc(pair, tf, limit);
    return {
      pair,
      tf,
      candles,
      updatedAt: new Date().toISOString()
    };
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "Failed to fetch OHLC data"
    });
  }
});
