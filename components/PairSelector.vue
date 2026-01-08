<script setup lang="ts">
type Option = { label: string; value: string };
type TimeframeOption = { label: string; value: number };

const props = defineProps<{
  modelValue: string;
  options: Option[];
  timeframe: number;
  timeframes: TimeframeOption[];
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "update:timeframe", value: number): void;
}>();
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p class="stat-label">Pair</p>
      <select
        class="mt-2 w-full rounded-xl border border-white/10 bg-base-800/80 px-4 py-3 text-base font-semibold text-slate-100 focus:border-brand-500 focus:outline-none"
        :value="props.modelValue"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="option in props.options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
    <div class="sm:text-right">
      <p class="stat-label">Timeframe</p>
      <select
        class="mt-2 w-full rounded-xl border border-white/10 bg-base-800/80 px-4 py-3 text-base font-semibold text-slate-100 focus:border-brand-500 focus:outline-none sm:text-right"
        :value="props.timeframe"
        @change="emit('update:timeframe', Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="option in props.timeframes" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>
