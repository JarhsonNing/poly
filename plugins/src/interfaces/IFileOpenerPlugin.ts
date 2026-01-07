import type { IPlugin } from '../Plugin'

export interface RenderDefinition {
  render: (container: HTMLElement) => Promise<void>
  props?: Record<string, unknown>
}

export interface IFileOpenerPlugin extends IPlugin {
  supports(extension: string): boolean
  open(path: string): Promise<RenderDefinition>
}
