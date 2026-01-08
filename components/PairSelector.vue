<script setup lang="ts">
type Option = { label: string; value: string };

const props = defineProps<{
  modelValue: string;
  options: Option[];
  timeframe: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
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
      <div class="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-base-800/80 px-4 py-3 text-base font-semibold text-slate-100">
        {{ props.timeframe }}
        <span class="text-xs font-normal text-slate-400">(fixed)</span>
      </div>
    </div>
  </div>
</template>
