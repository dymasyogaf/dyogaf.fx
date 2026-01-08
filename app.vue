<script setup lang="ts">
import { computed, ref } from "vue";
import { useMarketSignal } from "./composables/useMarketSignal";
const pairOptions = [
  { label: "BTC/IDR", value: "btcidr" },
  { label: "PEPE/IDR", value: "pepeidr" },
  { label: "DOGE/IDR", value: "dogeidr" },
  { label: "SHIB/IDR", value: "shibidr" },
  { label: "FLOKI/IDR", value: "flokiidr" },
  { label: "BONK/IDR", value: "bonkidr" }
];

const selectedPair = ref(pairOptions[0].value);
const timeframeOptions = [
  { label: "3 menit", value: 3 },
  { label: "15 menit", value: 15 },
  { label: "30 menit", value: 30 },
  { label: "60 menit", value: 60 },
  { label: "1 hari", value: 1440 },
  { label: "7 hari", value: 10080 },
  { label: "30 hari", value: 43200 }
];
const selectedTimeframe = ref(timeframeOptions[1].value);
const selectedTimeframeLabel = computed(() => {
  return timeframeOptions.find((option) => option.value === selectedTimeframe.value)
    ?.label ?? "15 menit";
});

const { data, loading, error, refresh } = useMarketSignal(
  selectedPair,
  selectedTimeframe,
  5000
);

const lastPrice = computed(() => data.value?.market.last ?? null);
const volume24h = computed(() => data.value?.market.volume24h ?? null);
const changeShort = computed(() => data.value?.market.changeShort ?? null);
const changeLong = computed(() => data.value?.market.changeLong ?? null);
const changeShortLabel = computed(() => {
  const minutes = data.value?.market.changeShortMinutes ?? selectedTimeframe.value;
  return formatTimeframeLabel(minutes);
});
const changeLongLabel = computed(() => {
  const minutes = data.value?.market.changeLongMinutes ?? selectedTimeframe.value * 4;
  return formatTimeframeLabel(minutes);
});
const lastUpdatedWib = computed(
  () => data.value?.market.lastUpdatedWib ?? "--"
);
const signalStatus = computed(() => data.value?.signal.status ?? "WAIT");
const signalHeadline = computed(() => data.value?.signal.headline ?? "");
const signalReasons = computed(() => data.value?.signal.reasons ?? []);
const signalErrorMessage = computed(() => error.value || null);

const connectionLabel = computed(() => (error.value ? "OFFLINE" : "LIVE"));

const formatTimeframeLabel = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  if (minutes === 60) return "1h";
  if (minutes === 1440) return "1D";
  if (minutes === 10080) return "7D";
  if (minutes === 43200) return "30D";
  return `${minutes}m`;
};
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
            Spot Pullback Helper - {{ selectedTimeframeLabel }}
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
        v-model:timeframe="selectedTimeframe"
        :timeframes="timeframeOptions"
      />
    </section>

    <section class="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div class="space-y-6">
        <SignalCard
          :signal="signalStatus"
          :headline="signalHeadline"
          :last-price="lastPrice"
          :change-short="changeShort"
          :change-long="changeLong"
          :change-short-label="changeShortLabel"
          :change-long-label="changeLongLabel"
          :volume-24h="volume24h"
          :last-updated="lastUpdatedWib"
          :loading="loading"
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

