<script setup lang="ts">
import { computed } from 'vue'
import { useInventoryStore } from '../../stores/inventory'
import WeightBar from '../utils/WeightBar.vue'
import InventorySlot from './InventorySlot.vue'

const inventoryStore = useInventoryStore()

// Computed properties for inventory data
const inventory = computed(() => inventoryStore.leftInventory)
const label = computed(() => inventory.value.label)
const slots = computed(() => inventory.value.slots)
const items = computed(() => inventory.value.items)
const totalWeight = computed(() => items.value.reduce((total, item) => total + (item.weight || 0), 0))
const maxWeight = computed(() => inventory.value.maxWeight || 0) // Provide default value
const weightPercent = computed(() => maxWeight.value ? (totalWeight.value / maxWeight.value) * 100 : 0)
</script>

<template>
  <div class="bg-slate-800/80 p-4 rounded-lg">
    <!-- Inventory header -->
    <div class="mb-2 flex flex-col gap-1">
      <div class="flex justify-between items-center">
        <span class="text-lg font-semibold">{{ label }}</span>
        <span class="text-sm">
          {{ totalWeight?.toFixed(2) }}/{{ maxWeight?.toFixed(2) }}
        </span>
      </div>
      <WeightBar :percent="weightPercent" />
    </div>

    <!-- Inventory grid -->
    <div
      class="grid grid-cols-5 gap-1"
    >
      <InventorySlot
        v-for="index in slots"
        :key="index"
        :item="items[index - 1] || { slot: index }"
        :inventory-type="inventory.type"
        :inventory-groups="inventory.groups"
        :inventory-id="inventory.id"
      />
    </div>
  </div>
</template>
