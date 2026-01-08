type MarketTicker = {
  last: string;
  high: string;
  low: string;
  vol_idr: string;
  buy: string;
  sell: string;
};

export type MarketSnapshot = {
  pair: string;
  last: number;
  changeShort: number | null;
  changeLong: number | null;
  changeShortMinutes: number;
  changeLongMinutes: number;
  volume24h: number;
  lastUpdated: string;
  lastUpdatedWib: string;
  ticker: MarketTicker;
};

const RATE_LIMIT_COOLDOWN_MS = 10_000;

export function useMarket(pair: Ref<string>, pollMs = 5000) {
  const market = ref<MarketSnapshot | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const rateLimited = ref(false);
  const nextAllowedAt = ref(0);

  const fetchMarket = async (forceLoading = false) => {
    const now = Date.now();
    if (now < nextAllowedAt.value) return;

    if (forceLoading || !market.value) {
      loading.value = true;
    }
    error.value = null;
    rateLimited.value = false;

    try {
      const response = await $fetch<MarketSnapshot>("/api/market", {
        query: { pair: pair.value }
      });
      market.value = response;
    } catch (err) {
      const status =
        (err as { statusCode?: number })?.statusCode ??
        (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) {
        rateLimited.value = true;
        error.value = "Terlalu sering update, tunggu sebentar.";
        nextAllowedAt.value = now + RATE_LIMIT_COOLDOWN_MS;
      } else {
        error.value = "Gagal mengambil data Indodax. Coba refresh.";
      }
    } finally {
      if (forceLoading || !market.value) {
        loading.value = false;
      }
    }
  };

  const refresh = async () => {
    await fetchMarket(true);
  };

  let interval: ReturnType<typeof setInterval> | null = null;
  const startPolling = () => {
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      fetchMarket(false);
    }, pollMs);
  };

  watch(
    pair,
    async () => {
      await fetchMarket(true);
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
    market,
    loading,
    error,
    refresh,
    rateLimited
  };
}
