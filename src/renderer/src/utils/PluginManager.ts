import { shallowRef, triggerRef } from 'vue'

// --- Host API Definitions ---

export interface FileItem {
  id: number
  name: string
  size: string
  type: string
  url: string
}

export interface FilePreviewer {
  name: string
  /**
   * Check if this previewer supports the given file name/extension
   */
  accepts(fileName: string): boolean
  /**
   * Mount the preview to the given container.
   * @param container Simply a DOM element. The plugin can render Vue, React, or vanilla JS here.
   * @param file The file data to preview.
   * @returns A cleanup function (unmount) that will be called when the preview is closed or changed.
   */
  mount(container: HTMLElement, file: FileItem): () => void
}

export interface PluginContext {
  registerPreviewer(previewer: FilePreviewer): void
}

export interface PluginDefinition {
  name: string
  version: string
  activate(context: PluginContext): void
  deactivate?(): void
}

// --- Plugin Manager ---

class PluginManager {
  // List of registered previewers
  private previewers = shallowRef<FilePreviewer[]>([])

  // List of active plugins (for status display)
  private activePlugins = shallowRef<PluginDefinition[]>([])

  constructor() {
    console.log('[PluginManager] Initialized')
  }

  /**
   * Context to be passed to plugins
   */
  private createContext(): PluginContext {
    return {
      registerPreviewer: (previewer: FilePreviewer) => {
        console.log(`[PluginManager] Registering previewer: ${previewer.name}`)
        this.previewers.value.push(previewer)
        triggerRef(this.previewers)
      }
    }
  }

  /**
   * Find a previewer for the given file
   */
  getMatchingPreviewer(fileName: string): FilePreviewer | undefined {
    // Find the last registered one that accepts it (allowing overrides)?
    // Or first? Let's go with reverse order to allow newer plugins to override.
    for (let i = this.previewers.value.length - 1; i >= 0; i--) {
      if (this.previewers.value[i].accepts(fileName)) {
        return this.previewers.value[i]
      }
    }
    return undefined
  }

  /**
   * Get list of loaded plugins (reactive)
   */
  getPlugins() {
    return this.activePlugins
  }

  /**
   * Load a plugin from a module (ESM)
   */
  async loadPluginModule(module: { default: PluginDefinition }) {
    if (module && module.default && typeof module.default.activate === 'function') {
      const plugin = module.default
      const context = this.createContext()

      try {
        plugin.activate(context)
        this.activePlugins.value.push(plugin)
        triggerRef(this.activePlugins)
        console.log(`[PluginManager] Activated plugin: ${plugin.name}`)
      } catch (e) {
        console.error(`[PluginManager] Failed to activate plugin ${plugin.name}:`, e)
      }
    } else {
      console.warn(
        '[PluginManager] Invalid plugin module. Must export default { activate: ... }',
        module
      )
    }
  }
}

export const pluginManager = new PluginManager()
