<script setup lang="ts">
type Candle = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number | null;
};

const props = defineProps<{
  candles: Candle[];
  loading: boolean;
  error: string | null;
}>();

const width = 640;
const height = 220;
const padding = 16;

const range = computed(() => {
  if (!props.candles.length) {
    return { min: 0, max: 1 };
  }
  const lows = props.candles.map((c) => c.l);
  const highs = props.candles.map((c) => c.h);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  return min === max ? { min: min - 1, max: max + 1 } : { min, max };
});

const scaleY = (value: number) => {
  const { min, max } = range.value;
  const ratio = (value - min) / (max - min || 1);
  return height - padding - ratio * (height - padding * 2);
};

const candleWidth = computed(() => {
  if (!props.candles.length) return 6;
  const total = width - padding * 2;
  return Math.max(4, Math.floor(total / props.candles.length) - 2);
});

const candlesWithX = computed(() => {
  const total = width - padding * 2;
  const step = props.candles.length ? total / props.candles.length : 1;
  return props.candles.map((candle, idx) => ({
    ...candle,
    x: padding + idx * step + step / 2
  }));
});
</script>

<template>
  <div class="glass rounded-2xl p-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">Chart 15m</h3>
        <p class="text-xs text-slate-400">
          Candlestick dari Indodax TradingView history
        </p>
      </div>
      <span class="pill bg-base-800/70 text-slate-200">OHLC</span>
    </div>

    <div v-if="props.loading" class="mt-6 h-52 animate-pulse rounded-2xl bg-base-800/70" />

    <div v-else-if="props.error" class="mt-6 rounded-2xl border border-white/10 bg-base-800/60 p-4 text-sm text-slate-300">
      {{ props.error }}
    </div>

    <div v-else class="mt-6">
      <svg
        class="h-56 w-full"
        :viewBox="`0 0 ${width} ${height}`"
        role="img"
        aria-label="Candlestick chart 15m"
      >
        <rect
          :x="0"
          :y="0"
          :width="width"
          :height="height"
          rx="18"
          class="fill-base-900/70"
        />
        <g v-for="candle in candlesWithX" :key="candle.t">
          <line
            :x1="candle.x"
            :x2="candle.x"
            :y1="scaleY(candle.h)"
            :y2="scaleY(candle.l)"
            :class="candle.c >= candle.o ? 'stroke-brand-500' : 'stroke-danger-500'"
            stroke-width="2"
          />
          <rect
            :x="candle.x - candleWidth / 2"
            :y="scaleY(Math.max(candle.o, candle.c))"
            :width="candleWidth"
            :height="Math.max(2, Math.abs(scaleY(candle.o) - scaleY(candle.c)))"
            :class="candle.c >= candle.o ? 'fill-brand-500/70' : 'fill-danger-500/70'"
            rx="2"
          />
        </g>
      </svg>
      <p v-if="!props.candles.length" class="mt-3 text-xs text-slate-400">
        Belum ada data candle. Coba refresh beberapa saat lagi.
      </p>
    </div>
  </div>
</template>
