<script setup lang="ts">
import { computed } from 'vue'
import { useTooltipStore } from '../../stores/tooltip'
import { useItemsStore } from '../../stores/items'
import type { SlotWithItem } from '../../typings/slot'

const tooltipStore = useTooltipStore()
const itemsStore = useItemsStore()

// Computed properties for tooltip positioning and data
const position = computed(() => tooltipStore.position)
const item = computed(() => tooltipStore.item)
const inventoryType = computed(() => tooltipStore.inventoryType)
const isVisible = computed(() => tooltipStore.isVisible)

// Get the item data from the items store
const itemData = computed(() => {
  if (!item.value) return null
  return itemsStore.getItem(item.value.name)
})

// Calculate tooltip style based on position
const tooltipStyle = computed(() => {
  return {
    left: `${position.value.x + 10}px`,
    top: `${position.value.y + 10}px`,
  }
})

// Get item description (from metadata or item data)
const description = computed(() => {
  if (!item.value) return null
  return item.value.metadata?.description || itemData.value?.description
})

// Calculate ingredients for crafting items
const ingredients = computed(() => {
  if (!item.value || !item.value.ingredients) return null
  return Object.entries(item.value.ingredients).sort((a, b) => a[1] - b[1])
})

// Get the ammo name if applicable
const ammoName = computed(() => {
  if (!itemData.value?.ammoName) return null
  const ammoItem = itemsStore.getItem(itemData.value.ammoName)
  return ammoItem?.label
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible && item"
      class="tooltip-wrapper"
      :style="tooltipStyle"
    >
      <div class="tooltip-header-wrapper">
        <p>{{ item.metadata?.label || itemData?.label || item.name }}</p>
        <div v-if="inventoryType === 'crafting'" class="tooltip-crafting-duration">
          <!-- Clock icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{{ ((item.duration !== undefined ? item.duration : 3000) / 1000).toFixed(1) }}s</p>
        </div>
        <p v-else>{{ item.metadata?.type }}</p>
      </div>
      
      <div class="tooltip-divider"></div>
      
      <div v-if="description" class="tooltip-description">
        {{ description }}
      </div>
      
      <template v-if="inventoryType !== 'crafting'">
        <p v-if="item.durability !== undefined">
          Durability: {{ Math.trunc(item.durability) }}
        </p>
        <p v-if="item.metadata?.ammo !== undefined">
          Ammo: {{ item.metadata.ammo }}
        </p>
        <p v-if="ammoName">
          Ammo Type: {{ ammoName }}
        </p>
        <p v-if="item.metadata?.serial">
          Serial: {{ item.metadata.serial }}
        </p>
        <!-- Add other metadata fields as needed -->
      </template>
      
      <div v-else-if="ingredients" class="tooltip-ingredients">
        <div 
          v-for="[itemName, count] in ingredients" 
          :key="`ingredient-${itemName}`"
          class="tooltip-ingredient"
        >
          <img :src="itemName ? `/images/${itemName}.png` : 'none'" alt="item-image" />
          <p>
            {{ count >= 1
                ? `${count}x ${itemsStore.getItem(itemName)?.label || itemName}`
                : count === 0
                ? `${itemsStore.getItem(itemName)?.label || itemName}`
                : count < 1 && `${(count * 100).toFixed(0)}% ${itemsStore.getItem(itemName)?.label || itemName}`
            }}
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.tooltip-wrapper {
  position: fixed;
  z-index: 100;
  background: rgba(15, 23, 42, 0.95);
  border-radius: 4px;
  padding: 0.75rem;
  color: white;
  width: max-content;
  max-width: 300px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tooltip-header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tooltip-divider {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 0.5rem 0;
}

.tooltip-description {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  white-space: pre-line;
}

.tooltip-crafting-duration {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tooltip-ingredients {
  margin-top: 0.5rem;
}

.tooltip-ingredient {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.tooltip-ingredient img {
  width: 1.5rem;
  height: 1.5rem;
  object-fit: contain;
}
</style>