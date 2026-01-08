type SignalReason = {
  key: string;
  label: string;
  pass: boolean;
  detail: string;
};

type MarketTicker = {
  last: string;
  high: string;
  low: string;
  vol_idr: string;
  buy: string;
  sell: string;
};

type MarketSnapshot = {
  pair: string;
  last: number;
  change15m: number | null;
  change1h: number | null;
  volume24h: number;
  lastUpdated: string;
  lastUpdatedWib: string;
  ticker: MarketTicker;
};

type MarketSignalResponse = {
  pair: string;
  timeframe: string;
  market: MarketSnapshot;
  signal: {
    status: string;
    headline: string;
    reasons: SignalReason[];
  };
  updatedAt: string;
};

const RATE_LIMIT_COOLDOWN_MS = 10_000;

export function useMarketSignal(pair: Ref<string>, pollMs = 5000) {
  const data = ref<MarketSignalResponse | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const rateLimited = ref(false);
  const nextAllowedAt = ref(0);

  const fetchMarketSignal = async (forceLoading = false) => {
    const now = Date.now();
    if (now < nextAllowedAt.value) return;

    if (forceLoading || !data.value) {
      loading.value = true;
    }
    error.value = null;
    rateLimited.value = false;

    try {
      const response = await $fetch<MarketSignalResponse>("/api/market-signal", {
        query: { pair: pair.value }
      });
      data.value = response;
    } catch (err) {
      const status =
        (err as { statusCode?: number })?.statusCode ??
        (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) {
        rateLimited.value = true;
        error.value = "Terlalu sering update, tunggu sebentar.";
        nextAllowedAt.value = now + RATE_LIMIT_COOLDOWN_MS;
      } else {
        error.value = "Gagal mengambil data. Coba refresh.";
      }
    } finally {
      if (forceLoading || !data.value) {
        loading.value = false;
      }
    }
  };

  const refresh = async () => {
    await fetchMarketSignal(true);
  };

  let interval: ReturnType<typeof setInterval> | null = null;
  const startPolling = () => {
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      fetchMarketSignal(false);
    }, pollMs);
  };

  watch(
    pair,
    async () => {
      await fetchMarketSignal(true);
      startPolling();
    },
    { immediate: true }
  );

  onMounted(() => {
    startPolling();
  });

  onBeforeUnmount(() => {
    if (interval) clearInterval(interval);
  });

  return {
    data,
    loading,
    error,
    refresh,
    rateLimited
  };
}
