<script setup lang="ts">
type Reason = {
  label: string;
  pass: boolean;
  detail: string;
};

const props = defineProps<{
  reasons: Reason[];
}>();
</script>

<template>
  <div class="glass rounded-2xl p-6">
    <h3 class="text-lg font-semibold">Why this status?</h3>
    <ul class="mt-5 space-y-3">
      <li
        v-for="reason in props.reasons"
        :key="reason.label"
        class="flex items-center justify-between rounded-xl border border-white/10 bg-base-800/60 px-4 py-3"
      >
        <div>
          <p class="text-sm font-medium text-slate-100">{{ reason.label }}</p>
          <p class="text-xs text-slate-400">{{ reason.detail }}</p>
        </div>
        <span
          class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
          :class="reason.pass ? 'bg-brand-500/20 text-brand-500' : 'bg-danger-500/20 text-danger-500'"
        >
          <svg
            v-if="reason.pass"
            class="h-4 w-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M3 8l3 3 7-7" />
          </svg>
          <svg
            v-else
            class="h-4 w-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
          {{ reason.pass ? "OK" : "NO" }}
        </span>
      </li>
    </ul>
  </div>
</template>
