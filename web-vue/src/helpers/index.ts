import type { Inventory, InventoryType, ItemData, Slot, SlotWithItem } from '../typings'
import { isEqual } from 'lodash'
import { useInventoryStore } from '../stores/inventory'
import { useItemsStore } from '../stores/items'
import { fetchNui } from '../utils/fetchNui'
import { reactive } from 'vue'

// Reactive state for image path
const state = reactive({
  imagePath: '',
})

/**
 * Sets the image path for items
 * @param path - The base path for item images
 */
export function setImagePath(path: string) {
  state.imagePath = path
}

/**
 * Gets the image path for an item
 * @param item - The item to get the image for
 * @returns The URL for the item's image
 */
export function getImageUrl(item: SlotWithItem): string {
  // If the item has a custom image URL in metadata, use that
  if (item.metadata?.imageurl) return item.metadata.imageurl
  
  // Otherwise, construct the URL from the base path and item name
  return `${state.imagePath}/${item.name}.png`
}

/**
 * Calculate the total weight of items
 * @param items - Array of items to calculate weight for
 * @returns The total weight
 */
export function getTotalWeight(items: Slot[]): number {
  let weight = 0
  
  for (const item of items) {
    if ('weight' in item) {
      const count = 'count' in item ? item.count : 1
      weight += item.weight * count
    }
  }
  
  return weight
}

/**
 * Check if a slot contains an item
 * @param slot - The slot to check
 * @returns True if the slot has an item
 */
export function isSlotWithItem(slot: any): slot is SlotWithItem {
  return slot && 'name' in slot
}

// Check if two slots can be stacked based on name and metadata
export const canStack = (sourceSlot: Slot, targetSlot: Slot) =>
  sourceSlot.name === targetSlot.name && isEqual(sourceSlot.metadata, targetSlot.metadata)

// Find an available slot for an item
export const findAvailableSlot = (item: Slot, data: ItemData, items: Slot[]) => {
  if (!data.stack) return items.find((target) => target.name === undefined)

  const stackableSlot = items.find((target) => target.name === item.name && isEqual(target.metadata, item.metadata))

  return stackableSlot || items.find((target) => target.name === undefined)
}

// Get item URL for display
export const getItemUrl = (item: string | SlotWithItem) => {
  const isObj = typeof item === 'object'
  const itemsStore = useItemsStore()

  if (isObj) {
    if (!item.name) return

    const metadata = item.metadata

    // Support for custom image URLs
    if (metadata?.imageurl) return `${metadata.imageurl}`
    if (metadata?.image) return `${state.imagePath}/${metadata.image}.png`
  }

  const itemName = isObj ? (item.name as string) : item
  const itemData = itemsStore.getItem(itemName)

  if (!itemData) return `${state.imagePath}/${itemName}.png`
  if (itemData.image) return itemData.image

  return `${state.imagePath}/${itemName}.png`
}

// Check if an inventory is a container
export const isContainer = (inventory: Inventory) => inventory.type === 'container'

// Get item data from server
export const getItemData = async (itemName: string) => {
  const resp: ItemData | null = await fetchNui('getItemData', itemName)
  const itemsStore = useItemsStore()

  if (resp?.name) {
    itemsStore.setItem(itemName, resp)
    return resp
  }
}

// Calculate item durability
export const itemDurability = (metadata: any, curTime: number) => {
  if (metadata?.durability === undefined) return

  let durability = metadata.durability

  if (durability > 100 && metadata.degrade)
    durability = ((metadata.durability - curTime) / (60 * metadata.degrade)) * 100

  if (durability < 0) durability = 0

  return durability
}