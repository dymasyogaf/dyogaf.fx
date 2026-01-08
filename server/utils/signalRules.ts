type SignalReason = {
  key: string;
  label: string;
  pass: boolean;
  detail: string;
};

type MarketSnapshot = {
  last: number;
  change15m: number | null;
  change1h: number | null;
  volume24h: number;
  ticker: {
    high: string;
    low: string;
    buy: string;
    sell: string;
  };
};

const getSpreadPercent = (last: number, buy: number, sell: number) => {
  if (!last) return 0;
  return ((sell - buy) / last) * 100;
};

export const buildSignal = (market: MarketSnapshot) => {
  const { last, change15m, change1h, volume24h, ticker } = market;
  const high = Number(ticker.high);
  const low = Number(ticker.low);
  const buy = Number(ticker.buy);
  const sell = Number(ticker.sell);
  const spread = getSpreadPercent(last, buy, sell);

  const range = Math.max(high - low, 1);
  const pullbackRatio = (last - low) / range;
  const trendOk = (change1h ?? 0) > 0.2;
  const pullbackOk = pullbackRatio >= 0.35 && pullbackRatio <= 0.6;
  const confirmOk = (change15m ?? -1) >= 0;
  const volumeOk = volume24h >= 50_000_000 && spread <= 1.2;
  const riskOk = ((last - low) / last) <= 0.03;

  const illiquid = volume24h < 25_000_000 || spread > 1.2;
  const tooVolatile = Math.abs(change15m ?? 0) >= 6;

  let status = "WAIT";
  if (trendOk && pullbackOk && confirmOk && volumeOk && riskOk) status = "BUY";
  if ((change1h ?? 0) < -0.6 && (change15m ?? 0) < -0.3) status = "SELL";
  if (illiquid || tooVolatile) status = "WAIT";

  const missingHistory = change15m === null || change1h === null;

  let headline = "Menunggu sinyal lengkap";
  if (missingHistory) headline = "Mengumpulkan data 15m/1h";
  if (illiquid) headline = "Likuiditas rendah / spread tinggi";
  else if (tooVolatile) headline = "Terlalu volatil, tunggu stabil";
  else if (status === "BUY") headline = "Sinyal pullback aman";
  else if (status === "SELL") headline = "Momentum melemah, kurangi risiko";
  else if (!confirmOk) headline = "Menunggu confirmation candle";

  const reasons: SignalReason[] = [
    {
      key: "trend",
      label: "Trend OK",
      pass: trendOk,
      detail: missingHistory
        ? "Data 1 jam belum cukup"
        : "Change 1 jam sudah positif"
    },
    {
      key: "pullback",
      label: "Pullback Zone OK",
      pass: pullbackOk,
      detail: "Harga berada di area pullback yang wajar"
    },
    {
      key: "confirm",
      label: "Confirmation Candle OK",
      pass: confirmOk,
      detail: missingHistory
        ? "Menunggu candle berjalan"
        : "Candle terbaru tidak merah tajam"
    },
    {
      key: "volume",
      label: "Volume Healthy",
      pass: volumeOk,
      detail: "Volume cukup dan spread masih aman"
    },
    {
      key: "risk",
      label: "Risk OK (SL dekat)",
      pass: riskOk,
      detail: "Jarak ke low masih dekat untuk SL"
    }
  ];

  return {
    status,
    headline,
    reasons,
    guard: illiquid ? "illiquid" : tooVolatile ? "too_volatile" : ""
  };
};
