<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useDragStore } from '../../stores/dragAndDrop'
import { useItemsStore } from '../../stores/items'

const dragStore = useDragStore()
const itemsStore = useItemsStore()

// Get current drag state
const isDragging = computed(() => dragStore.isDragging)
const source = computed(() => dragStore.currentSource)
const position = computed(() => dragStore.currentPosition)

// Add a global event listener for mousemove to update drag position
function handleMouseMove(event: MouseEvent) {
  dragStore.updateDragPosition({
    x: event.clientX,
    y: event.clientY
  })
}

// Set up event listeners
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleDragEnd)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleDragEnd)
})

// Handle drag end when mouse released
function handleDragEnd() {
  if (isDragging.value) {
    dragStore.endDrag()
  }
}

// Calculate drag preview position - fix the positioning to be at the cursor
const previewStyle = computed(() => {
  if (!position.value) return {}
  
  // Position the item so the center of the preview is at the cursor
  // Using a 20px offset to place the item slightly below and to the right of the cursor
  return {
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
    transform: 'translate(-50%, -50%)', // Center the element on the cursor
    backgroundImage: source.value?.image ? source.value.image : 'none'
  }
})

// Get item url for the dragged item
function getImageUrl(itemName: string): string {
  // For demo, returning a placeholder
  return `https://via.placeholder.com/100?text=${itemName}`
}
</script>

<template>
  <div 
    v-if="isDragging && source && position"
    class="item-drag-preview fixed pointer-events-none z-50 bg-cover bg-center"
    style="width: 40px; height: 40px; opacity: 0.8;"
    :style="previewStyle"
  >
    <!-- Optionally add item count or other information -->
    <div class="bg-black/50 text-white text-xs absolute bottom-0 right-0 px-1">
      {{ source.item.name }}
    </div>
  </div>
</template>