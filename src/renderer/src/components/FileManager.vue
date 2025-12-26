<script setup lang="ts">
import { ref } from 'vue'
import FileList, { type FileItem } from './FileList.vue'
import PreviewPanel from './PreviewPanel.vue'
import { pluginManager } from '../utils/PluginManager'

// Mock Data
const files = ref<FileItem[]>([
  { id: 1, name: 'instructions.txt', size: '2KB', type: 'txt', url: '#' },
  { id: 2, name: 'vacation.png', size: '2.5MB', type: 'image', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop' },
  { id: 3, name: 'report.pdf', size: '1.2MB', type: 'pdf', url: '#' },
  { id: 4, name: 'design.jpg', size: '3.1MB', type: 'image', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop' },
  { id: 5, name: 'movie.mp4', size: '120MB', type: 'video', url: '#' }
])

const selectedFile = ref<FileItem | null>(null)
const currentPreviewFile = ref<FileItem | null>(null)
const currentPluginCount = ref(0) // Just to trigger reactivity if needed or show count

const handleSelect = (file: FileItem) => {
  selectedFile.value = file
}

const handleDoubleClick = (file: FileItem) => {
  currentPreviewFile.value = file
}

const closePreview = () => {
  currentPreviewFile.value = null
}

const handlePluginLoad = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    const file = input.files[0]
    try {
      // Create a Blob URL for the plugin file
      // NOTE: This assumes the file is a valid ESM module that exports default
      const blobUrl = URL.createObjectURL(new Blob([await file.arrayBuffer()], { type: 'text/javascript' }))

      // Dynamic import from the blob URL
      const module = await import(/* @vite-ignore */ blobUrl)

      await pluginManager.loadPluginModule(module)
      alert(`Plugin loaded successfully!`)

      // Update count (pluginManager.plugins is a shallowRef, so we can access it)
      currentPluginCount.value = pluginManager.getPlugins().value.length

      // Reset input
      input.value = ''
    } catch (error) {
      console.error('Failed to load plugin:', error)
      alert('Failed to load plugin. See console for details.')
    }
  }
}
</script>

<template>
  <div class="window-frame">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="window-controls">
        <div class="dot red"></div>
        <div class="dot yellow"></div>
        <div class="dot green"></div>
        <span class="app-title">My Cloud Drive (Plugin Architecture)</span>
      </div>
      <div class="plugin-status">
        Loaded Plugins: {{ pluginManager.getPlugins().value.length }}
        <label class="load-plugin-btn">
          Load Plugin (JS)
          <input type="file" accept=".js" class="hidden-input" @change="handlePluginLoad" />
        </label>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="sidebar">
        <FileList
          :files="files"
          :selected-file="selectedFile"
          @select="handleSelect"
          @dblclick="handleDoubleClick"
        />
      </div>
      <div class="content-area">
        <PreviewPanel
          :file="currentPreviewFile"
          @close="closePreview"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.window-frame {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Segoe UI', sans-serif;
  color: #374151;
}

.top-bar {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 48px;
  box-sizing: border-box;
}

.window-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.red { background-color: #f87171; }
.yellow { background-color: #facc15; }
.green { background-color: #4ade80; }

.app-title {
  margin-left: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
}

.plugin-status {
  font-size: 12px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 12px;
}

.load-plugin-btn {
  background-color: #4f46e5;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.load-plugin-btn:hover {
  background-color: #4338ca;
}

.hidden-input {
  display: none;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  border-right: 1px solid #e5e7eb;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  background-color: #f3f4f6;
  position: relative;
}
</style>
