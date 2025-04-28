import type { Inventory, Slot, SlotWithItem, State } from '../../typings'
import { getTargetInventory } from '../../utils/helpers'

export function stackSlots(
  state: State,
  data: {
    fromSlot: SlotWithItem
    fromType: Inventory['type']
    toSlot: SlotWithItem
    toType: Inventory['type']
    count: number
  }
) {
  const { fromSlot, fromType, toSlot, toType, count } = data
  const { sourceInventory, targetInventory } = getTargetInventory(state, fromType, toType)
  const pieceWeight = fromSlot.weight / fromSlot.count

  // Update target inventory item (ensure reactivity)
  const targetIndex = targetInventory.items.findIndex((item: Slot) => item.slot === toSlot.slot);
  if (targetIndex !== -1) {
     const newTargetItems = [...targetInventory.items];
     newTargetItems[targetIndex] = {
       ...(newTargetItems[targetIndex] as SlotWithItem),
       count: toSlot.count + count,
       weight: pieceWeight * (toSlot.count + count), // Use calculated piece weight
     };
     targetInventory.items = newTargetItems;
  }

  // Update source inventory item if not shop/crafting (ensure reactivity)
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
