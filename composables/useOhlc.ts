type Candle = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number | null;
};

type OhlcResponse = {
  pair: string;
  tf: number;
  candles: Candle[];
  updatedAt: string;
};

const RATE_LIMIT_COOLDOWN_MS = 10_000;

export function useOhlc(pair: Ref<string>, tf = 15, limit = 96, pollMs = 60_000) {
  const candles = ref<Candle[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const rateLimited = ref(false);
  const nextAllowedAt = ref(0);

  const fetchOhlc = async (forceLoading = false) => {
    const now = Date.now();
    if (now < nextAllowedAt.value) return;

    if (forceLoading || !candles.value.length) {
      loading.value = true;
    }
    error.value = null;
    rateLimited.value = false;

    try {
      const response = await $fetch<OhlcResponse>("/api/ohlc", {
        query: { pair: pair.value, tf, limit }
      });
      candles.value = response.candles ?? [];
    } catch (err) {
      const status =
        (err as { statusCode?: number })?.statusCode ??
        (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) {
        rateLimited.value = true;
        error.value = "Terlalu sering update, tunggu sebentar.";
        nextAllowedAt.value = now + RATE_LIMIT_COOLDOWN_MS;
      } else {
        error.value = "Gagal mengambil data chart.";
      }
    } finally {
      if (forceLoading || !candles.value.length) {
        loading.value = false;
      }
    }
  };

  const refresh = async () => {
    await fetchOhlc(true);
  };

  let interval: ReturnType<typeof setInterval> | null = null;
  const startPolling = () => {
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      fetchOhlc(false);
    }, pollMs);
  };

  watch(
    pair,
    async () => {
      await fetchOhlc(true);
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
    candles,
    loading,
    error,
    refresh,
    rateLimited
  };
}
