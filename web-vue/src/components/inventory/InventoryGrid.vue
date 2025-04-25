<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Inventory } from '../../typings'
import InventorySlot from './InventorySlot.vue'
import WeightBar from '../utils/WeightBar.vue'
import { useInventoryStore } from '../../stores/inventory'
import { getTotalWeight } from '../../helpers'

// Props
const props = defineProps<{
  inventory: Inventory
}>()

// Calculate total weight
const weight = computed(() => {
  if (!props.inventory.maxWeight) return 0
  return Math.floor(getTotalWeight(props.inventory.items) * 1000) / 1000
})

// Weight percentage for the progress bar
const weightPercent = computed(() => {
  if (!props.inventory.maxWeight) return 0
  return (weight.value / props.inventory.maxWeight) * 100
})

// Get store for busy state
const inventoryStore = useInventoryStore()

// Generate array of filled and empty slots
const gridSlots = computed(() => {
  // Create an array of slots up to the inventory size
  const slots = Array(props.inventory.slots).fill(null).map((_, index) => ({
    slot: index + 1,
    isEmpty: true
  }))
  
  // Mark slots that have items
  props.inventory.items.forEach(item => {
    if (item.slot <= props.inventory.slots) {
      slots[item.slot - 1] = item
    }
  })
  
  return slots
})

// For pagination (implement later if needed)
const PAGE_SIZE = 30
const page = ref(0)
</script>

<template>
  <div 
    class="inventory-grid-wrapper w-[370px] bg-slate-800 rounded shadow-lg p-4"
    :class="{ 'pointer-events-none': inventoryStore.isBusy }"
  >
    <!-- Header with title and weight -->
    <div class="mb-4">
      <div class="inventory-grid-header flex justify-between items-center mb-2">
        <p class="text-lg font-medium">{{ inventory.label || 'Inventory' }}</p>
        <p v-if="inventory.maxWeight" class="text-sm text-gray-300">
          {{ (weight / 1000).toFixed(2) }}/{{ (inventory.maxWeight / 1000).toFixed(2) }}kg
        </p>
      </div>
      
      <!-- Weight bar -->
      <WeightBar :percent="weightPercent" />
    </div>
    
    <!-- Grid of slots -->
    <div class="inventory-grid-container grid grid-cols-5 gap-1 mt-2">
      <!-- Render all slots (both filled and empty) -->
      <InventorySlot
        v-for="slotData in gridSlots"
        :key="`${inventory.type}-${inventory.id}-${slotData.slot}`"
        :item="slotData"
        :inventory-type="inventory.type"
        :inventory-groups="inventory.groups"
        :inventory-id="inventory.id"
      />
    </div>
  </div>
</template>