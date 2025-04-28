<script setup lang="ts">
import { computed } from 'vue'
import { useDragStore } from '../../stores/drag'

const dragStore = useDragStore()

const isDragging = computed(() => dragStore.isDragging)
const currentPosition = computed(() => dragStore.currentPosition)
const image = computed(() => dragStore.image)

function updateDragPosition(e: MouseEvent) {
  if (isDragging.value) {
    dragStore.updatePosition({ x: e.clientX, y: e.clientY })
  }
}

// Listen for mouse movement when dragging
window.addEventListener('mousemove', updateDragPosition)
</script>

<template>
  <div
    v-if="isDragging && currentPosition"
    class="fixed pointer-events-none w-16 h-16 -translate-x-1/2 -translate-y-1/2 z-50"
    :style="{
      left: `${currentPosition.x}px`,
      top: `${currentPosition.y}px`,
      backgroundImage: image,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: '0.8'
    }"
  />
</template>
