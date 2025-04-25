<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useTooltipStore } from '../../stores/tooltip'
import { useItemsStore } from '../../stores/items'

const tooltipStore = useTooltipStore()
const itemsStore = useItemsStore()

// Get current tooltip state
const isOpen = computed(() => tooltipStore.isOpen)
const item = computed(() => tooltipStore.currentItem)
const inventoryType = computed(() => tooltipStore.currentInventoryType)

// Track mouse position
const mousePosition = ref({ x: 0, y: 0 })

// Handle mouse movement to update position
function handleMouseMove(event: MouseEvent) {
  mousePosition.value = {
    x: event.clientX,
    y: event.clientY
  }
}

// Set up and tear down event listeners
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})

// Calculate tooltip position
const tooltipStyle = computed(() => {
  return {
    top: `${Math.min(window.innerHeight - 250, mousePosition.value.y)}px`,
    left: `${Math.min(window.innerWidth - 250, mousePosition.value.x + 20)}px`
  }
})

// Get item data
const itemData = computed(() => {
  if (!item.value || !item.value.name) return null
  return itemsStore.items[item.value.name]
})

// Get item description from metadata or item data
const description = computed(() => {
  if (!item.value) return null
  return item.value.metadata?.description || itemData.value?.description
})
</script>

<template>
  <teleport to="body">
    <div 
      v-if="isOpen && item" 
      class="tooltip-wrapper fixed z-50 bg-slate-800 rounded shadow-lg p-3 max-w-xs border border-slate-700"
      :style="tooltipStyle"
    >
      <!-- Header -->
      <div class="tooltip-header flex justify-between mb-2 font-medium text-white">
        <p>{{ item.metadata?.label || itemData?.label || item.name }}</p>
        <p v-if="item.metadata?.type">{{ item.metadata.type }}</p>
      </div>
      
      <!-- Divider -->
      <div class="tooltip-divider h-px bg-slate-700 mb-2"></div>
      
      <!-- Description -->
      <div v-if="description" class="tooltip-description text-sm mb-2 text-gray-300">
        <p>{{ description }}</p>
      </div>
      
      <!-- Item properties -->
      <div class="tooltip-details text-sm text-gray-300">
        <!-- Durability -->
        <p v-if="item.durability !== undefined" class="mb-1">
          Durability: {{ Math.trunc(item.durability) }}
        </p>
        
        <!-- Ammo info -->
        <p v-if="item.metadata?.ammo !== undefined" class="mb-1">
          Ammo: {{ item.metadata.ammo }}
        </p>
        
        <!-- Serial number -->
        <p v-if="item.metadata?.serial" class="mb-1">
          Serial: {{ item.metadata.serial }}
        </p>
        
        <!-- Other metadata -->
        <template v-if="item.metadata">
          <p 
            v-for="(value, key) in item.metadata"
            :key="key"
            class="mb-1"
            v-if="!['label', 'description', 'serial', 'ammo'].includes(key)"
          >
            {{ key }}: {{ value }}
          </p>
        </template>
      </div>
    </div>
  </teleport>
</template>