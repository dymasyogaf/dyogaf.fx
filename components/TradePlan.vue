<script setup lang="ts">
const props = defineProps<{
  lastPrice: number | null;
}>();

const state = reactive({
  capital: 1000000,
  target: 3,
  cut: 1.5
});

const formatIdr = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return "--";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
};

const entry = computed(() => (props.lastPrice ? props.lastPrice : null));
const tpPrice = computed(() =>
  entry.value ? entry.value * (1 + state.target / 100) : null
);
const slPrice = computed(() =>
  entry.value ? entry.value * (1 - state.cut / 100) : null
);
const riskIdr = computed(() => (state.capital * state.cut) / 100);

onMounted(() => {
  const saved = localStorage.getItem("dyogaf-trade-plan");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.capital = Number(parsed.capital ?? state.capital);
      state.target = Number(parsed.target ?? state.target);
      state.cut = Number(parsed.cut ?? state.cut);
    } catch {
      // Ignore invalid storage data.
    }
  }
});

watch(
  state,
  () => {
    localStorage.setItem("dyogaf-trade-plan", JSON.stringify(state));
  },
  { deep: true }
);
</script>

<template>
  <div class="glass rounded-2xl p-6">
    <h3 class="text-lg font-semibold">Trade Plan</h3>
    <div class="mt-5 grid gap-4">
      <label class="flex flex-col gap-2 text-sm text-slate-300">
        Modal IDR
        <input
          v-model.number="state.capital"
          type="number"
          min="0"
          class="rounded-xl border border-white/10 bg-base-800/60 px-4 py-3 text-base font-semibold text-slate-100 focus:border-brand-500 focus:outline-none"
        />
      </label>
      <div class="grid grid-cols-2 gap-4">
        <label class="flex flex-col gap-2 text-sm text-slate-300">
          Target Profit %
          <input
            v-model.number="state.target"
            type="number"
            min="0"
            step="0.1"
            class="rounded-xl border border-white/10 bg-base-800/60 px-4 py-3 text-base font-semibold text-slate-100 focus:border-brand-500 focus:outline-none"
          />
        </label>
        <label class="flex flex-col gap-2 text-sm text-slate-300">
          Cut Loss %
          <input
            v-model.number="state.cut"
            type="number"
            min="0"
            step="0.1"
            class="rounded-xl border border-white/10 bg-base-800/60 px-4 py-3 text-base font-semibold text-slate-100 focus:border-brand-500 focus:outline-none"
          />
        </label>
      </div>
    </div>

    <div class="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-base-800/60 p-4 text-sm">
      <div class="flex items-center justify-between">
        <span class="text-slate-400">Entry</span>
        <span class="font-semibold text-slate-100">{{ formatIdr(entry) }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-slate-400">TP price</span>
        <span class="font-semibold text-slate-100">{{ formatIdr(tpPrice) }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-slate-400">SL price</span>
        <span class="font-semibold text-slate-100">{{ formatIdr(slPrice) }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-slate-400">Est risk IDR</span>
        <span class="font-semibold text-slate-100">{{ formatIdr(riskIdr) }}</span>
      </div>
    </div>
  </div>
</template>
