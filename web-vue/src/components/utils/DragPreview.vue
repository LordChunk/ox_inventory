<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDragStore } from '../../stores/drag'

// Get the drag state from store
const dragStore = useDragStore()

// Computed values from drag store
const isDragging = computed(() => dragStore.isDragging)
const draggedItem = computed(() => dragStore.currentItem)
const position = computed(() => dragStore.currentPosition)
const image = computed(() => dragStore.image)

// If you need custom styling beyond position
const style = computed(() => {
  if (!isDragging.value || !position.value) return {}
  
  return {
    transform: `translate(${position.value.x}px, ${position.value.y}px)`,
    backgroundImage: image.value,
  }
})
</script>

<template>
  <div v-if="isDragging && position && draggedItem" 
    class="item-drag-preview absolute pointer-events-none w-16 h-16 bg-cover" 
    :style="style">
  </div>
</template>

<style scoped>
.item-drag-preview {
  z-index: 9999;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
}
</style>