import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import type { SlotWithItem } from '../typings'

interface ContextMenuState {
  open: boolean
  item: SlotWithItem | null
  coords: { x: number; y: number } | null
}

export const useContextMenuStore = defineStore('contextMenu', () => {
  // State is reactive in Vue/Pinia
  const state = reactive<ContextMenuState>({
    open: false,
    item: null,
    coords: null,
  })

  // Computed getters
  const isOpen = computed(() => state.open)
  const currentItem = computed(() => state.item)
  const currentCoords = computed(() => state.coords)

  // Actions
  function openContextMenu(payload: { item: SlotWithItem; coords: { x: number; y: number } }) {
    state.open = true
    state.item = payload.item
    state.coords = payload.coords
  }

  function closeContextMenu() {
    state.open = false
    state.coords = null
  }

  return {
    // State
    state,
    
    // Getters
    isOpen,
    currentItem,
    currentCoords,
    
    // Actions
    openContextMenu,
    closeContextMenu,
  }
})