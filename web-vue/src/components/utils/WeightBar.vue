<script setup lang="ts">
import { computed } from 'vue'

// Props
const props = defineProps<{
  percent: number
  durability?: boolean
}>()

// Calculate the color of the progress bar based on the percentage
const color = computed(() => {
  // Colors used based on the original React implementation
  const primaryColor = [231, 76, 60] // Red (Pomegranate)
  const secondaryColor = [39, 174, 96] // Green (Nephritis)
  const accentColor = [211, 84, 0] // Orange (Orange)

  if (props.durability) {
    return props.percent < 50
      ? colorMixer(accentColor, primaryColor, props.percent / 100)
      : colorMixer(secondaryColor, accentColor, props.percent / 100)
  }
  
  return props.percent > 50
    ? colorMixer(primaryColor, accentColor, props.percent / 100)
    : colorMixer(accentColor, secondaryColor, props.percent / 50)
})

// Helper function to mix color channels
function colorChannelMixer(colorChannelA: number, colorChannelB: number, amountToMix: number) {
  let channelA = colorChannelA * amountToMix
  let channelB = colorChannelB * (1 - amountToMix)
  return channelA + channelB
}

// Helper function to mix RGB colors
function colorMixer(rgbA: number[], rgbB: number[], amountToMix: number) {
  let r = colorChannelMixer(rgbA[0], rgbB[0], amountToMix)
  let g = colorChannelMixer(rgbA[1], rgbB[1], amountToMix)
  let b = colorChannelMixer(rgbA[2], rgbB[2], amountToMix)
  return `rgb(${r}, ${g}, ${b})`
}
</script>

<template>
  <div 
    class="weight-bar h-1.5 w-full bg-gray-700 rounded overflow-hidden"
    :class="{ 'durability-bar': durability }"
  >
    <div
      class="h-full transition-all duration-300"
      :style="{
        visibility: percent > 0 ? 'visible' : 'hidden',
        width: `${percent}%`,
        backgroundColor: color
      }"
    ></div>
  </div>
</template>