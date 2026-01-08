type SignalReason = {
  key: string;
  label: string;
  pass: boolean;
  detail: string;
};

export type SignalResponse = {
  pair: string;
  timeframe: string;
  status: string;
  headline: string;
  reasons: SignalReason[];
  inputs: {
    last: number;
    changeShort: number | null;
    changeLong: number | null;
    volume24h: number;
  };
  updatedAt: string;
};

const RATE_LIMIT_COOLDOWN_MS = 10_000;

export function useSignal(pair: Ref<string>, pollMs = 5000) {
  const signal = ref<SignalResponse | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const rateLimited = ref(false);
  const nextAllowedAt = ref(0);

  const fetchSignal = async (forceLoading = false) => {
    const now = Date.now();
    if (now < nextAllowedAt.value) return;

    if (forceLoading || !signal.value) {
      loading.value = true;
    }
    error.value = null;
    rateLimited.value = false;

    try {
      const response = await $fetch<SignalResponse>("/api/signal", {
        query: { pair: pair.value }
      });
      signal.value = response;
    } catch (err) {
      const status =
        (err as { statusCode?: number })?.statusCode ??
        (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) {
        rateLimited.value = true;
        error.value = "Terlalu sering update, tunggu sebentar.";
        nextAllowedAt.value = now + RATE_LIMIT_COOLDOWN_MS;
      } else {
        error.value = "Gagal mengambil sinyal. Coba refresh.";
      }
    } finally {
      if (forceLoading || !signal.value) {
        loading.value = false;
      }
    }
  };

  const refresh = async () => {
    await fetchSignal(true);
  };

  let interval: ReturnType<typeof setInterval> | null = null;
  const startPolling = () => {
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      fetchSignal(false);
    }, pollMs);
  };

  watch(
    pair,
    async () => {
      await fetchSignal(true);
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
    signal,
    loading,
    error,
    refresh,
    rateLimited
  };
}
