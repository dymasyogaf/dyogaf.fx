import { createError, defineEventHandler, getQuery } from "h3";
import { normalizePair } from "../utils/pairs";
import { getMarketSnapshot } from "../utils/marketStore";
import { enforceRateLimit } from "../utils/rateLimit";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const pair = normalizePair(String(query.pair ?? ""));

  if (!pair) {
    throw createError({
      statusCode: 400,
      statusMessage: "Unsupported pair"
    });
  }

  enforceRateLimit(event, `market:${pair}`, 30, 60_000);

  try {
    return await getMarketSnapshot(pair);
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "Failed to fetch Indodax market data"
    });
  }
});
