<script setup lang="ts">
import { ref } from 'vue'
import { useInventoryStore } from '../../stores/inventory'
import InventoryGrid from './InventoryGrid.vue'
import Tooltip from '../utils/Tooltip.vue'
import DragPreview from '../utils/DragPreview.vue'

const inventory = useInventoryStore()
const inventoryVisible = ref(true)
</script>

<template>
  <div class="inventory-container p-4 flex justify-center items-center h-screen" v-if="inventoryVisible">
    <div class="inventory-wrapper flex gap-4">
      <!-- Left Inventory -->
      <InventoryGrid :inventory="inventory.leftInventory" />
      
      <!-- Right Inventory (commented out for now) -->
      <!-- <InventoryGrid :inventory="inventory.rightInventory" v-if="inventory.rightInventory.id" /> -->
    </div>
    
    <!-- Tooltip -->
    <Tooltip />
    
    <!-- Drag Preview -->
    <DragPreview />
  </div>
</template>

<style scoped>
.inventory-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>