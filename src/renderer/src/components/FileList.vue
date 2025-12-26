<script setup lang="ts">
import { ref } from 'vue'
import SvgIcon from './SvgIcon.vue'

export interface FileItem {
  id: number
  name: string
  size: string
  type: string
  url: string
}

const props = defineProps<{
  files: FileItem[]
  selectedFile: FileItem | null
}>()

const emit = defineEmits<{
  (e: 'select', file: FileItem): void
  (e: 'dblclick', file: FileItem): void
}>()

const handleSelect = (file: FileItem) => {
  emit('select', file)
}

const handleDoubleClick = (file: FileItem) => {
  emit('dblclick', file)
}

const getIconName = (type: string) => {
  // Mapping file types to our svg icons
  const map: Record<string, string> = {
    txt: 'file',
    image: 'image',
    pdf: 'pdf',
    video: 'video'
  }
  return map[type] || 'file'
}
</script>

<template>
  <div class="file-list-container">
    <div class="header">FILE LIST</div>
    <div class="list">
      <div
        v-for="file in files"
        :key="file.id"
        class="file-item"
        :class="{ active: selectedFile?.id === file.id }"
        @click="handleSelect(file)"
        @dblclick="handleDoubleClick(file)"
      >
        <SvgIcon :name="getIconName(file.type)" class="file-icon" />
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ file.size }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-list-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.header {
  padding: 8px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 12px;
  font-weight: bold;
  color: #9ca3af;
  text-transform: uppercase;
}

.list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-item {
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.file-item:hover {
  background-color: #e5e7eb;
}

.file-item.active {
  background-color: #bfdbfe;
  border-color: #3b82f6;
}

.file-icon {
  width: 24px;
  height: 24px;
  color: #6b7280;
}

.file-info {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.file-size {
  font-size: 12px;
  color: #9ca3af;
}
</style>
