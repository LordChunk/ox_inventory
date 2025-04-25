import { useInventoryStore } from '../stores/inventory'
import type { Slot, SlotWithItem, Inventory } from '../typings'
import { fetchNui } from './fetchNui'
import { canStack, isSlotWithItem } from '../helpers'

// Get target inventories based on source and target types
export function getTargetInventory(
  sourceType: Inventory['type'],
  targetType?: Inventory['type']
): { sourceInventory: Inventory; targetInventory: Inventory } {
  const inventoryStore = useInventoryStore()
  
  return {
    sourceInventory: 
      sourceType === 'player' ? inventoryStore.leftInventory : inventoryStore.rightInventory,
    targetInventory: 
      targetType
        ? targetType === 'player'
          ? inventoryStore.leftInventory
          : inventoryStore.rightInventory
        : sourceType === 'player'
          ? inventoryStore.rightInventory
          : inventoryStore.leftInventory,
  }
}

// Perform swap between two slots
export function swapSlots(
  sourceInventory: Inventory,
  targetInventory: Inventory,
  fromSlot: SlotWithItem,
  toSlot: SlotWithItem,
  count: number
) {
  const inventoryStore = useInventoryStore()
  
  // Find the source and target items in the inventories
  const sourceIndex = sourceInventory.items.findIndex(item => item.slot === fromSlot.slot)
  const targetIndex = targetInventory.items.findIndex(item => item.slot === toSlot.slot)
  
  if (sourceIndex === -1 || targetIndex === -1) return
  
  // Clone the items to avoid direct mutation
  const sourceItem = { ...sourceInventory.items[sourceIndex] } as SlotWithItem
  const targetItem = { ...targetInventory.items[targetIndex] } as SlotWithItem
  
  // Swap slots
  if (sourceInventory.id === targetInventory.id) {
    // Same inventory, simple swap
    inventoryStore.swapSlots({
      fromSlot: sourceItem,
      toSlot: targetItem,
      fromType: sourceInventory.type,
      toType: targetInventory.type,
      count
    })
  } else {
    // Different inventories
    inventoryStore.swapSlots({
      fromSlot: sourceItem,
      toSlot: targetItem,
      fromType: sourceInventory.type,
      toType: targetInventory.type,
      count
    })
  }
}

// Stack items of the same type
export function stackSlots(
  sourceInventory: Inventory,
  targetInventory: Inventory,
  fromSlot: SlotWithItem,
  toSlot: SlotWithItem,
  count: number
) {
  const inventoryStore = useInventoryStore()
  
  // Stack items when they're the same type
  inventoryStore.stackSlots({
    fromSlot,
    toSlot,
    fromType: sourceInventory.type,
    toType: targetInventory.type,
    count
  })
}

// Move an item to an empty slot
export function moveSlots(
  sourceInventory: Inventory,
  targetInventory: Inventory,
  fromSlot: SlotWithItem,
  toSlot: { slot: number },
  count: number
) {
  const inventoryStore = useInventoryStore()
  
  // Move item to empty slot
  inventoryStore.moveSlots({
    fromSlot,
    toSlot,
    fromType: sourceInventory.type,
    toType: targetInventory.type,
    count
  })
}

// Movement operations - main function that determines what kind of move to perform
export async function moveItem(
  fromSlot: number,
  fromType: string,
  toSlot: number,
  toType: string,
  count: number
) {
  const inventoryStore = useInventoryStore()
  
  // Mark inventory as busy while operation is in progress
  inventoryStore.setPending()
  
  try {
    // Get the source and target inventories
    const { sourceInventory, targetInventory } = getTargetInventory(fromType, toType)
    
    // Find the source item
    const sourceSlotItem = sourceInventory.items.find(item => item.slot === fromSlot) as SlotWithItem | undefined
    
    // Find if there's an item in the target slot
    const targetSlotItem = targetInventory.items.find(item => item.slot === toSlot)
    
    if (!sourceSlotItem) {
      console.error('Source slot item not found')
      inventoryStore.setRejected()
      return false
    }
    
    console.log('Source item:', sourceSlotItem)
    console.log('Target slot:', toSlot)
    console.log('Target item exists:', !!targetSlotItem)
    
    // Optimistic UI update based on the type of operation
    if (targetSlotItem) {
      console.log('Target has item, checking if can stack')
      
      // Target slot has an item - check if we can stack
      if (canStack(sourceSlotItem, targetSlotItem)) {
        console.log('Stacking items')
        // Stack items of same type
        stackSlots(sourceInventory, targetInventory, sourceSlotItem, targetSlotItem as SlotWithItem, count)
      } else {
        console.log('Swapping items')
        // Swap different items
        swapSlots(sourceInventory, targetInventory, sourceSlotItem, targetSlotItem as SlotWithItem, count)
      }
    } else {
      // Move to empty slot
      console.log('Moving to empty slot:', toSlot)
      moveSlots(sourceInventory, targetInventory, sourceSlotItem, { slot: toSlot }, count)
    }
    
    // Send the update to the server for validation
    const response = await fetchNui<boolean | number>('swapItems', { 
      fromSlot, 
      fromType, 
      toSlot, 
      toType, 
      count 
    }).catch(() => true) // In development mode, simulate success
    
    if (response === false) {
      // Server rejected the move, roll back to previous state
      console.log('Server rejected the move, rolling back')
      inventoryStore.setRejected()
      return false
    }
    
    // If the response is a number, it's the new container weight
    if (typeof response === 'number') {
      inventoryStore.setContainerWeight(response)
    }
    
    // Operation successful
    inventoryStore.setFulfilled()
    return true
  } catch (error) {
    console.error('Error moving item:', error)
    inventoryStore.setRejected()
    return false
  }
}

// Handle dropping an item on the ground
export async function dropItem(slot: number, count: number) {
  console.log(`Dropping ${count} items from slot ${slot}`)
  try {
    return await fetchNui<boolean>('dropItem', { slot, count })
  } catch (error) {
    console.error('Error dropping item:', error)
    return false
  }
}

// Use an item 
export async function useItem(slot: number) {
  console.log(`Using item in slot ${slot}`)
  try {
    return await fetchNui<boolean>('useItem', slot)
  } catch (error) {
    console.error('Error using item:', error)
    return false
  }
}

// Give an item to another player
export async function giveItem(slot: number, count: number) {
  console.log(`Giving ${count} items from slot ${slot}`)
  try {
    return await fetchNui<boolean>('giveItem', { slot, count })
  } catch (error) {
    console.error('Error giving item:', error)
    return false
  }
}