import { createApp } from 'vue'
import PluginComponent from './PluginComponent.vue'

// Defines the interface for the Host Context (copy of what PluginManager provides)
interface PluginContext {
  registerPreviewer(previewer: any): void
}

export default {
  name: 'My Custom Plugin',
  version: '1.0.0',

  activate(context: PluginContext) {
    context.registerPreviewer({
      name: 'My Custom Plugin Previewer',

      accepts(fileName: string) {
        return fileName.endsWith('.txt') // Change this to your needs
      },

      mount(container: HTMLElement, file: any): () => void {
        console.log('[MyCustomPlugin] Mounting...', file)

        // Create a Vue app instance for this specific mount
        // We pass the file data as props
        const app = createApp(PluginComponent, {
          fileName: file.name,
          fileUrl: file.url
        })

        app.mount(container)

        // Return cleanup function
        return () => {
          console.log('[MyCustomPlugin] Unmounting...')
          app.unmount()
        }
      }
    })
  },

  deactivate() {
    console.log('[MyCustomPlugin] Deactivated')
  }
}
