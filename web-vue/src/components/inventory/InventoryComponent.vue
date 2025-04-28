<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useInventoryStore } from '../../stores/inventory'
import { useTooltipStore } from '../../stores/tooltip'
import InventoryGrid from './InventoryGrid.vue'
import InventoryControl from './InventoryControl.vue'
import Tooltip from '../utils/Tooltip.vue'
import DragPreview from '../utils/DragPreview.vue'
import InventoryContext from './InventoryContext.vue'
import useNuiEvent from '../../composables/useNuiEvent'
import { fetchNui } from '../../utils/fetchNui'
import { debugData } from '../../utils/debugData'

// Initialize stores
const inventoryStore = useInventoryStore()
const tooltipStore = useTooltipStore()

// State for inventory visibility
const inventoryVisible = ref(false)

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
    <div class="inventory-wrapper h-screen flex gap-4">
      <!-- Left Inventory -->
      <InventoryGrid
        :inventory="inventoryStore.leftInventory"
        inventoryType="player"
      />

      <!-- Inventory Control -->
      <InventoryControl />

      <!-- Right Inventory -->
      <InventoryGrid
        v-if="inventoryStore.rightInventory && inventoryStore.rightInventory.id"
        :inventory="inventoryStore.rightInventory"
        :inventoryType="inventoryStore.rightInventory.type"
      />
    </div>

    <!-- Add context menu -->
    <InventoryContext />

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
  </div>
</template>

<style scoped>
.inventory-container {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
}
</style>
