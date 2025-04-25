import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import type { SlotWithItem } from '../typings'

export const useTooltipStore = defineStore('tooltip', () => {
  // Tooltip state
  const visible = ref(false)
  const item = ref<SlotWithItem | null>(null)
  const position = ref<{ x: number; y: number } | null>(null)

  // Show the tooltip for an item
  function showTooltip(itemData: SlotWithItem, mousePosition: { x: number; y: number }) {
    item.value = itemData
    position.value = mousePosition
    visible.value = true
  }

  // Close the tooltip
  function closeTooltip() {
    visible.value = false
    item.value = null
    position.value = null
  }

  // Update the tooltip position (during mouse movement)
  function updatePosition(mousePosition: { x: number; y: number }) {
    if (visible.value) {
      position.value = mousePosition
    }
  }

  // Check if the tooltip has a valid item
  const hasItem = computed(() => visible.value && item.value !== null)

  return {
    // State
    visible,
    item,
    position,
    hasItem,

    // Actions
    showTooltip,
    closeTooltip,
    updatePosition
  }
})