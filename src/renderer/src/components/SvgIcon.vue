<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  className?: string
}>()

// Use Vite's URL handling for dynamic assets
const iconSrc = computed(() => {
  try {
    // This assumes icons are in ../assets/icons/ relative to this component.
    // Adjust if folder structure changes.
    return new URL(`../assets/icons/${props.name}.svg`, import.meta.url).href
  } catch (e) {
    console.warn(`Icon not found: ${props.name}`, e)
    return ''
  }
})
</script>

<template>
  <img :src="iconSrc" :class="className" alt="icon" />
</template>
