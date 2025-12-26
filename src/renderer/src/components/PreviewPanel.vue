<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount, nextTick } from 'vue'
import { pluginManager } from '../utils/PluginManager'
import SvgIcon from './SvgIcon.vue'
import type { FileItem } from '../utils/PluginManager' // Use shared type

const props = defineProps<{
  file: FileItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const container = ref<HTMLElement | null>(null)
let unmountPlugin: (() => void) | null = null

// Cleanup function
const cleanup = () => {
  if (unmountPlugin) {
    unmountPlugin()
    unmountPlugin = null
  }
  if (container.value) {
    container.value.innerHTML = '' // Ensure loaded content is removed
  }
}

watch(
  () => props.file,
  async (newFile) => {
    cleanup()

    if (!newFile) {
      return
    }

    // Wait for DOM to be ready (if switching from empty state)
    await nextTick()
    if (!container.value) return

    const previewer = pluginManager.getMatchingPreviewer(newFile.name)
    if (previewer) {
      console.log(`[PreviewPanel] Mounting ${previewer.name} for ${newFile.name}`)
      try {
        unmountPlugin = previewer.mount(container.value, newFile)
      } catch (error) {
        console.error('[PreviewPanel] Failed to mount plugin:', error)
        container.value.innerHTML = `<div class="p-4 text-red-500">Error loading plugin: ${error}</div>`
      }
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  cleanup()
})

const fileExtension = computed(() => {
  return props.file?.name.split('.').pop() || ''
})

const hasMatchingPlugin = computed(() => {
  if (!props.file) return false
  return !!pluginManager.getMatchingPreviewer(props.file.name)
})
</script>

<template>
  <div class="preview-panel">
    <!-- Empty State -->
    <div v-if="!file" class="empty-state">
      <SvgIcon name="file" class="empty-icon" />
      <p>Double-click a file to preview</p>
    </div>

    <!-- Active Preview -->
    <div v-else class="preview-content">
      <div class="preview-header">
        <h2 class="preview-title">Preview: {{ file.name }}</h2>
        <button class="close-btn" @click="emit('close')">
          X
        </button>
      </div>

      <div class="preview-body">
        <!-- Container for manual mounting -->
        <!-- We use v-show to hide it if no plugin found, but keep it in DOM if matched so ref works -->
        <div
          ref="container"
          class="plugin-mount-point"
          v-show="hasMatchingPlugin"
        ></div>

        <!-- No Plugin Found -->
        <div v-if="!hasMatchingPlugin" class="no-plugin">
          <div class="warning-icon">!</div>
          <p class="warning-text">No preview available</p>
          <p class="warning-subtext">
            No plugin registered for .{{ fileExtension }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-panel {
  width: 100%;
  height: 100%;
  background-color: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 16px;
  box-sizing: border-box;
}

.empty-state {
  text-align: center;
  color: #9ca3af;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-icon {
  width: 48px;
  height: 48px;
}

.preview-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview-title {
  font-size: 18px;
  font-weight: bold;
  color: #374151;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 16px;
  padding: 4px 8px;
}

.close-btn:hover {
  color: #4b5563;
}

.preview-body {
  flex: 1;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plugin-mount-point {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.no-plugin {
  text-align: center;
  padding: 24px;
}

.warning-icon {
  font-size: 30px;
  color: #fb923c;
  margin-bottom: 8px;
}

.warning-text {
  color: #4b5563;
  font-weight: 500;
}

.warning-subtext {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}
</style>
