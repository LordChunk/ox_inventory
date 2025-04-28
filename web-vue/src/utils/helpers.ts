import type { Inventory, InventoryType, Slot, SlotWithItem, State } from '../typings'
import { useItemsStore } from '../stores/items'

export function getTargetInventory(
  state: State,
  sourceType: Inventory['type'],
  targetType?: Inventory['type']
): { sourceInventory: Inventory; targetInventory: Inventory } {
  return {
    sourceInventory:
      sourceType === 'player' ? state.leftInventory : state.rightInventory,
    targetInventory:
      targetType
        ? targetType === 'player'
          ? state.leftInventory
          : state.rightInventory
        : sourceType === 'player'
          ? state.rightInventory
          : state.leftInventory,
  }
}

export function itemDurability(metadata: Record<string, any> | undefined, curTime: number): number {
  if (!metadata?.durability) return 100

  const { durability, degrade } = metadata
  if (!degrade) return durability

  const timeInSeconds = curTime - degrade
  const percentage = Math.ceil((timeInSeconds / 86400) * 100)

  return durability - (durability * (percentage / 100))
}

export function canStack(sourceSlot: SlotWithItem, targetSlot: SlotWithItem): boolean {
  if (!sourceSlot.name || !targetSlot.name) return false
  if (sourceSlot.name !== targetSlot.name) return false
  if (sourceSlot.metadata?.type !== targetSlot.metadata?.type) return false

  return true
}

export function isSlotWithItem(slot: Slot | undefined, log = false): slot is SlotWithItem {
  if (!slot) return false
  const hasName = 'name' in slot && typeof slot.name === 'string'
  if (log && !hasName) console.log('Slot missing name property')
  return hasName
}

// New function to get item data from the store or fetch it if needed
export function getItemData(itemName: string) {
  const itemsStore = useItemsStore()

  // Check if we already have the item data
  if (itemsStore.items[itemName]) return itemsStore.items[itemName]

  // TODO: Implement actual item data fetching logic
  // For now, just log that we need to fetch it
  console.log(`Need to fetch data for item: ${itemName}`)

  // Return a minimal placeholder
  return {
    name: itemName,
    label: itemName,
    weight: 0,
  }
}
