<script setup lang="ts">
defineProps<{
  fileName: string
  fileUrl: string
}>()
</script>

<template>
  <div class="plugin-container">
    <h3>Custom Plugin Viewer</h3>
    <p>File: {{ fileName }}</p>
    <div class="content">
      <!-- Plugin content here -->
      <p>This is a custom plugin rendering content.</p>
    </div>
  </div>
</template>

<style scoped>
.plugin-container {
  padding: 20px;
  color: #333;
}
.content {
  margin-top: 10px;
  padding: 10px;
  background: #eee;
  border-radius: 4px;
}
</style>
