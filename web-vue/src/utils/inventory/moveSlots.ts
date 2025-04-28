import type { Inventory, Slot, SlotWithItem, State } from '../../typings'
import { itemDurability } from '../../utils/helpers'
import { getTargetInventory } from '../../utils/helpers'

export function moveSlots(
  state: State,
  data: {
    fromSlot: SlotWithItem
    fromType: Inventory['type']
    toSlot: Slot
    toType: Inventory['type']
    count: number
  }
) {
  const { fromSlot, fromType, toSlot, toType, count } = data
  const { sourceInventory, targetInventory } = getTargetInventory(state, fromType, toType)
  const pieceWeight = fromSlot.weight / fromSlot.count
  const curTime = Math.floor(Date.now() / 1000)
  const fromItem = sourceInventory.items.find((item: Slot) => item.slot === fromSlot.slot)

  if (!fromItem) return; // Should not happen if called correctly

  // Create the new item for the target slot
  const newItem: SlotWithItem = {
    ...(fromItem as SlotWithItem), // Cast needed as find could return undefined theoretically
    count: count,
    weight: pieceWeight * count,
    slot: toSlot.slot,
    durability: itemDurability(fromItem.metadata, curTime),
  };

  // Update target inventory items (ensure reactivity)
  const targetIndex = targetInventory.items.findIndex((item: Slot) => item.slot === toSlot.slot);
  const newTargetItems = [...targetInventory.items];
  if (targetIndex !== -1) {
    newTargetItems[targetIndex] = newItem;
  } else {
    // Find the correct position to insert if the slot wasn't pre-filled
     let insertIndex = newTargetItems.findIndex((item: Slot) => item.slot > newItem.slot);
     if (insertIndex === -1) insertIndex = newTargetItems.length; // Append if largest slot
     newTargetItems.splice(insertIndex, 0, newItem);
  }
  targetInventory.items = newTargetItems;


  // Update source inventory items if not shop/crafting (ensure reactivity)
  if (fromType !== 'shop' && fromType !== 'crafting') {
    const sourceIndex = sourceInventory.items.findIndex((item: Slot) => item.slot === fromSlot.slot);
    if (sourceIndex !== -1) {
       const newSourceItems = [...sourceInventory.items];
      if (fromSlot.count - count > 0) {
        newSourceItems[sourceIndex] = {
          ...(newSourceItems[sourceIndex] as SlotWithItem),
          count: fromSlot.count - count,
          weight: pieceWeight * (fromSlot.count - count),
        };
      } else {
        // Remove the item completely
         newSourceItems.splice(sourceIndex, 1);
      }
       sourceInventory.items = newSourceItems;
    }
  }
}
