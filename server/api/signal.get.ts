import { createError, defineEventHandler, getQuery } from "h3";
import { normalizePair } from "../utils/pairs";
import { getMarketSnapshot } from "../utils/marketStore";
import { enforceRateLimit } from "../utils/rateLimit";
import { buildSignal } from "../utils/signalRules";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const pair = normalizePair(String(query.pair ?? ""));

  if (!pair) {
    throw createError({
      statusCode: 400,
      statusMessage: "Unsupported pair"
    });
  }

  enforceRateLimit(event, `signal:${pair}`, 30, 60_000);

  try {
    const market = await getMarketSnapshot(pair);
    const signal = buildSignal(market);

    return {
      pair,
      timeframe: "15m",
      status: signal.status,
      headline: signal.headline,
      reasons: signal.reasons,
      inputs: {
        last: market.last,
        change15m: market.change15m,
        change1h: market.change1h,
        volume24h: market.volume24h
      },
      updatedAt: market.lastUpdated
    };
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "Failed to fetch Indodax signal"
    });
  }
});
