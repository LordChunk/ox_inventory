import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { ItemData } from '../typings'

export const useItemsStore = defineStore('items', () => {
  // Using reactive to make the items object reactive
  const items = reactive<Record<string, ItemData | undefined>>({})

  // Function to set multiple items at once
  function setItems(newItems: Record<string, ItemData>) {
    Object.assign(items, newItems)
  }

  // Function to set a single item
  function setItem(name: string, data: ItemData) {
    items[name] = data
  }

  // Function to get an item
  function getItem(name: string): ItemData | undefined {
    return items[name]
  }

  return {
    items,
    setItems,
    setItem,
    getItem
  }
})