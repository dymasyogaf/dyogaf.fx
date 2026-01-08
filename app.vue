<script setup lang="ts">
const pairOptions = [
  { label: "PEPE/IDR", value: "pepeidr" },
  { label: "DOGE/IDR", value: "dogeidr" },
  { label: "SHIB/IDR", value: "shibidr" },
  { label: "FLOKI/IDR", value: "flokiidr" },
  { label: "BONK/IDR", value: "bonkidr" }
];

const selectedPair = ref(pairOptions[0].value);

const { data, loading, error, refresh } = useMarketSignal(selectedPair, 5000);
const {
  candles,
  loading: ohlcLoading,
  error: ohlcError
} = useOhlc(selectedPair, 15, 96, 60_000);

const lastPrice = computed(() => data.value?.market.last ?? null);
const volume24h = computed(() => data.value?.market.volume24h ?? null);
const change15m = computed(() => data.value?.market.change15m ?? null);
const change1h = computed(() => data.value?.market.change1h ?? null);
const lastUpdatedWib = computed(
  () => data.value?.market.lastUpdatedWib ?? "--"
);
const signalStatus = computed(() => data.value?.signal.status ?? "WAIT");
const signalHeadline = computed(() => data.value?.signal.headline ?? "");
const signalReasons = computed(() => data.value?.signal.reasons ?? []);
const signalErrorMessage = computed(() => error.value || null);

const connectionLabel = computed(() => (error.value ? "OFFLINE" : "LIVE"));
</script>

<template>
  <div class="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
    <header
      class="glass mb-6 flex flex-col gap-4 rounded-2xl px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center gap-4">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Dyogaf.fx</h1>
          <p class="text-sm text-slate-400">
            Spot Pullback Helper • 15m
          </p>
        </div>
        <span
          class="ml-2 flex items-center gap-2 rounded-full bg-base-800/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200"
        >
          <span
            class="h-2 w-2 rounded-full"
            :class="error ? 'bg-danger-500' : 'bg-brand-500'"
          />
          {{ connectionLabel }}
        </span>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-base-800/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-brand-500 hover:text-brand-500"
        type="button"
        :disabled="loading"
        @click="refresh"
      >
        Refresh
      </button>
    </header>

    <section class="glass mb-6 rounded-2xl px-6 py-5">
      <PairSelector
        v-model="selectedPair"
        :options="pairOptions"
        timeframe="15m"
      />
    </section>

    <section class="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div class="space-y-6">
        <SignalCard
          :signal="signalStatus"
          :headline="signalHeadline"
          :last-price="lastPrice"
          :change-15m="change15m"
          :change-1h="change1h"
          :volume-24h="volume24h"
          :last-updated="lastUpdatedWib"
          :loading="loading || signalLoading"
          :error="signalErrorMessage"
        />
        <ReasonChecklist :reasons="signalReasons" />
      </div>
      <div class="space-y-6">
        <TradePlan :last-price="lastPrice" />
        <RulesPanel />
      </div>
    </section>
  </div>
</template>
