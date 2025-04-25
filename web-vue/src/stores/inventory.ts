import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import type { State, Inventory, SlotWithItem, Slot } from '../typings'

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

  // Actions (equivalent to Redux action creators and reducers)
  
  // Set up inventory with initial data
  function setupInventory(payload: { leftInventory?: Inventory; rightInventory?: Inventory }) {
    if (payload.leftInventory) {
      Object.assign(state.leftInventory, payload.leftInventory)
    }
    
    if (payload.rightInventory) {
      Object.assign(state.rightInventory, payload.rightInventory)
    }
  }

  // Helper to find an item in an inventory
  function findItemBySlot(inventory: Inventory, slot: number) {
    return inventory.items.findIndex((item) => item.slot === slot)
  }
  
  // Move an item to an empty slot
  function moveSlots(data: { 
    fromSlot: SlotWithItem; 
    toSlot: { slot: number }; 
    fromType: string; 
    toType: string; 
    count: number 
  }) {
    console.log('Moving item', data)
    // Determine which inventories we're working with
    const sourceInventory = data.fromType === 'player' ? state.leftInventory : state.rightInventory
    const targetInventory = data.toType === 'player' ? state.leftInventory : state.rightInventory
    
    // Find the source item
    const sourceIndex = findItemBySlot(sourceInventory, data.fromSlot.slot)
    if (sourceIndex === -1) return
    
    // Get the source item and clone it to avoid reference issues
    const sourceItem = { ...sourceInventory.items[sourceIndex] } as SlotWithItem
    
    // Move the entire item if count matches or is 0, otherwise split
    const moveCount = data.count === 0 ? sourceItem.count : Math.min(data.count, sourceItem.count)
    
    // Create a new item for the target slot
    const newItem = {
      ...sourceItem,
      slot: data.toSlot.slot,
      count: moveCount
    }
    
    // Create new items arrays to ensure reactivity
    if (sourceInventory === targetInventory) {
      // Same inventory
      const newItems = [...sourceInventory.items]
      
      if (moveCount === sourceItem.count) {
        // Remove the entire item
        newItems.splice(sourceIndex, 1)
      } else {
        // Reduce the count
        newItems[sourceIndex] = {
          ...newItems[sourceIndex],
          count: (newItems[sourceIndex] as SlotWithItem).count - moveCount
        }
      }
      
      // Add the new item
      newItems.push(newItem)
      
      // Replace the inventory items array
      if (data.fromType === 'player') {
        state.leftInventory.items = newItems
      } else {
        state.rightInventory.items = newItems
      }
    } else {
      // Different inventories
      const newSourceItems = [...sourceInventory.items]
      const newTargetItems = [...targetInventory.items]
      
      if (moveCount === sourceItem.count) {
        // Remove the entire item
        newSourceItems.splice(sourceIndex, 1)
      } else {
        // Reduce the count
        newSourceItems[sourceIndex] = {
          ...newSourceItems[sourceIndex],
          count: (newSourceItems[sourceIndex] as SlotWithItem).count - moveCount
        }
      }
      
      // Add the new item
      newTargetItems.push(newItem)
      
      // Replace both inventory item arrays
      if (data.fromType === 'player') {
        state.leftInventory.items = newSourceItems
        state.rightInventory.items = newTargetItems
      } else {
        state.rightInventory.items = newSourceItems
        state.leftInventory.items = newTargetItems
      }
    }
  }

  // Swap two items between slots
  function swapSlots(data: { 
    fromSlot: SlotWithItem; 
    toSlot: SlotWithItem; 
    fromType: string; 
    toType: string; 
    count: number 
  }) {
    console.log('Swapping items', data)
    // Determine which inventories we're working with
    const sourceInventory = data.fromType === 'player' ? state.leftInventory : state.rightInventory
    const targetInventory = data.toType === 'player' ? state.leftInventory : state.rightInventory
    
    // Find both items
    const sourceIndex = findItemBySlot(sourceInventory, data.fromSlot.slot)
    const targetIndex = findItemBySlot(targetInventory, data.toSlot.slot)
    
    if (sourceIndex === -1 || targetIndex === -1) return
    
    // Get the actual items and clone them to avoid reference issues
    const sourceItem = { ...sourceInventory.items[sourceIndex] } as SlotWithItem
    const targetItem = { ...targetInventory.items[targetIndex] } as SlotWithItem
    
    // Swap slot numbers
    const sourceSlot = sourceItem.slot
    targetItem.slot = sourceSlot
    sourceItem.slot = data.toSlot.slot
    
    if (sourceInventory === targetInventory) {
      // Same inventory - create a new items array
      const newItems = [...sourceInventory.items]
      newItems[sourceIndex] = targetItem
      newItems[targetIndex] = sourceItem
      
      // Replace the inventory items array
      if (data.fromType === 'player') {
        state.leftInventory.items = newItems
      } else {
        state.rightInventory.items = newItems
      }
    } else {
      // Different inventories - create new items arrays
      const newSourceItems = [...sourceInventory.items]
      const newTargetItems = [...targetInventory.items]
      
      // Replace items in both arrays
      newSourceItems[sourceIndex] = targetItem
      newTargetItems[targetIndex] = sourceItem
      
      // Replace both inventory item arrays
      if (data.fromType === 'player') {
        state.leftInventory.items = newSourceItems
        state.rightInventory.items = newTargetItems
      } else {
        state.rightInventory.items = newSourceItems
        state.leftInventory.items = newTargetItems
      }
    }
  }

  // Stack items of the same type
  function stackSlots(data: { 
    fromSlot: SlotWithItem; 
    toSlot: SlotWithItem; 
    fromType: string; 
    toType: string; 
    count: number 
  }) {
    console.log('Stacking items', data)
    // Determine which inventories we're working with
    const sourceInventory = data.fromType === 'player' ? state.leftInventory : state.rightInventory
    const targetInventory = data.toType === 'player' ? state.leftInventory : state.rightInventory
    
    // Find both items
    const sourceIndex = findItemBySlot(sourceInventory, data.fromSlot.slot)
    const targetIndex = findItemBySlot(targetInventory, data.toSlot.slot)
    
    if (sourceIndex === -1 || targetIndex === -1) return
    
    // Clone the arrays to ensure reactivity
    const newSourceItems = [...sourceInventory.items]
    const newTargetItems = [...targetInventory.items]
    
    // Get the actual items
    const sourceItem = newSourceItems[sourceIndex] as SlotWithItem
    const targetItem = newTargetItems[targetIndex] as SlotWithItem
    
    // Determine count to move
    const moveCount = data.count === 0 ? sourceItem.count : Math.min(data.count, sourceItem.count)
    
    // Update target item count
    newTargetItems[targetIndex] = {
      ...targetItem,
      count: targetItem.count + moveCount
    }
    
    // Update or remove source item
    if (moveCount === sourceItem.count) {
      // Remove the entire item
      newSourceItems.splice(sourceIndex, 1)
    } else {
      // Reduce the count
      newSourceItems[sourceIndex] = {
        ...sourceItem,
        count: sourceItem.count - moveCount
      }
    }
    
    // Replace the inventory items arrays
    if (sourceInventory === targetInventory) {
      // Same inventory
      if (data.fromType === 'player') {
        state.leftInventory.items = newSourceItems
      } else {
        state.rightInventory.items = newSourceItems
      }
    } else {
      // Different inventories
      if (data.fromType === 'player') {
        state.leftInventory.items = newSourceItems
        state.rightInventory.items = newTargetItems
      } else {
        state.rightInventory.items = newSourceItems
        state.leftInventory.items = newTargetItems
      }
    }
  }

  // Update slots after refresh
  function refreshSlots(data: {
    items?: any | any[];
    itemCount?: Record<string, number>;
    weightData?: { inventoryId: string; maxWeight: number };
    slotsData?: { inventoryId: string; slots: number };
  }) {
    if (data.items) {
      if (Array.isArray(data.items)) {
        // Handle multiple item updates
        data.items.forEach((item) => {
          const inventory = item.inventory === state.leftInventory.id
            ? state.leftInventory
            : state.rightInventory
          
          const index = findItemBySlot(inventory, item.item.slot)
          
          if (index !== -1) {
            // Update existing item
            if (item.item.count && item.item.count > 0) {
              inventory.items[index] = { ...inventory.items[index], ...item.item }
            } else {
              // Remove item if count is 0
              inventory.items.splice(index, 1)
            }
          } else if (item.item.count && item.item.count > 0) {
            // Add new item
            inventory.items.push(item.item)
          }
        })
      } else {
        // Handle single item update
        const item = data.items
        const inventory = item.inventory === state.leftInventory.id
          ? state.leftInventory
          : state.rightInventory
        
        const index = findItemBySlot(inventory, item.item.slot)
        
        if (index !== -1) {
          if (item.item.count && item.item.count > 0) {
            inventory.items[index] = { ...inventory.items[index], ...item.item }
          } else {
            inventory.items.splice(index, 1)
          }
        } else if (item.item.count && item.item.count > 0) {
          inventory.items.push(item.item)
        }
      }
    }
    
    // Update item counts
    if (data.itemCount) {
      Object.entries(data.itemCount).forEach(([name, count]) => {
        // This would update a global item count, if needed
        console.log(`Item ${name} has global count ${count}`)
      })
    }
    
    // Update max weight
    if (data.weightData) {
      const inventory = data.weightData.inventoryId === state.leftInventory.id
        ? state.leftInventory
        : state.rightInventory
      
      inventory.maxWeight = data.weightData.maxWeight
    }
    
    // Update slot count
    if (data.slotsData) {
      const inventory = data.slotsData.inventoryId === state.leftInventory.id
        ? state.leftInventory
        : state.rightInventory
      
      inventory.slots = data.slotsData.slots
    }
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
    const container = state.leftInventory.items.find(
      (item) => item.metadata?.container === state.rightInventory.id
    ) as SlotWithItem | undefined

    if (!container) return

    container.weight = weight
  }

  // Handle pending state (start of async operation)
  function setPending() {
    state.isBusy = true
    
    // Save current state for potential rollback - deep clone to avoid reference issues
    history = {
      leftInventory: JSON.parse(JSON.stringify(state.leftInventory)),
      rightInventory: JSON.parse(JSON.stringify(state.rightInventory)),
    }
  }

  // Handle fulfilled state (successful async operation)
  function setFulfilled() {
    state.isBusy = false
  }

  // Handle rejected state (failed async operation)
  function setRejected() {
    if (history) {
      // Restore previous state
      state.leftInventory = history.leftInventory
      state.rightInventory = history.rightInventory
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
    
    // Actions
    setupInventory,
    moveSlots,
    swapSlots,
    stackSlots,
    refreshSlots,
    setAdditionalMetadata,
    setItemAmount,
    setShiftPressed,
    setContainerWeight,
    setPending,
    setFulfilled,
    setRejected
  }
})