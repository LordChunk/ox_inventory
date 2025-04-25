<script setup lang="ts">
import { onMounted } from 'vue'
import { useInventoryStore } from './stores/inventory'
import { useItemsStore } from './stores/items'
import InventoryComponent from './components/inventory/InventoryComponent.vue'
import { fetchNui } from './utils/fetchNui'

// For debugging purposes, initialize with some test data
const inventory = useInventoryStore()
const itemsStore = useItemsStore()

// Setup test data similar to how the React version does it
onMounted(() => {
  // Simulate initial data
  const debugItems = {
    water: {
      name: 'water',
      close: false,
      label: 'Water',
      stack: true,
      usable: true,
      count: 0,
    },
    burger: {
      name: 'burger',
      close: false,
      label: 'Burger',
      stack: false,
      usable: false,
      count: 0,
    },
    iron: {
      name: 'iron',
      label: 'Iron',
      stack: true,
      usable: false,
      close: false,
      count: 0
    },
    copper: {
      name: 'copper',
      label: 'Copper',
      stack: true,
      usable: false,
      close: false,
      count: 0
    },
    powersaw: {
      name: 'powersaw',
      label: 'Power Saw',
      stack: false,
      usable: true,
      close: false,
      count: 0
    },
  }
  
  itemsStore.setItems(debugItems)

  inventory.setupInventory({
    leftInventory: {
      id: 'test',
      type: 'player',
      slots: 50,
      label: 'Bob Smith',
      weight: 3000,
      maxWeight: 5000,
      items: [
        {
          slot: 1,
          name: 'iron',
          weight: 3000,
          metadata: {
            description: 'Iron ore material',
            ammo: 3,
          },
          count: 5,
        },
        { 
          slot: 2, 
          name: 'powersaw', 
          weight: 500, 
          count: 1, 
          metadata: { durability: 75 } 
        },
        { 
          slot: 3, 
          name: 'copper', 
          weight: 100, 
          count: 12, 
          metadata: { type: 'Special' } 
        },
        {
          slot: 4,
          name: 'water',
          weight: 100,
          count: 3,
          metadata: { description: 'Fresh drinking water' },
        },
        { 
          slot: 5, 
          name: 'water', 
          weight: 100, 
          count: 1 
        },
      ],
    }
  })

  // Signal that UI is loaded
  fetchNui('uiLoaded', {})
})
</script>

<template>
  <div class="app-wrapper bg-slate-900 text-white min-h-screen">
    <InventoryComponent />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: rgb(15 23 42); /* slate-900 */
}
</style>
