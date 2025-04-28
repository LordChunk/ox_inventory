<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useContextMenuStore } from '../../stores/contextMenu'
import { useItemsStore } from '../../stores/items'
import { fetchNui } from '../../utils/fetchNui'
import { isSlotWithItem } from '../../helpers'
import { setClipboard } from '../../utils/setClipboard'
import type { Button, ButtonGroup } from '../../typings/menu'

// Get stores
const contextMenuStore = useContextMenuStore()
const itemsStore = useItemsStore()

// Computed properties
const item = computed(() => contextMenuStore.currentItem)
const coords = computed(() => contextMenuStore.currentCoords)
const isOpen = computed(() => contextMenuStore.isOpen)

// Calculate menu position
const menuStyle = computed(() => {
  if (!coords.value) return {}
  return {
    position: 'fixed',
    left: `${coords.value.x}px`,
    top: `${coords.value.y}px`,
    zIndex: 100
  } as const
})

// Add click outside handler
function handleClickOutside(event: MouseEvent) {
  if (event.target instanceof Element) {
    const menu = document.querySelector('.context-menu')
    if (menu && menu.contains(event.target)) return
  }
  contextMenuStore.closeContextMenu()
}

// Add keyboard handler
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && contextMenuStore.isOpen) {
    contextMenuStore.closeContextMenu()
  }
}

// Setup and cleanup event listeners
onMounted(() => {
  window.addEventListener('click', handleClickOutside)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
  window.removeEventListener('keydown', handleKeydown)
})

// Group buttons helper function
function groupButtons(buttons: Button[] = []): ButtonGroup[] {
  return buttons.reduce((groups: ButtonGroup[], button: Button, index: number) => {
    if (button.group) {
      const groupIndex = groups.findIndex(group => group.groupName === button.group)
      if (groupIndex !== -1) {
        groups[groupIndex].buttons.push({ ...button, index })
      } else {
        groups.push({
          groupName: button.group,
          buttons: [{ ...button, index }]
        })
      }
    } else {
      groups.push({
        groupName: null,
        buttons: [{ ...button, index }]
      })
    }
    return groups
  }, [])
}

// Handle menu item clicks
async function handleClick(data: { action: string; component?: string; slot?: number; serial?: string; id?: number }) {
  if (!item.value) return

  switch (data.action) {
    case 'use':
      await fetchNui('useItem', item.value.slot)
      break
    case 'give':
      await fetchNui('giveItem', { slot: item.value.slot })
      break
    case 'drop':
      if (isSlotWithItem(item.value)) {
        await fetchNui('dropItem', { slot: item.value.slot })
      }
      break
    case 'remove':
      await fetchNui('removeComponent', { component: data.component, slot: data.slot })
      break
    case 'removeAmmo':
      await fetchNui('removeAmmo', item.value.slot)
      break
    case 'copy':
      setClipboard(data.serial || '')
      break
    case 'custom':
      await fetchNui('useButton', { id: (data.id || 0) + 1, slot: item.value.slot })
      break
  }
  
  contextMenuStore.closeContextMenu()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen && item" class="context-menu" :style="menuStyle">
      <!-- Base menu items -->
      <button class="menu-item" @click="handleClick({ action: 'use' })">Use</button>
      <button class="menu-item" @click="handleClick({ action: 'give' })">Give</button>
      <button class="menu-item" @click="handleClick({ action: 'drop' })">Drop</button>

      <!-- Remove ammo option -->
      <button v-if="item.metadata?.ammo !== undefined && item.metadata.ammo > 0" 
        class="menu-item"
        @click="handleClick({ action: 'removeAmmo' })"
      >
        Remove Ammo
      </button>

      <!-- Copy serial option -->
      <button v-if="item.metadata?.serial"
        class="menu-item"
        @click="handleClick({ action: 'copy', serial: item.metadata.serial })"
      >
        Copy Serial
      </button>

      <!-- Components submenu -->
      <div v-if="item.metadata?.components?.length" class="submenu">
        <div class="menu-item submenu-trigger">
          Remove Attachments
          <span class="submenu-arrow">▶</span>
        </div>
        <div class="submenu-content">
          <button v-for="component in (item.metadata?.components || [])"
            :key="component"
            class="menu-item"
            @click="handleClick({ action: 'remove', component, slot: item.slot })"
          >
            {{ itemsStore.items[component]?.label || component }}
          </button>
        </div>
      </div>

      <!-- Custom buttons -->
      <template v-if="item.name && itemsStore.items[item.name]?.buttons">
        <template v-for="(group, index) in groupButtons(
          (itemsStore.items[item.name]?.buttons || []).map(btn => 
            typeof btn === 'string' ? { label: btn, index: 0 } : btn
          ) as Button[]
        )" :key="index">
          <!-- Grouped buttons -->
          <div v-if="group.groupName" class="submenu">
            <div class="menu-item submenu-trigger">
              {{ group.groupName }}
              <span class="submenu-arrow">▶</span>
            </div>
            <div class="submenu-content">
              <button v-for="button in group.buttons"
                :key="button.index"
                class="menu-item"
                @click="handleClick({ action: 'custom', id: button.index })"
              >
                {{ button.label }}
              </button>
            </div>
          </div>
          <!-- Ungrouped buttons -->
          <button v-else v-for="button in group.buttons"
            :key="button.index"
            class="menu-item"
            @click="handleClick({ action: 'custom', id: button.index })"
          >
            {{ button.label }}
          </button>
        </template>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.context-menu {
  background: rgba(15, 23, 42, 0.95);
  border-radius: 4px;
  min-width: 200px;
  padding: 4px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.submenu {
  position: relative;
}

.submenu-trigger {
  position: relative;
  padding-right: 24px;
}

.submenu-arrow {
  position: absolute;
  right: 8px;
  font-size: 10px;
}

.submenu:hover .submenu-content {
  display: block;
}

.submenu-content {
  display: none;
  position: absolute;
  left: 100%;
  top: 0;
  min-width: 200px;
  background: rgba(15, 23, 42, 0.95);
  border-radius: 4px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.submenu-content .menu-item:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.submenu-content .menu-item:last-child {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
</style>