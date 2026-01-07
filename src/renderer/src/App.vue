<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
const filePath = ref('')
const res = ref({})
const plugins = ref([])
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    console.log(file)
    filePath.value = window.api.getPathForFile(file)
    const result = await window.api.installPlugin(filePath.value)
    const list = await window.api.getPluginList()
    plugins.value = list
    res.value = result
  }
}

async function getPluginList(): void {
  const list = await window.api.getPluginList()
  plugins.value = list
}

getPluginList()

const containerRef = useTemplateRef('containerRef')

async function handleLoadPlugin(plugin): void {
  if (plugin.type == 'eagle') {
    return window.api.openEaglePlugin(plugin.id)
  }
  const pluginModule = await import(/* @vite-ignore */ 'plugin://' + plugin.id + '/index.es.js')
  const pluginInstance = new pluginModule.default()
  pluginInstance.render(containerRef.value, { content: '测试一大下' })
}

const pluginFrameRef = useTemplateRef('pluginFrameRef')
</script>

<template>
  <div>
    hello
    <div>{{ filePath }}</div>
    <input type="file" accept=".zip,.eagleplugin" @change="handleFileChange" />
    <ul>
      <li v-for="plugin in plugins" :key="plugin.id" @click="handleLoadPlugin(plugin)">
        {{ plugin.name }}
      </li>
    </ul>

    <div ref="containerRef"></div>

    <webview
      id="pluginFrame"
      ref="pluginFrameRef"
      src="plugin://plugin_4f601326-4a4c-45f9-8355-389dd6de9110/index.html"
      style="width: 200px; height: 200px"
    ></webview>
  </div>
</template>

<style>
/* Global resets if needed, or inherited from index.html */
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
