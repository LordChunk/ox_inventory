import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import type { State, Inventory, SlotWithItem, Slot } from '../typings'
import { moveSlots, refreshSlots, setupInventory, stackSlots, swapSlots } from '../utils/inventory'

// Initial state structure similar to the Redux store
const initialState: State = {
  leftInventory: {
    id: '',
    type: '',
    slots: 0,
    maxWeight: 0,
    items: [],
  },
  rightInventory: {
    id: '',
    type: '',
    slots: 0,
    maxWeight: 0,
    items: [],
  },
  additionalMetadata: [],
  itemAmount: 0,
  shiftPressed: false,
  isBusy: false,
}

export const useInventoryStore = defineStore('inventory', () => {
  // State is reactive in Vue/Pinia
  const state = reactive<State>({ ...initialState })

  // Keep a copy of the state for history (similar to current() in Redux)
  let history: { leftInventory: Inventory; rightInventory: Inventory } | null = null

  // Getters (equivalent to Redux selectors)
  const leftInventory = computed(() => state.leftInventory)
  const rightInventory = computed(() => state.rightInventory)
  const itemAmount = computed(() => state.itemAmount)
  const isBusy = computed(() => state.isBusy)
  const shiftPressed = computed(() => state.shiftPressed)

  // Actions (equivalent to Redux action creators and reducers)
  function setupInventoryState(payload: { leftInventory?: Inventory; rightInventory?: Inventory }) {
    setupInventory(state, payload)
  }

  function moveItem(data: {
    fromSlot: SlotWithItem;
    toSlot: Slot;
    fromType: Inventory['type'];
    toType: Inventory['type'];
    count: number
  }) {
    moveSlots(state, data)
  }

  function swapItems(data: {
    fromSlot: SlotWithItem;
    toSlot: SlotWithItem;
    fromType: Inventory['type'];
    toType: Inventory['type']
  }) {
    swapSlots(state, data)
  }

  function stackItems(data: {
    fromSlot: SlotWithItem;
    toSlot: SlotWithItem;
    fromType: Inventory['type'];
    toType: Inventory['type'];
    count: number
  }) {
    stackSlots(state, data)
  }

  function refreshInventory(payload: Parameters<typeof refreshSlots>[1]) {
    refreshSlots(state, payload)
  }

  // Set additional metadata for items
  function setAdditionalMetadata(metadata: Array<{ metadata: string; value: string }>) {
    const newMetadata = []

    for (let i = 0; i < metadata.length; i++) {
      const entry = metadata[i]
      if (!state.additionalMetadata.find((el) => el.value === entry.value)) {
        newMetadata.push(entry)
      }
    }

    state.additionalMetadata = [...state.additionalMetadata, ...newMetadata]
  }

  // Update item amount
  function setItemAmount(amount: number) {
    state.itemAmount = amount
  }

  // Update shift key state
  function setShiftPressed(pressed: boolean) {
    state.shiftPressed = pressed
  }

  // Update container weight
  function setContainerWeight(weight: number) {
    const containerInventory = state.rightInventory.type === 'container' ? state.rightInventory : state.leftInventory.type === 'container' ? state.leftInventory : null;
    if (!containerInventory) return;

    // Find the item representing this container in the *other* inventory
    const otherInventory = containerInventory === state.leftInventory ? state.rightInventory : state.leftInventory;
    const containerItem = otherInventory.items.find(
      (item): item is SlotWithItem => // Type guard
        'metadata' in item && item.metadata?.container === containerInventory.id
    );

    if (containerItem) {
      // Update container weight with a new array to ensure reactivity
      const newItems = [...otherInventory.items];
      const index = newItems.findIndex(item => item.slot === containerItem.slot);
      if (index !== -1) {
        newItems[index] = { ...containerItem, weight };
        otherInventory.items = newItems;
      }
    }
  }

  // Handle pending state (start of async operation)
  function setPending() {
    state.isBusy = true
    // Save current state for potential rollback
    history = {
      leftInventory: JSON.parse(JSON.stringify(state.leftInventory)),
      rightInventory: JSON.parse(JSON.stringify(state.rightInventory))
    }
  }

  // Handle fulfilled state (successful async operation)
  function setFulfilled() {
    state.isBusy = false
    history = null // Clear saved state
  }

  // Handle rejected state (failed async operation)
  function setRejected() {
    if (history) {
      // Restore previous state - use Object.assign for reactivity
      Object.assign(state.leftInventory, history.leftInventory)
      Object.assign(state.rightInventory, history.rightInventory)
      history = null
    }
    state.isBusy = false
  }

  return {
    // State
    state,

    // Getters
    leftInventory,
    rightInventory,
    itemAmount,
    isBusy,
    shiftPressed,

    // Actions
    setupInventory: setupInventoryState,
    moveSlots: moveItem,
    swapSlots: swapItems,
    stackSlots: stackItems,
    refreshSlots: refreshInventory,
    setAdditionalMetadata,
    setItemAmount,
    setShiftPressed,
    setContainerWeight,
    setPending,
    setFulfilled,
    setRejected
  }
})
