import { defineStore } from 'pinia'
import { reactive, ref, computed } from 'vue'
import type { DragSource, DropTarget } from '../typings/dnd'
import { fetchNui } from '../utils/fetchNui'
import { useInventoryStore } from './inventory'

export const useDragStore = defineStore('drag', () => {
  // Dragging state
  const isDragging = ref(false)
  const currentItem = ref<DragSource | null>(null)
  const currentPosition = ref<{ x: number; y: number } | null>(null)
  const image = ref<string | undefined>(undefined)
  
  // Get inventory store
  const inventoryStore = useInventoryStore()

  // Start a drag operation
  function startDrag(source: DragSource, initialPosition: { x: number; y: number }) {
    isDragging.value = true
    currentItem.value = source
    currentPosition.value = initialPosition
    image.value = source.image
  }

  // Update position during drag
  function updatePosition(position: { x: number; y: number }) {
    currentPosition.value = position
  }

  // Handle drop operation
  function handleDrop(target: DropTarget): boolean {
    if (!isDragging.value || !currentItem.value) return false

    const source = currentItem.value
    
    // Process the drop based on inventory types
    if (source.inventory === 'shop' && target.inventory !== 'shop') {
      // Handle buying from shop
      fetchNui('buyItem', {
        fromSlot: source.item.slot,
        toSlot: target.item.slot,
        fromType: source.inventory,
        toType: target.inventory,
        count: inventoryStore.itemAmount || 1
      })
    } else if (source.inventory === 'crafting' && target.inventory !== 'crafting') {
      // Handle crafting
      fetchNui('craftItem', {
        fromSlot: source.item.slot,
        toSlot: target.item.slot,
        fromType: source.inventory,
        toType: target.inventory,
        count: inventoryStore.itemAmount || 1
      })
    } else if (source.inventory !== 'shop' && source.inventory !== 'crafting') {
      // Regular item movement - start optimistic update
      inventoryStore.setPending()
      
      // Send request to server
      fetchNui('swapItems', {
        fromSlot: source.item.slot,
        toSlot: target.item.slot,
        fromType: source.inventory,
        toType: target.inventory,
        count: inventoryStore.itemAmount || 0
      }).then(() => {
        inventoryStore.setFulfilled()
      }).catch(() => {
        // Rollback on error
        inventoryStore.setRejected()
      })
    }

    // End the drag regardless of result
    endDrag()
    return true
  }

  // End drag operation
  function endDrag() {
    isDragging.value = false
    currentItem.value = null
    currentPosition.value = null
    image.value = undefined
  }

  return {
    // State
    isDragging,
    currentItem,
    currentPosition,
    image,

    // Actions
    startDrag,
    updatePosition,
    handleDrop,
    endDrag
  }
})