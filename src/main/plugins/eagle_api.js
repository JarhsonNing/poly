const electron = require('electron')
const { contextBridge, ipcRenderer } = electron

// Custom APIs for renderer
const api = {
  manifest: {},
  item: {
    getSelected() {
      return ['test']
    }
  },
  onPluginCreate: (callback) => {
    callback()
  },
  onPluginBeforeExit: (callback) => {},
  onPluginShow: (callback) => {},
  onPluginHide: (callback) => {},
  onPluginRun: (callback) => {},
  onThemeChanged: (callback) => {}, // TODO
  onLibraryChanged: (callback) => {},
  app: {
    isDarkColors: () => {},
    version: '', // 當前應用版本
    build: '', // 當前應用 build 版號
    runningUnderARM64Translation: false, // 是否跑在 ARM 模擬器上
    locale: '', // 當前語系
    arch: process.arch, // 軟件架構（x64, arm64）
    platform: process.platform, // 當前作業系土（darwin, win32）
    env: process.env, // 環境變數
    execPath: process.execPath, // 軟件位置
    pid: process.pid, // 當前程序 id
    resourcesPath: process.resourcesPath, //
    isWindows: process.platform === 'win32', // 當前操作系統是否為 Windows
    isMac: process.platform === 'darwin', // 當前操作系統是否為 macOS
    // TODO，應該要重構才對
    // https://www.electronjs.org/docs/latest/api/app#appgetpathname
    getPath: async (name) => {},
    getFileIcon: async (path, options) => {},
    createThumbnailFromPath: async (path, maxSize) => {}
  },
  os: {
    tmpdir: '',
    version: '',
    type: '',
    release: '',
    hostname: '',
    homedir: '',
    arch: ''
  },
  screen: {
    getCursorScreenPoint: async () => {},
    getPrimaryDisplay: async () => {},
    getAllDisplays: async () => {},
    getDisplayNearestPoint: async (point) => {}
  },
  // TODO:
  toast: {},
  notification: {
    show: async (params) => {}
  },
  window: {
    show: async () => {},
    showInactive: async () => {},
    hide: async () => {},
    focus: async () => {},
    minimize: async () => {},
    maximize: async () => {},
    unmaximize: async () => {},
    restore: async () => {},
    isMaximized: async () => {},
    isMinimized: async () => {},
    setFullScreen: async (value) => {},
    isFullScreen: async () => {},
    setAspectRatio: async (aspectRatio) => {},
    setBackgroundColor: async (backgroundColor) => {},
    setSize: async (width, height) => {},
    getSize: async () => {},
    setBounds: async (bounds, animate) => {},
    getBounds: async () => {},
    setResizable: async (resizable) => {},
    isResizable: async () => {},
    setAlwaysOnTop: async (flag) => {},
    isAlwaysOnTop: async () => {},
    setPosition: async (x, y) => {},
    getPosition: async () => {
      return await ipcRenderer.invoke('plugin.window.', { method: 'getPosition', value: undefined })
    },
    setOpacity: async (opacity) => {
      return await ipcRenderer.invoke('plugin.window.', { method: 'setOpacity', value: opacity })
    },
    center: async (opacity) => {
      return await ipcRenderer.invoke('plugin.window.', { method: 'center', value: opacity })
    },
    getOpacity: async () => {
      return await ipcRenderer.invoke('plugin.window.', { method: 'getOpacity', value: undefined })
    },
    flashFrame: async (flag) => {
      return await ipcRenderer.invoke('plugin.window.', { method: 'flashFrame', value: flag })
    },
    setIgnoreMouseEvents: async (ignore) => {
      return await ipcRenderer.invoke('plugin.window.', {
        method: 'setIgnoreMouseEvents',
        value: ignore
      })
    },
    openDevTools: async (ignore) => {
      return await ipcRenderer.invoke('plugin.window.webContents.', {
        method: 'openDevTools',
        value: undefined
      })
    },
    capturePage: async (rect = undefined) => {
      return await ipcRenderer.invoke('plugin.window.webContents.', {
        method: 'capturePage',
        value: rect
      })
    }
  },
  // 產生一個 uuid
  guid: () => {
    return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('eagle', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.eagle = api
}
