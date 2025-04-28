<script setup lang="ts">
import { ref } from 'vue'
import { useInventoryStore } from '../../stores/inventory'
import { useDrop } from '../../composables/useDrop'
import { onUse } from '../../utils/dnd/onUse'
import { onGive } from '../../utils/dnd/onGive'
import { fetchNui } from '../../utils/fetchNui'
import UsefulControls from './UsefulControls.vue'

const inventoryStore = useInventoryStore()
const infoVisible = ref(false)

const { dropRef: useRef } = useDrop({
  accept: 'SLOT',
  drop: (source: any) => {
    if (source.inventory === 'player') onUse(source.item)
  }
})

const { dropRef: giveRef } = useDrop({
  accept: 'SLOT',
  drop: (source: any) => {
    if (source.inventory === 'player') onGive(source.item)
  }
})

const inputHandler = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value)
  const validValue = isNaN(value) || value < 0 ? 0 : Math.floor(value)
  target.value = validValue.toString() // Update input value directly
  inventoryStore.setItemAmount(validValue)
}
</script>

<template>
  <div>
    <UsefulControls :info-visible="infoVisible" @update:info-visible="infoVisible = $event" />
    <div class="inventory-control">
      <div class="inventory-control-wrapper">
        <input
          class="inventory-control-input"
          type="number"
          :value="inventoryStore.itemAmount"
          @input="inputHandler"
          min="0"
        />
        <button
          ref="useRef"
          class="inventory-control-button"
        >
          Use
        </button>
        <button
          ref="giveRef"
          class="inventory-control-button"
        >
          Give
        </button>
        <button
          class="inventory-control-button"
          @click="fetchNui('exit')"
        >
          Close
        </button>
      </div>
    </div>

    <button
      class="useful-controls-button"
      @click="infoVisible = true"
    >
      <svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 524 524" class="fill-current">
        <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7-24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.inventory-control {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
}

.inventory-control-wrapper {
  background-color: rgba(30, 41, 59, 0.5);
  padding: 1rem;
  border-radius: 0.375rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.inventory-control-input {
  width: 100%;
  background-color: rgb(30, 41, 59);
  border: 1px solid rgb(51, 65, 85);
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  color: white;
  text-align: center;
}

.inventory-control-button {
  background-color: rgb(51, 65, 85);
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  color: white;
  transition: background-color 0.2s;
}

.inventory-control-button:hover {
  background-color: rgb(71, 85, 105);
}

.useful-controls-button {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background-color: rgb(51, 65, 85);
  padding: 0.5rem;
  border-radius: 9999px;
  color: white;
  transition: background-color 0.2s;
}

.useful-controls-button:hover {
  background-color: rgb(71, 85, 105);
}
</style>
