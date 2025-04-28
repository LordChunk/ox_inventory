import type { Slot, State } from '../../typings'
import { getItemData, itemDurability } from '../../utils/helpers'
import { useItemsStore } from '../../stores/items'

export type ItemsPayload = { item: Slot; inventory?: string }; // Allow string for inventory id

interface Payload {
  items?: ItemsPayload | ItemsPayload[];
  itemCount?: Record<string, number>;
  weightData?: { inventoryId: string; maxWeight: number };
  slotsData?: { inventoryId: string; slots: number };
}

export function refreshSlots(state: State, payload: Payload) {
  const itemsStore = useItemsStore(); // Get items store instance if needed

  if (payload.items) {
    const itemsToProcess = Array.isArray(payload.items) ? payload.items : [payload.items];
    const curTime = Math.floor(Date.now() / 1000);

    itemsToProcess
      .filter((data): data is ItemsPayload => !!data) // Type guard
      .forEach((data) => {
        // Determine target inventory based on inventory ID or type
        const targetInventory = data.inventory
          ? data.inventory === state.leftInventory.id || data.inventory === 'player'
            ? state.leftInventory
            : state.rightInventory
          : state.leftInventory; // Default to left if not specified

        // Ensure item data exists (similar to React version)
        if ('name' in data.item && data.item.name && !itemsStore.items[data.item.name]) {
           getItemData(data.item.name);
        }

        // Calculate durability
        data.item.durability = itemDurability(data.item.metadata, curTime);

        // Update or add the item in the target inventory
        const existingIndex = targetInventory.items.findIndex((i: Slot) => i.slot === data.item.slot);
        const newItems = [...targetInventory.items]; // Ensure reactivity

        if (existingIndex !== -1) {
          // Update existing item or remove if count is 0 or less
          if ('count' in data.item && data.item.count && data.item.count > 0) {
             newItems[existingIndex] = { ...newItems[existingIndex], ...data.item };
          } else {
             newItems.splice(existingIndex, 1); // Remove item
          }
        } else if ('count' in data.item && data.item.count && data.item.count > 0) {
          // Add new item if it has a count > 0
           // Find the correct position to insert
           let insertIndex = newItems.findIndex((item: Slot) => item.slot > data.item.slot);
           if (insertIndex === -1) insertIndex = newItems.length; // Append if largest slot
           newItems.splice(insertIndex, 0, data.item);
        }
         targetInventory.items = newItems; // Assign the new array back
      });

    // Janky workaround similar to React version
    if (state.rightInventory.type === 'crafting') {
       // Force reactivity - Pinia should handle this better, but mimicking logic
       state.rightInventory = { ...state.rightInventory, items: [...state.rightInventory.items] };
    }
  }

  if (payload.itemCount) {
    // This logic seems to update a global item store in React (Items).
    // How this translates depends on whether `useItemsStore` holds global counts.
    // Assuming itemsStore.items holds definitions and maybe counts:
    Object.entries(payload.itemCount).forEach(([name, count]) => {
      if (itemsStore.items[name]) {
        // Assuming items store might have a count property to update
        // itemsStore.items[name].count = (itemsStore.items[name].count || 0) + count;
        console.warn(`Item count update for ${name} not fully implemented for Vue store.`);
      } else {
        console.log(`Item data for ${name} is undefined in itemsStore`);
      }
    });
  }

  if (payload.weightData) {
    const inv =
      payload.weightData.inventoryId === state.leftInventory.id
        ? state.leftInventory
        : payload.weightData.inventoryId === state.rightInventory.id
        ? state.rightInventory
        : null;

    if (inv) {
      inv.maxWeight = payload.weightData.maxWeight;
    }
  }

  if (payload.slotsData) {
     const inv =
      payload.slotsData.inventoryId === state.leftInventory.id
        ? state.leftInventory
        : payload.slotsData.inventoryId === state.rightInventory.id
        ? state.rightInventory
        : null;

    if (inv) {
      const oldSlots = inv.slots;
      inv.slots = payload.slotsData.slots;

      // Re-initialize items array with correct length instead of using setupInventory
      const newItems = [...inv.items];
      const curTime = Math.floor(Date.now() / 1000);

      // Truncate if new slots is less than old slots
      if (inv.slots < oldSlots) {
        inv.items = newItems.filter((item: Slot) => item.slot <= inv.slots);
      }
      // Pad with empty slots if new slots is more than old slots
      else if (inv.slots > oldSlots) {
        for (let i = oldSlots + 1; i <= inv.slots; i++) {
          newItems.push({ slot: i });
        }
        inv.items = newItems;
      }
    }
  }
}
