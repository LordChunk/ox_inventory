<!-- Component for displaying useful keyboard shortcuts and controls -->
<script setup lang="ts">
import { computed } from 'vue'
import { useInventoryStore } from '../../stores/inventory'

// Props
defineProps<{
  infoVisible: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:info-visible', value: boolean): void
}>()

// Get inventory store
const inventoryStore = useInventoryStore()

// Computed shortcuts object for better organization
const shortcuts = computed(() => ({
  general: [
    { key: 'ESC', description: 'Close inventory' },
    { key: 'ALT + CLICK', description: 'Quick use an item' },
    { key: 'CTRL + CLICK', description: 'Quick drop an item' },
    { key: 'SHIFT', description: 'When dragging, split the stack in half' },
    { key: 'R + CLICK', description: 'Quick remove attachment' },
  ],
  hotkeys: Array.from({ length: 5 }, (_, i) => ({
    key: `${i + 1}`,
    description: `Use item in ${i + 1} slot`,
  })),
}))

function closeInfo() {
  emit('update:info-visible', false)
}
</script>

<template>
  <div
    v-if="infoVisible"
    class="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    @click="closeInfo"
  >
    <div
      class="bg-slate-800 p-6 rounded-lg max-w-lg w-full mx-4"
      @click.stop
    >
      <!-- General shortcuts -->
      <div class="mb-6">
        <h2 class="text-xl font-bold mb-4">General Controls</h2>
        <ul class="space-y-2">
          <li
            v-for="shortcut in shortcuts.general"
            :key="shortcut.key"
            class="flex items-center gap-4"
          >
            <kbd class="px-2 py-1 bg-slate-700 rounded font-mono text-sm">{{ shortcut.key }}</kbd>
            <span>{{ shortcut.description }}</span>
          </li>
        </ul>
      </div>

      <!-- Hotkeys -->
      <div>
        <h2 class="text-xl font-bold mb-4">Hotkeys</h2>
        <ul class="space-y-2">
          <li
            v-for="shortcut in shortcuts.hotkeys"
            :key="shortcut.key"
            class="flex items-center gap-4"
          >
            <kbd class="px-2 py-1 bg-slate-700 rounded font-mono text-sm">{{ shortcut.key }}</kbd>
            <span>{{ shortcut.description }}</span>
          </li>
        </ul>
      </div>

      <!-- Close button -->
      <button
        class="mt-6 w-full bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-600 transition-colors"
        @click="closeInfo"
      >
        Close
      </button>
    </div>
  </div>
</template>
