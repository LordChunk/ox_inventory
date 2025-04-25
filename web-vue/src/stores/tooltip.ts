import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SlotWithItem } from '../typings/slot'
import type { Inventory } from '../typings/inventory'

type Position = {
  x: number
  y: number
}

export const useTooltipStore = defineStore('tooltip', () => {
  const isVisible = ref(false)
  const item = ref<SlotWithItem | null>(null)
  const inventoryType = ref<Inventory['type'] | null>(null)
  const position = ref<Position>({ x: 0, y: 0 })

  // Method to show tooltip
  function showTooltip(data: {
    item: SlotWithItem,
    inventoryType: Inventory['type']
  }) {
    item.value = data.item
    inventoryType.value = data.inventoryType
    isVisible.value = true
  }

  // Method to hide tooltip
  function hideTooltip() {
    isVisible.value = false
    item.value = null
    inventoryType.value = null
  }

  // Method to track mouse position
  function updatePosition(newPosition: Position) {
    position.value = newPosition
  }

  return {
    isVisible,
    item,
    inventoryType,
    position,
    showTooltip,
    openTooltip: showTooltip, // Explicit alias for openTooltip pointing to showTooltip
    closeTooltip: hideTooltip,
    updatePosition
  }
})
