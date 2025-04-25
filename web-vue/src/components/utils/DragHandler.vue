<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useDragStore } from '../../stores/drag'

const dragStore = useDragStore()

// Handle mouse move events for drag operations
const handleMouseMove = (event: MouseEvent) => {
  if (dragStore.isDragging) {
    dragStore.updatePosition({ x: event.clientX, y: event.clientY })
  }
}

// Handle mouse up events to end drag operations
const handleMouseUp = () => {
  if (dragStore.isDragging) {
    dragStore.endDrag()
  }
}

// Add and remove event listeners
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <!-- This is an invisible component that just manages event listeners -->
</template>