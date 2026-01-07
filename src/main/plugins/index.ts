// main.js
import { app, protocol, ipcMain, net, BrowserWindow } from 'electron'
import path from 'path'
import fs from 'fs'
import AdmZip from 'adm-zip'
import { randomUUID } from 'crypto'

// 插件存储目录
const PLUGINS_DIR = path.join(app.getPath('userData'), 'plugins')
const PLUGINS_JSON = path.join(PLUGINS_DIR, 'plugins.json')

export function registerScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'plugin',
      privileges: {
        secure: true,
        standard: true,
        supportFetchAPI: true,
        corsEnabled: true
      }
    }
  ])
}

// 1. 注册自定义协议 (在 app.whenReady() 后调用)
export function registerPluginProtocol(): void {
  protocol.handle('plugin', (request) => {
    // URL 格式: plugin://plugin-id/index.js
    const url = request.url.replace('plugin://', '')
    console.log(url)
    const [pluginId, ...filePathParts] = url.split('/')
    const pluginJson = fs.readFileSync(PLUGINS_JSON, 'utf8')
    const pluginObj = JSON.parse(pluginJson)
    const entryUrl = pluginObj.find((item: any) => item.id === pluginId)?.entryUrl
    const filePath = path.join(entryUrl, ...filePathParts)
    console.log(filePath)
    // // 返回文件流
    return net.fetch('file://' + filePath)
  })
}

async function loadEaglePlugin(event, zipPath: string) {
  const zip = new AdmZip(zipPath)
  const manifest = zip.readAsText('manifest.json')
  const packageObj = JSON.parse(manifest)
  const pluginName = packageObj.name
  const pluginId = 'eagle_' + packageObj.id
  const targetDir = path.join(PLUGINS_DIR, pluginId)
  // 对应关系存到本地
  // 先读取文件

  if (!fs.existsSync(PLUGINS_DIR)) {
    fs.mkdirSync(PLUGINS_DIR, { recursive: true })
  }
  if (!fs.existsSync(path.join(PLUGINS_DIR, 'plugins.json'))) {
    fs.writeFileSync(path.join(PLUGINS_DIR, 'plugins.json'), '[]')
  }
  const pluginsJson = fs.readFileSync(path.join(PLUGINS_DIR, 'plugins.json'), 'utf8')
  const plugins = JSON.parse(pluginsJson)
  const idx = plugins.findIndex((item: Record<string, string>) => item.name === pluginName)
  if (idx !== -1) {
    plugins.splice(idx, 1)
  }
  const pluginInfo = {
    name: pluginName,
    id: pluginId,
    version: packageObj.version,
    entryUrl: targetDir,
    type: 'eagle'
  }
  plugins.push(pluginInfo)
  fs.writeFileSync(path.join(PLUGINS_DIR, 'plugins.json'), JSON.stringify(plugins))
  console.log(targetDir)

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  zip.extractAllTo(targetDir, true)

  // 返回插件入口 URL 给前端
  return {
    success: true,
    pluginInfo
  }
}

export function initPlugin(): void {
  // 2. 处理插件安装 (解压)
  ipcMain.handle('install-plugin', async (event, zipPath) => {
    if (zipPath.endsWith('.eagleplugin')) {
      return loadEaglePlugin(event, zipPath)
    }
    try {
      const zip = new AdmZip(zipPath)
      const packageJson = zip.readAsText('package.json')

      const packageObj = JSON.parse(packageJson)
      const pluginName = packageObj.name ?? Date.now()
      const pluginId = 'plugin_' + randomUUID()
      const targetDir = path.join(PLUGINS_DIR, pluginId)
      // 对应关系存到本地
      // 先读取文件

      if (!fs.existsSync(PLUGINS_DIR)) {
        fs.mkdirSync(PLUGINS_DIR, { recursive: true })
      }
      if (!fs.existsSync(path.join(PLUGINS_DIR, 'plugins.json'))) {
        fs.writeFileSync(path.join(PLUGINS_DIR, 'plugins.json'), '[]')
      }
      const pluginsJson = fs.readFileSync(path.join(PLUGINS_DIR, 'plugins.json'), 'utf8')
      const plugins = JSON.parse(pluginsJson)
      const idx = plugins.findIndex((item: Record<string, string>) => item.name === pluginName)
      if (idx !== -1) {
        plugins.splice(idx, 1)
      }
      const pluginInfo = {
        name: pluginName,
        id: pluginId,
        version: packageObj.version,
        entryUrl: targetDir,
        type: ''
      }
      plugins.push(pluginInfo)
      fs.writeFileSync(path.join(PLUGINS_DIR, 'plugins.json'), JSON.stringify(plugins))
      console.log(targetDir)

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
      }

      zip.extractAllTo(targetDir, true)

      // 返回插件入口 URL 给前端
      return {
        success: true,
        pluginInfo
      }
    } catch (error) {
      console.error('Failed to install plugin:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('get-plugin-list', async () => {
    const plugins = fs.readFileSync(path.join(PLUGINS_DIR, 'plugins.json'), 'utf8')
    return JSON.parse(plugins)
  })

  ipcMain.handle('open-eagle-plugin', async (event, pluginId) => {
    const pluginsJson = fs.readFileSync(path.join(PLUGINS_DIR, 'plugins.json'), 'utf8')
    const plugins = JSON.parse(pluginsJson)
    const plugin = plugins.find((item: Record<string, string>) => item.id === pluginId)
    console.log(app.getAppPath())
    const bw = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(app.getAppPath(), 'src', 'main', 'plugins', 'eagle_api.js'),
        webviewTag: true,
        devTools: true,
        webSecurity: false,
        nodeIntegration: true,
        contextIsolation: false
      }
    })
    bw.loadURL('plugin://' + pluginId + '/index.html')
  })
}
