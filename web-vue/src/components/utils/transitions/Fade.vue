<script setup lang="ts">
defineProps<{
  show: boolean
}>()
</script>

<template>
  <Transition name="fade">
    <div v-if="show">
      <slot />
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
