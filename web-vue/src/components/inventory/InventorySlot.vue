<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Slot as InventorySlot, Inventory, SlotWithItem } from '../../typings'
import { useTooltipStore } from '../../stores/tooltip'
import { useItemsStore } from '../../stores/items'
import { useDragStore } from '../../stores/dragAndDrop'
import { useInventoryStore } from '../../stores/inventory'
import { moveItem, dropItem, useItem } from '../../utils/inventoryOperations'
import WeightBar from '../utils/WeightBar.vue'
import { isSlotWithItem } from '@/helpers'

// Props
const props = defineProps<{
  item: InventorySlot
  inventoryType: Inventory['type']
  inventoryGroups?: Inventory['groups']
  inventoryId: Inventory['id']
}>()

// Stores
const tooltipStore = useTooltipStore()
const itemsStore = useItemsStore()
const dragStore = useDragStore()
const inventoryStore = useInventoryStore()

// Refs
const tooltipTimer = ref<number | null>(null)
const isOver = ref(false)

// Check if the slot contains an item
const hasItem = computed(() => isSlotWithItem(props.item))

// Format weight for display
const formattedWeight = computed(() => {
  if (!hasItem.value || props.item.weight <= 0) return ''
  
  if (props.item.weight >= 1000) {
    return `${(props.item.weight / 1000).toLocaleString('en-us', {
      minimumFractionDigits: 2,
    })}kg `
  }
  
  return `${props.item.weight.toLocaleString('en-us', {
    minimumFractionDigits: 0,
  })}g `
})

// Format count for display
const formattedCount = computed(() => {
  if (!hasItem.value || !props.item.count) return ''
  return `${props.item.count.toLocaleString('en-us')}x`
})

// Get the display label for the item
const itemLabel = computed(() => {
  if (!hasItem.value) return ''
  
  const typedItem = props.item as SlotWithItem
  
  if (typedItem.metadata?.label) {
    return typedItem.metadata.label
  }
  
  const itemData = itemsStore.items[typedItem.name]
  return itemData?.label || typedItem.name
})

// Get image URL for the item
function getImageUrl(item: SlotWithItem) {
  if (item.metadata?.imageurl) return item.metadata.imageurl
  
  // For demo, returning a placeholder image
  return `https://via.placeholder.com/100?text=${item.name}`
}

// Handle mouse events for tooltip display
function handleMouseEnter() {
  if (!hasItem.value) return
  
  tooltipTimer.value = window.setTimeout(() => {
    tooltipStore.openTooltip({ 
      item: props.item as SlotWithItem, 
      inventoryType: props.inventoryType 
    })
  }, 500)
}

function handleMouseLeave() {
  tooltipStore.closeTooltip()
  if (tooltipTimer.value) {
    clearTimeout(tooltipTimer.value)
    tooltipTimer.value = null
  }
}

// Drag events
function handleDragStart(event: MouseEvent) {
  // Only allow dragging if the slot has an item
  if (!hasItem.value) return
  
  // Clear any tooltip timers and close tooltips
  if (tooltipTimer.value) {
    clearTimeout(tooltipTimer.value)
    tooltipTimer.value = null
  }
  tooltipStore.closeTooltip()
  
  // Start the drag operation
  dragStore.startDrag(
    {
      inventory: props.inventoryType,
      item: {
        name: (props.item as SlotWithItem).name,
        slot: props.item.slot
      },
      image: `url(${getImageUrl(props.item as SlotWithItem)})`
    },
    { x: event.clientX, y: event.clientY }
  )
  
  // Prevent default browser drag behavior
  event.preventDefault()
}

// Drop events
function handleDragOver() {
  isOver.value = true
}

function handleDragLeave() {
  isOver.value = false
}

function handleDrop() {
  if (dragStore.isDragging) {
    const result = dragStore.handleDrop({
      inventory: props.inventoryType,
      item: { slot: props.item.slot }
    })
    
    if (result) {
      // Process the drop based on inventory types
      processDrop(result.source, result.target)
    }
    
    isOver.value = false
  }
}

// Handle item moves between slots/inventories
function processDrop(source: any, target: any) {
  // Different actions based on source inventory type
  const sourceInventory = source.inventory
  
  if (sourceInventory === props.inventoryType && source.item.slot === props.item.slot) {
    // Dropped on itself - do nothing
    return
  }
  
  // Always use 1 as the count for now (in a real app, you'd consider the itemAmount from the store)
  const count = 1
  
  // Process the move between slots
  moveItem(
    source.item.slot,
    source.inventory,
    target.item.slot,
    target.inventory,
    count
  )
}

// Handle click events (for using items)
function handleClick(event: MouseEvent) {
  // Clear tooltip
  tooltipStore.closeTooltip()
  if (tooltipTimer.value) {
    clearTimeout(tooltipTimer.value)
    tooltipTimer.value = null
  }
  
  // Handle special key combinations similar to the React version
  if (event.ctrlKey && hasItem.value && props.inventoryType !== 'shop' && props.inventoryType !== 'crafting') {
    // Drop item with Ctrl+Click
    dropItem(props.item.slot, 1)
  } else if (event.altKey && hasItem.value && props.inventoryType === 'player') {
    // Use item with Alt+Click
    useItem(props.item.slot)
  }
}

// Handle context menu
function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
  
  if (props.inventoryType !== 'player' || !hasItem.value) return
  
  console.log('Opening context menu for item:', props.item)
  // To be implemented for context menu
}

// Check if we can drag this item
function canDragItem() {
  return hasItem.value && !inventoryStore.isBusy
}
</script>

<template>
  <div 
    class="inventory-slot relative w-16 h-16 bg-slate-700 rounded border border-slate-600 flex items-center justify-center overflow-hidden"
    :class="{ 'border-dashed border-white/40': isOver }"
    @click="handleClick"
    @contextmenu="handleContextMenu"
    @mousedown="canDragItem() ? handleDragStart($event) : null"
    @mouseenter="handleDragOver"
    @mouseleave="handleDragLeave"
    @mouseup="handleDrop"
  >
    <!-- Item content -->
    <div 
      v-if="hasItem"
      class="item-content h-full w-full flex flex-col"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- Background image -->
      <div 
        class="absolute inset-0 bg-cover bg-center z-0" 
        :style="{ backgroundImage: `url(${getImageUrl(props.item as SlotWithItem)})` }"
      ></div>
      
      <!-- Item header with weight and count -->
      <div 
        class="item-header z-10 flex justify-between items-start p-1 text-xs bg-gradient-to-b from-black/70 to-transparent w-full"
        :class="{ 'hotslot': props.inventoryType === 'player' && props.item.slot <= 5 }"
      >
        <!-- Slot number for hotbar -->
        <div v-if="props.inventoryType === 'player' && props.item.slot <= 5" 
          class="slot-number bg-white text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center absolute top-1 left-1">
          {{ props.item.slot }}
        </div>
        
        <div class="item-info ml-auto flex flex-col items-end">
          <span v-if="formattedWeight" class="font-mono">{{ formattedWeight }}</span>
          <span v-if="formattedCount" class="font-mono">{{ formattedCount }}</span>
        </div>
      </div>
      
      <!-- Item footer with durability bar and label -->
      <div class="mt-auto z-10 w-full">
        <!-- Durability bar -->
        <WeightBar 
          v-if="props.item.durability !== undefined" 
          :percent="props.item.durability" 
          :durability="true" 
          class="h-1"
        />
        
        <!-- Item label -->
        <div class="bg-black/70 text-xs p-1 truncate text-center">
          {{ itemLabel }}
        </div>
      </div>
    </div>
  </div>
</template>