<script setup lang="ts">
const props = defineProps<{
  signal: string;
  headline: string;
  lastPrice: number | null;
  changeShort: number | null;
  changeLong: number | null;
  changeShortLabel: string;
  changeLongLabel: string;
  volume24h: number | null;
  lastUpdated: string;
  loading: boolean;
  error: string | null;
}>();

const statusMap: Record<string, { label: string; badge: string; glow: string }> = {
  BUY: { label: "BUY", badge: "bg-brand-500/20 text-brand-500", glow: "shadow-glow" },
  WAIT: { label: "WAIT", badge: "bg-warn-500/20 text-warn-500", glow: "" },
  SELL: { label: "SELL", badge: "bg-danger-500/20 text-danger-500", glow: "" }
};

const status = computed(() => statusMap[props.signal] ?? statusMap.WAIT);

const formatIdr = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return "--";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
};

const formatPercent = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return "--";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};
</script>

<template>
  <div class="glass rounded-3xl p-6 sm:p-8">
    <div v-if="props.loading" class="space-y-6 animate-pulse">
      <div class="h-12 w-40 rounded-full bg-base-800/70" />
      <div class="h-16 w-64 rounded-2xl bg-base-800/70" />
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div v-for="idx in 4" :key="idx" class="h-12 rounded-xl bg-base-800/70" />
      </div>
      <div class="h-5 w-40 rounded-full bg-base-800/70" />
    </div>

    <div v-else-if="props.error" class="space-y-4">
      <div class="pill bg-danger-500/20 text-danger-500">DATA ERROR</div>
      <p class="text-sm text-slate-300">
        {{ props.error }}
      </p>
    </div>

    <div v-else class="space-y-6">
      <transition name="fade-slide" mode="out-in">
        <div
          :key="status.label"
          class="inline-flex items-center gap-3 rounded-2xl px-6 py-3 text-lg font-semibold uppercase tracking-[0.35em] sm:text-xl"
          :class="[status.badge, status.glow]"
        >
          {{ status.label }}
        </div>
      </transition>
      <p v-if="props.headline" class="text-sm text-slate-300">
        {{ props.headline }}
      </p>

      <div>
        <p class="stat-label">Harga terakhir (IDR)</p>
        <p class="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          {{ formatIdr(props.lastPrice) }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div class="rounded-2xl border border-white/10 bg-base-800/60 px-4 py-3">
          <p class="stat-label">Change {{ props.changeShortLabel }}</p>
          <p class="stat-value">{{ formatPercent(props.changeShort) }}</p>
          <p v-if="props.changeShort === null" class="mt-1 text-xs text-slate-400">
            collecting data...
          </p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-base-800/60 px-4 py-3">
          <p class="stat-label">Change {{ props.changeLongLabel }}</p>
          <p class="stat-value">{{ formatPercent(props.changeLong) }}</p>
          <p v-if="props.changeLong === null" class="mt-1 text-xs text-slate-400">
            collecting data...
          </p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-base-800/60 px-4 py-3">
          <p class="stat-label">Volume 24h</p>
          <p class="stat-value">{{ formatIdr(props.volume24h) }}</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-base-800/60 px-4 py-3">
          <p class="stat-label">Last updated (WIB)</p>
          <p class="stat-value">{{ props.lastUpdated }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
