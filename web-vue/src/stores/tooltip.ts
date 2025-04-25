import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import type { Inventory, SlotWithItem } from '../typings'

interface TooltipState {
  open: boolean
  item: SlotWithItem | null
  inventoryType: Inventory['type'] | null
}

export const useTooltipStore = defineStore('tooltip', () => {
  // State is reactive in Vue/Pinia
  const state = reactive<TooltipState>({
    open: false,
    item: null,
    inventoryType: null,
  })

  // Computed getters
  const isOpen = computed(() => state.open)
  const currentItem = computed(() => state.item)
  const currentInventoryType = computed(() => state.inventoryType)

  // Actions
  function openTooltip(payload: { item: SlotWithItem; inventoryType: Inventory['type'] }) {
    state.open = true
    state.item = payload.item
    state.inventoryType = payload.inventoryType
  }

  function closeTooltip() {
    state.open = false
  }

  return {
    // State
    state,
    
    // Getters
    isOpen,
    currentItem,
    currentInventoryType,
    
    // Actions
    openTooltip,
    closeTooltip,
  }
})