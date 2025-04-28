import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DragSource, DropTarget } from '../typings/dnd'
import { useInventoryStore } from './inventory'
import { moveItem } from '../utils/inventoryOperations'

export const useDragStore = defineStore('drag', () => {
  // Dragging state
  const isDragging = ref(false)
  const currentItem = ref<DragSource | null>(null)
  const currentPosition = ref<{ x: number; y: number } | null>(null)

  // Get inventory store
  const inventoryStore = useInventoryStore()

  // Computed properties for consistent access
  const currentSource = computed(() => currentItem.value)
  const image = computed(() => currentItem.value?.image)

  // Start a drag operation
  function startDrag(source: DragSource, initialPosition: { x: number; y: number }) {
    isDragging.value = true
    currentItem.value = source
    currentPosition.value = initialPosition
  }

  // Single method for updating position with alias for backward compatibility
  function updatePosition(position: { x: number; y: number }) {
    if (isDragging.value) {
      currentPosition.value = position
    }
  }

  // Handle drop operation
  function handleDrop(target: DropTarget) {
    if (!isDragging.value || !currentItem.value) return false

    const source = currentItem.value

    // Return data for components to use if needed
    const result = {
      source,
      target
    }

    // End the drag regardless of result
    endDrag()
    return result
  }

  // End drag operation
  function endDrag() {
    isDragging.value = false
    currentItem.value = null
    currentPosition.value = null
  }

  return {
    // State
    isDragging,
    currentItem,
    currentPosition,
    currentSource,
    image,

    // Actions
    startDrag,
    updatePosition,
    handleDrop,
    endDrag
  }
})
