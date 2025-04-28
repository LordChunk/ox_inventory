import { useInventoryStore } from '../stores/inventory'
import type { Slot, SlotWithItem, Inventory } from '../typings'
import { fetchNui } from './fetchNui'
import { canStack, isSlotWithItem } from '../helpers'

// Get target inventories based on source and target types
function getTargetInventory(
  sourceType: Inventory['type'],
  targetType?: Inventory['type']
): { sourceInventory: Inventory; targetInventory: Inventory } {
  const inventoryStore = useInventoryStore()
  return {
    sourceInventory: sourceType === 'player' ? inventoryStore.leftInventory : inventoryStore.rightInventory,
    targetInventory: targetType
      ? targetType === 'player'
        ? inventoryStore.leftInventory
        : inventoryStore.rightInventory
      : sourceType === 'player'
      ? inventoryStore.rightInventory
      : inventoryStore.leftInventory,
  }
}

// Determine the count to move based on item amount and available count
function getMoveCount(sourceSlot: SlotWithItem): number {
  const inventoryStore = useInventoryStore()
  const itemAmount = inventoryStore.itemAmount

  // If no specific amount is set, move one item
  if (itemAmount === 0) return 1

  // Return either the requested amount or maximum available
  return Math.min(itemAmount, sourceSlot.count)
}

// Movement operations - main function that determines what kind of move to perform
export async function moveItem(
  fromSlot: number,
  fromType: string,
  toSlot: number,
  toType: string
) {
  const inventoryStore = useInventoryStore()

  try {
    inventoryStore.setPending()

    const { sourceInventory, targetInventory } = getTargetInventory(fromType, toType)

    const sourceSlotItem = sourceInventory.items.find(item => item.slot === fromSlot) as SlotWithItem | undefined
    const targetSlotItem = targetInventory.items.find(item => item.slot === toSlot)

    if (!sourceSlotItem) {
      console.error('Source slot item not found')
      inventoryStore.setRejected()
      return false
    }

    // Calculate the count to move
    const count = getMoveCount(sourceSlotItem)

    // Send the request to server first
    const response = await fetchNui<boolean | number>('swapItems', {
      fromSlot,
      fromType,
      toSlot,
      toType,
      count
    })

    if (response === false) {
      inventoryStore.setRejected()
      return false
    }

    // If we got here, the server accepted the move
    if (targetSlotItem && isSlotWithItem(targetSlotItem)) {
      if (canStack(sourceSlotItem, targetSlotItem)) {
        inventoryStore.stackSlots({
          fromSlot: sourceSlotItem,
          toSlot: targetSlotItem,
          fromType,
          toType,
          count
        })
      } else {
        inventoryStore.swapSlots({
          fromSlot: sourceSlotItem,
          toSlot: targetSlotItem,
          fromType,
          toType
        })
      }
    } else {
      inventoryStore.moveSlots({
        fromSlot: sourceSlotItem,
        toSlot: { slot: toSlot },
        fromType,
        toType,
        count
      })
    }

    // If the response is a number, it's the new container weight
    if (typeof response === 'number') {
      inventoryStore.setContainerWeight(response)
    }

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
  const inventoryStore = useInventoryStore()
  try {
    inventoryStore.setPending()
    const response = await fetchNui<boolean>('dropItem', { slot, count })
    if (response) {
      inventoryStore.setFulfilled()
    } else {
      inventoryStore.setRejected()
    }
    return response
  } catch (error) {
    console.error('Error dropping item:', error)
    inventoryStore.setRejected()
    return false
  }
}

// Use an item
export async function useItem(slot: number) {
  const inventoryStore = useInventoryStore()
  try {
    inventoryStore.setPending()
    const response = await fetchNui<boolean>('useItem', slot)
    if (response) {
      inventoryStore.setFulfilled()
    } else {
      inventoryStore.setRejected()
    }
    return response
  } catch (error) {
    console.error('Error using item:', error)
    inventoryStore.setRejected()
    return false
  }
}

// Give an item to another player
export async function giveItem(slot: number) {
  const inventoryStore = useInventoryStore()
  try {
    const count = inventoryStore.itemAmount || 1
    inventoryStore.setPending()
    const response = await fetchNui<boolean>('giveItem', { slot, count })
    if (response) {
      inventoryStore.setFulfilled()
    } else {
      inventoryStore.setRejected()
    }
    return response
  } catch (error) {
    console.error('Error giving item:', error)
    inventoryStore.setRejected()
    return false
  }
}
