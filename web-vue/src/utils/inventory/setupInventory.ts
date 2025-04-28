import type { Inventory, State, Slot, SlotWithItem } from '../../typings'
import { getItemData, itemDurability } from '../../utils/helpers'
import { useItemsStore } from '../../stores/items'

export function setupInventory(
  state: State,
  payload: {
    leftInventory?: Inventory
    rightInventory?: Inventory
  }
) {
  const { leftInventory, rightInventory } = payload
  const curTime = Math.floor(Date.now() / 1000)
  const itemsStore = useItemsStore();

  const processInventory = (invData?: Inventory): Inventory | undefined => {
    if (!invData) return undefined;

    // Create a base inventory structure
    const processedInv: Inventory = {
      ...invData, // Spread existing properties first
      items: [], // Initialize items array
    };

    // Ensure items is an array, convert if it's an object (like in original data)
    const itemsArray = Array.isArray(invData.items)
      ? invData.items
      : Object.values(invData.items);

    processedInv.items = Array.from({ length: invData.slots }, (_, index): Slot => {
      const slotNum = index + 1;
      const existingItem = itemsArray.find((item): item is SlotWithItem =>
        typeof item === 'object' && item !== null && 'slot' in item && item.slot === slotNum
      );

      if (existingItem && existingItem.name) {
        // Ensure item data exists in the store
        if (!itemsStore.items[existingItem.name]) {
          getItemData(existingItem.name);
        }
        // Calculate durability and return the item
        return {
          ...existingItem,
          durability: itemDurability(existingItem.metadata, curTime),
        };
      } else {
        // Return an empty slot object
        return { slot: slotNum };
      }
    });
    return processedInv;
  };

  const processedLeft = processInventory(leftInventory);
  if (processedLeft) {
    // Assign properties individually or use Object.assign for reactivity
    Object.assign(state.leftInventory, processedLeft);
  }

  const processedRight = processInventory(rightInventory);
  if (processedRight) {
    Object.assign(state.rightInventory, processedRight);
  }

  // Reset interaction states
  state.shiftPressed = false;
  state.isBusy = false;
}
