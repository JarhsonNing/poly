import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  installPlugin: (zipPath: string) => ipcRenderer.invoke('install-plugin', zipPath),
  getPathForFile: (file: File) => webUtils.getPathForFile(file),
  getPluginList: () => ipcRenderer.invoke('get-plugin-list'),
  openEaglePlugin: (pluginId: string) => ipcRenderer.invoke('open-eagle-plugin', pluginId)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
