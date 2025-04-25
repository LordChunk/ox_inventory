<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useTooltipStore } from '../../stores/tooltip'

const tooltipStore = useTooltipStore()

// Function to handle mouse movement
const handleMouseMove = (event: MouseEvent) => {
  tooltipStore.updatePosition({
    x: event.clientX,
    y: event.clientY
  })
}

// Add event listener when component is mounted
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

// Clean up event listener when component is unmounted
onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <!-- This is an invisible component that only handles mouse position tracking -->
</template>