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

  enforceRateLimit(event, `market-signal:${pair}`, 30, 60_000);

  try {
    const market = await getMarketSnapshot(pair);
    const signal = buildSignal(market);

    return {
      pair,
      timeframe: "15m",
      market,
      signal: {
        status: signal.status,
        headline: signal.headline,
        reasons: signal.reasons
      },
      updatedAt: market.lastUpdated
    };
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "Failed to fetch Indodax market signal"
    });
  }
});
