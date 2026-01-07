import AdmZip from 'adm-zip'
import * as path from 'path'
import * as fs from 'fs'
import { Plugin } from './Plugin'

export class PluginLoader {
  /**
   * Loads a plugin from a zip file.
   *Unzips the content to extractPath, finds the entry point from package.json,
   *and attempts to load the Plugin class.
   *
   * @param zipPath Absolute path to the .zip file
   * @param extractPath Absolute path where the zip should be extracted
   * @returns A Promise that resolves to an array of loaded Plugin instances (usually just one)
   */
  public async loadFromZip(zipPath: string, extractPath?: string): Promise<Plugin[]> {
    if (!fs.existsSync(zipPath)) {
      throw new Error(`Zip file not found: ${zipPath}`)
    }

    // Determine extract path if not provided
    if (!extractPath) {
      const filename = path.basename(zipPath, '.zip')
      // Use a temporary folder or a folder next to the zip
      extractPath = path.join(path.dirname(zipPath), '.extracted_plugins', filename)
    }

    // Clean and create extract directory
    if (fs.existsSync(extractPath)) {
      try {
        fs.rmSync(extractPath, { recursive: true, force: true })
      } catch (e) {
        console.warn(`Failed to clean extract path ${extractPath}:`, e)
        // If we can't clean, maybe it's locked. We could try a unique path, but let's proceed.
      }
    }
    fs.mkdirSync(extractPath, { recursive: true })

    // 1. Unzip
    const zip = new AdmZip(zipPath)
    zip.extractAllTo(extractPath, true)

    // 2. Read package.json to find entry
    const packageJsonPath = path.join(extractPath, 'package.json')
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error(`package.json not found in extracted plugin: ${extractPath}`)
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    // 3. Load Resources (CSS, etc)
    this.loadResources(extractPath, packageJson)

    // 4. Resolve Main Entry
    const mainFile = packageJson.main || 'index.js'
    const entryPath = path.resolve(extractPath, mainFile)

    if (!fs.existsSync(entryPath)) {
      // Try adding .js if it's missing (though resolve typically handles absolute, require handles extensions)
      if (!fs.existsSync(entryPath + '.js')) {
        throw new Error(`Entry file not found: ${entryPath}`)
      }
    }

    // 5. Import the module
    // In Node environment, use dynamic require
    // Clear cache to allow reloading
    delete require.cache[require.resolve(entryPath)]
    const moduleExports = require(entryPath)

    const loadedPlugins: Plugin[] = []

    // 6. Find Plugin classes
    // Scenario A: Default export is the class
    if (this.isPluginClass(moduleExports.default)) {
      loadedPlugins.push(new moduleExports.default())
    }
    // Scenario B: Named exports
    else {
      for (const exportName in moduleExports) {
        const exportedItem = moduleExports[exportName]
        if (this.isPluginClass(exportedItem)) {
          loadedPlugins.push(new exportedItem())
        }
      }
    }

    // Scenario C: Default export is an instance (less likely for extensibility but possible)
    if (moduleExports.default instanceof Plugin) {
      loadedPlugins.push(moduleExports.default)
    }

    return loadedPlugins
  }

  private loadResources(extractPath: string, packageJson: any) {
    if (typeof document === 'undefined') return

    // Load CSS
    const cssFiles: string[] = []
    if (packageJson.style) {
      cssFiles.push(packageJson.style)
    }
    if (packageJson.css) {
      if (Array.isArray(packageJson.css)) {
        cssFiles.push(...packageJson.css)
      } else {
        cssFiles.push(packageJson.css)
      }
    }
    // Convention: check for index.css if no explicit config
    if (cssFiles.length === 0 && fs.existsSync(path.join(extractPath, 'index.css'))) {
      cssFiles.push('index.css')
    }

    cssFiles.forEach((cssFile) => {
      const fullPath = path.join(extractPath, cssFile)
      if (fs.existsSync(fullPath)) {
        const cssContent = fs.readFileSync(fullPath, 'utf8')
        const style = document.createElement('style')
        style.textContent = cssContent
        style.setAttribute('data-plugin-origin', extractPath)
        document.head.appendChild(style)
      }
    })
  }

  // Basic check if something looks like a constructor for Plugin
  private isPluginClass(obj: any): boolean {
    if (typeof obj !== 'function') return false
    // Inspect prototype or rely on convention
    // Since Plugin is abstract class, checking inheritance might be tricky if "core" is duplicated
    // (npm link issues). But we can check for existence of 'activate' and 'deactivate' on prototype.
    return (
      obj.prototype &&
      typeof obj.prototype.activate === 'function' &&
      typeof obj.prototype.deactivate === 'function'
    )
  }
}
