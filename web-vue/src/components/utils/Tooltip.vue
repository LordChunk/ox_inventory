<script setup lang="ts">
import { computed } from 'vue'
import { useTooltipStore } from '../../stores/tooltip'
import { useItemsStore } from '../../stores/items'
import { getImageUrl } from '../../helpers'

// Get stores
const tooltipStore = useTooltipStore()
const itemsStore = useItemsStore()

// Computed properties
const visible = computed(() => tooltipStore.visible)
const item = computed(() => tooltipStore.item)
const position = computed(() => tooltipStore.position)

// Calculate tooltip styles based on position
const tooltipStyle = computed(() => {
  if (!position.value) return {}
  
  // Basic positioning
  const style: Record<string, any> = {
    left: `${position.value.x + 10}px`,
    top: `${position.value.y + 10}px`,
  }
  
  return style
})

// Get item data
const getItemInfo = (name: string) => {
  return itemsStore.getItem(name)
}

// Format metadata for display
const formatMetadata = (metadata: Record<string, any>) => {
  if (!metadata) return []
  
  return Object.entries(metadata)
    .filter(([key]) => !['description', 'imageurl', 'image'].includes(key))
    .map(([key, value]) => ({ key, value }))
}
</script>

<template>
  <div v-if="visible && item" 
    class="tooltip bg-gray-800 text-white rounded p-3 shadow-lg absolute z-50"
    :style="tooltipStyle">
    
    <div class="flex gap-3">
      <!-- Item image -->
      <div v-if="item" class="w-16 h-16 bg-cover rounded" 
        :style="{ backgroundImage: `url(${getImageUrl(item)})` }">
      </div>
      
      <!-- Item info -->
      <div class="flex flex-col">
        <!-- Item name -->
        <h3 class="text-lg font-bold">
          {{ item?.label || item?.name }}
        </h3>
        
        <!-- Item weight -->
        <div class="text-sm text-gray-300">
          Weight: {{ item?.weight || 0 }}
        </div>
        
        <!-- Item info from item data -->
        <div v-if="getItemInfo(item?.name)" class="text-sm text-gray-300">
          {{ getItemInfo(item?.name)?.description }}
        </div>
      </div>
    </div>
    
    <!-- Item description from metadata -->
    <div v-if="item?.metadata?.description" class="mt-2 text-sm text-gray-300">
      {{ item.metadata.description }}
    </div>
    
    <!-- Metadata list -->
    <div v-if="item?.metadata" class="mt-2">
      <div v-for="(meta, index) in formatMetadata(item.metadata)" :key="index" 
        class="flex justify-between text-sm">
        <span class="text-gray-400">{{ meta.key }}:</span>
        <span>{{ meta.value }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tooltip {
  min-width: 200px;
  max-width: 300px;
}
</style>