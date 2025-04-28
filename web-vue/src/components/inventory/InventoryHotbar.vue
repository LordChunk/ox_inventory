<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useInventoryStore } from '../../stores/inventory'
import InventorySlot from './InventorySlot.vue'

const inventoryStore = useInventoryStore()

// Get first 5 slots for hotbar
const hotbarSlots = computed(() =>
  Array.from({ length: 5 }, (_, i) =>
    inventoryStore.leftInventory.items[i] || { slot: i + 1 }
  )
)

// Handle number key presses (1-5) for hotbar slots
function handleKeyPress(e: KeyboardEvent) {
  const num = parseInt(e.key)
  if (num >= 1 && num <= 5) {
    const slot = hotbarSlots.value[num - 1]
    if ('name' in slot) { // Check if slot has an item
      e.preventDefault()
      // Use item in slot
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})
</script>

<template>
  <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 p-2 bg-slate-800/80 rounded-lg">
    <InventorySlot
      v-for="(item, index) in hotbarSlots"
      :key="index"
      :item="item"
      inventory-type="player"
      :inventory-id="inventoryStore.leftInventory.id"
    />
  </div>
</template>
