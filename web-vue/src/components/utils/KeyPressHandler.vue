<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useInventoryStore } from '../../stores/inventory'
import { fetchNui } from '../../utils/fetchNui'

const inventoryStore = useInventoryStore()

// Handle keydown events (shift key, escape, etc.)
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Shift') {
    inventoryStore.setShiftPressed(true)
  } else if (event.key === 'Escape') {
    fetchNui('exit', {})
  }
}

// Handle keyup events (primarily for shift key)
function handleKeyUp(event: KeyboardEvent) {
  if (event.key === 'Shift') {
    inventoryStore.setShiftPressed(false)
  }
}

// Register and unregister event listeners
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})
</script>

<template>
  <!-- This component only handles keyboard events, no visual rendering -->
</template>