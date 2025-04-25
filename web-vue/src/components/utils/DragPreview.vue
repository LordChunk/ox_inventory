<script setup lang="ts">
import { computed } from 'vue'
import { useDragStore } from '../../stores/drag'

// Get the drag state from store
const dragStore = useDragStore()

// Computed values from drag store
const isDragging = computed(() => dragStore.isDragging)
const draggedItem = computed(() => dragStore.currentItem)
const position = computed(() => dragStore.currentPosition)
const image = computed(() => dragStore.image)

// Calculate position and styling for the drag preview
const style = computed(() => {
  if (!isDragging.value || !position.value) return {}

  // Position the preview element with the cursor at its center
  return {
    left: `${position.value.x - 32}px`, // Center horizontally (half of 64px width)
    top: `${position.value.y - 32}px`,  // Center vertically (half of 64px height)
    backgroundImage: image.value && image.value.startsWith('url(') ? image.value : `url(${image.value})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})
</script>

<template>
  <div v-if="isDragging && position && draggedItem"
    class="item-drag-preview fixed pointer-events-none w-16 h-16"
    :style="style">
  </div>
</template>

<style scoped>
.item-drag-preview {
  z-index: 9999;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  width: 64px;
  height: 64px;
}
</style>
