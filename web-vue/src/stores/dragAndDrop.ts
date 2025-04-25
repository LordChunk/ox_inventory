import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import type { DragSource, DropTarget } from '../typings'

export const useDragStore = defineStore('dragAndDrop', () => {
  // Track if an item is being dragged
  const isDragging = ref(false)
  
  // Store information about the dragged item
  const draggedItem = reactive<{
    source: DragSource | null
    currentPosition: { x: number, y: number } | null
  }>({
    source: null,
    currentPosition: null
  })
  
  // Computed properties
  const currentSource = computed(() => draggedItem.source)
  const currentPosition = computed(() => draggedItem.currentPosition)
  
  // Actions
  function startDrag(source: DragSource, initialPosition: { x: number, y: number }) {
    isDragging.value = true
    draggedItem.source = source
    draggedItem.currentPosition = initialPosition
  }
  
  function updateDragPosition(position: { x: number, y: number }) {
    if (isDragging.value) {
      draggedItem.currentPosition = position
    }
  }
  
  function endDrag() {
    isDragging.value = false
    draggedItem.source = null
    draggedItem.currentPosition = null
  }
  
  function handleDrop(target: DropTarget) {
    // This will be fleshed out to handle different drop scenarios
    if (!draggedItem.source) return false
    
    // Return both the source and target information for processing
    return {
      source: draggedItem.source,
      target
    }
  }
  
  return {
    isDragging,
    currentSource,
    currentPosition,
    startDrag,
    updateDragPosition,
    endDrag,
    handleDrop
  }
})