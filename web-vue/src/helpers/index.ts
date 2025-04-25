import type { Inventory, InventoryType, ItemData, Slot, SlotWithItem } from '../typings'
import { isEqual } from 'lodash'
import { useInventoryStore } from '../stores/inventory'
import { useItemsStore } from '../stores/items'
import { fetchNui } from '../utils/fetchNui'

// Image path for items (this would be set from the server)
let imagepath = 'images'
export const setImagePath = (path: string) => (imagepath = path)

// Check if a slot has an item
export const isSlotWithItem = (slot: Slot, strict: boolean = false): slot is SlotWithItem =>
  (slot.name !== undefined && slot.weight !== undefined) ||
  (strict && slot.name !== undefined && slot.count !== undefined && slot.weight !== undefined)

// Check if two slots can be stacked based on name and metadata
export const canStack = (sourceSlot: Slot, targetSlot: Slot) =>
  sourceSlot.name === targetSlot.name && isEqual(sourceSlot.metadata, targetSlot.metadata)

// Find an available slot for an item
export const findAvailableSlot = (item: Slot, data: ItemData, items: Slot[]) => {
  if (!data.stack) return items.find((target) => target.name === undefined)

  const stackableSlot = items.find((target) => target.name === item.name && isEqual(target.metadata, item.metadata))

  return stackableSlot || items.find((target) => target.name === undefined)
}

// Calculate total weight of items in inventory
export const getTotalWeight = (items: Inventory['items']) =>
  items.reduce((totalWeight, slot) => (isSlotWithItem(slot) ? totalWeight + slot.weight : totalWeight), 0)

// Get item URL for display
export const getItemUrl = (item: string | SlotWithItem) => {
  const isObj = typeof item === 'object'
  const itemsStore = useItemsStore()

  if (isObj) {
    if (!item.name) return

    const metadata = item.metadata

    // Support for custom image URLs
    if (metadata?.imageurl) return `${metadata.imageurl}`
    if (metadata?.image) return `${imagepath}/${metadata.image}.png`
  }

  const itemName = isObj ? (item.name as string) : item
  const itemData = itemsStore.getItem(itemName)

  if (!itemData) return `${imagepath}/${itemName}.png`
  if (itemData.image) return itemData.image

  return `${imagepath}/${itemName}.png`
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