<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useInventoryStore } from '../../stores/inventory'
import { useTooltipStore } from '../../stores/tooltip'
import InventoryGrid from './InventoryGrid.vue'
import Tooltip from '../utils/Tooltip.vue'
import DragPreview from '../utils/DragPreview.vue'
import useNuiEvent from '../../composables/useNuiEvent'
import { fetchNui } from '../../utils/fetchNui'
import { debugData } from '../../utils/debugData'
import UsefulControls from './UsefulControls.vue'

// Initialize stores
const inventoryStore = useInventoryStore()
const tooltipStore = useTooltipStore()

// State for inventory visibility
const inventoryVisible = ref(false)
const infoVisible = ref(false)

// Handle inventory visibility events
useNuiEvent<boolean>('setInventoryVisible', (visible) => {
  inventoryVisible.value = visible

  // Reset tooltip when inventory visibility changes
  if (!visible) {
    tooltipStore.closeTooltip()
  }
})

// Handle close inventory event
useNuiEvent<void>('closeInventory', () => {
  inventoryVisible.value = false
  tooltipStore.closeTooltip()
})

// Exit inventory handler
const handleExit = () => {
  inventoryVisible.value = false
  tooltipStore.closeTooltip()
  fetchNui('exit', {})
}

// For debugging in browser environment
onMounted(() => {
  // In browser development mode, set inventory to visible
  debugData([
    {
      action: 'setInventoryVisible',
      data: true
    }
  ])
})
</script>

<template>
  <div v-if="inventoryVisible" class="inventory-container p-4 flex justify-center items-center fixed inset-0">
    <!-- Useful controls for additional functionality -->
    <UsefulControls
      :info-visible="infoVisible"
      @update:info-visible="(value) => infoVisible = value"
    />
    <div class="inventory-wrapper h-screen flex gap-4">
      <!-- Left Inventory -->
      <InventoryGrid
        :inventory="inventoryStore.leftInventory"
        inventoryType="player"
      />

      <!-- Right Inventory -->
      <InventoryGrid
        v-if="inventoryStore.rightInventory && inventoryStore.rightInventory.id"
        :inventory="inventoryStore.rightInventory"
        :inventoryType="inventoryStore.rightInventory.type"
      />
    </div>

    <!-- Exit button -->
    <button
      @click="handleExit"
      class="absolute top-6 right-6 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
    >
      Close
    </button>

    <!-- Tooltip -->
    <Tooltip />

    <!-- Drag Preview -->
    <DragPreview />

      <!-- Info button -->
  <button
    class="fixed bottom-4 right-4 bg-slate-800 rounded-full p-2 hover:bg-slate-700 transition-colors"
    @click="infoVisible = true"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="2em"
      viewBox="0 0 524 524"
      class="fill-current text-white"
    >
      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
    </svg>
  </button>
  </div>
</template>

<style scoped>
.inventory-container {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
}
</style>
