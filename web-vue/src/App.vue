<script setup lang="ts">
import { ref, onMounted } from 'vue';
import InventoryComponent from './components/inventory/InventoryComponent.vue'
import DragHandler from './components/utils/DragHandler.vue'
import KeyPressHandler from './components/utils/KeyPressHandler.vue'
import MousePosition from './components/utils/MousePosition.vue'
import { debugData } from './utils/debugData';
import { useInventoryStore } from './stores/inventory';
import { useItemsStore } from './stores/items';
import useNuiEvent from './composables/useNuiEvent';
import { fetchNui } from './utils/fetchNui';
import type { Inventory } from './typings';
import { setImagePath } from './helpers';
import type { Payload } from './utils/inventory/refreshSlots';

// Get stores for state management
const inventoryStore = useInventoryStore()
const itemsStore = useItemsStore()

// Initialize UI loaded state
const uiLoaded = ref(false)

// Handle init event from server
useNuiEvent<{
  locale: { [key: string]: string }
  items: Record<string, any>
  leftInventory: Inventory
  imagepath: string
}>('init', ({ locale, items, leftInventory, imagepath }) => {

  for (const name in items) {
    itemsStore.setItem(name, items[name])
  }

  // Set image path and initialize inventory
  setImagePath(imagepath)
  inventoryStore.setupInventory({ leftInventory })
})

// Handle inventory setup
useNuiEvent<{
  leftInventory?: Inventory
  rightInventory?: Inventory
}>('setupInventory', (data) => {
  inventoryStore.setupInventory(data)
})

// Handle slot refresh events
useNuiEvent<Payload>('refreshSlots', (data) => {
  inventoryStore.refreshSlots(data)
})

// Handle metadata display updates
useNuiEvent<Array<{ metadata: string; value: string }>>('displayMetadata', (data) => {
  inventoryStore.setAdditionalMetadata(data)
})

// Handle inventory close event
useNuiEvent('closeInventory', () => {
  // Close any open menus or tooltips
})

// Notify server that UI has loaded
fetchNui('uiLoaded', {})

// For development purposes, initialize with test data when in browser environment
debugData([
  {
    action: 'setupInventory',
    data: {
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
              description: `name: Svetozar Miletic  \n Gender: Male`,
              ammo: 3,
              mustard: '60%',
              ketchup: '30%',
              mayo: '10%',
            },
            count: 5,
          },
          { slot: 2, name: 'powersaw', weight: 0, count: 1, metadata: { durability: 75 } },
          { slot: 3, name: 'copper', weight: 100, count: 12, metadata: { type: 'Special' } },
          {
            slot: 4,
            name: 'water',
            weight: 100,
            count: 1,
            metadata: { description: 'Generic item description' },
          },
          { slot: 5, name: 'water', weight: 100, count: 1 },
          {
            slot: 6,
            name: 'backwoods',
            weight: 100,
            count: 1,
            metadata: {
              label: 'Russian Cream',
              imageurl: 'https://i.imgur.com/2xHhTTz.png',
            },
          },
        ],
      },
      rightInventory: {
        id: 'shop',
        type: 'crafting',
        slots: 5000,
        label: 'Bob Smith',
        weight: 3000,
        maxWeight: 5000,
        items: [
          {
            slot: 1,
            name: 'lockpick',
            weight: 500,
            price: 300,
            ingredients: {
              iron: 5,
              copper: 12,
              powersaw: 0.1,
            },
            metadata: {
              description: 'Simple lockpick that breaks easily and can pick basic door locks',
            },
          },
        ],
      },
    },
  },
]);

// Prevent default HTML5 drag behavior
const preventDefault = (event: DragEvent) => event.preventDefault()
window.addEventListener('dragstart', preventDefault)
</script>

<template>
  <div class="app-wrapper bg-slate-900 text-white min-h-screen">
    <InventoryComponent />
    <DragHandler />
    <KeyPressHandler />
    <MousePosition />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style>
