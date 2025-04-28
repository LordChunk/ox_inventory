import type { Inventory, Slot, SlotWithItem, State } from '../../typings'
import { getTargetInventory, itemDurability } from '../../utils/helpers'

export function swapSlots(
  state: State,
  data: {
    fromSlot: SlotWithItem
    fromType: Inventory['type']
    toSlot: SlotWithItem
    toType: Inventory['type']
  }
) {
  const { fromSlot, fromType, toSlot, toType } = data
  const { sourceInventory, targetInventory } = getTargetInventory(state, fromType, toType)
  const curTime = Math.floor(Date.now() / 1000)

  const sourceIndex = sourceInventory.items.findIndex((item: Slot) => item.slot === fromSlot.slot);
  const targetIndex = targetInventory.items.findIndex((item: Slot) => item.slot === toSlot.slot);

  if (sourceIndex === -1 || targetIndex === -1) return; // Items not found

  // Create copies with updated slots and durability
  const newSourceItem = {
    ...targetInventory.items[targetIndex], // Start with target item data
    slot: fromSlot.slot, // Assign source slot number
    durability: itemDurability(targetInventory.items[targetIndex].metadata, curTime),
  };
  const newTargetItem = {
    ...sourceInventory.items[sourceIndex], // Start with source item data
    slot: toSlot.slot, // Assign target slot number
    durability: itemDurability(sourceInventory.items[sourceIndex].metadata, curTime),
  };

  // Update inventories ensuring reactivity
  if (sourceInventory === targetInventory) {
    // Same inventory
    const newItems = [...sourceInventory.items];
    newItems[sourceIndex] = newSourceItem as SlotWithItem; // Cast needed
    newItems[targetIndex] = newTargetItem as SlotWithItem; // Cast needed
    sourceInventory.items = newItems;
  } else {
    // Different inventories
    const newSourceItems = [...sourceInventory.items];
    const newTargetItems = [...targetInventory.items];
    newSourceItems[sourceIndex] = newSourceItem as SlotWithItem; // Cast needed
    newTargetItems[targetIndex] = newTargetItem as SlotWithItem; // Cast needed
    sourceInventory.items = newSourceItems;
    targetInventory.items = newTargetItems;
  }
}
