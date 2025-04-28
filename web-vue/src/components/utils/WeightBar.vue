<script setup lang="ts">
defineProps<{
  percent: number
  durability?: boolean
}>()
</script>

<template>
  <div class="w-full bg-slate-700 rounded overflow-hidden" :class="{ 'h-1': durability }">
    <div
      class="h-full transition-all duration-300"
      :class="{
        'bg-emerald-500': percent < 50 && !durability,
        'bg-amber-500': percent >= 50 && percent < 85 && !durability,
        'bg-red-500': percent >= 85 && !durability,
        'bg-blue-500': durability
      }"
      :style="{ width: `${Math.min(100, percent)}%` }"
    />
  </div>
</template>
