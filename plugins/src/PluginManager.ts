import { injectable, multiInject, optional } from 'inversify'
import { SYMBOLS } from './types'
import { Plugin } from './Plugin'

@injectable()
export class PluginManager {
  private plugins: Plugin[]

  constructor(@multiInject(SYMBOLS.Plugin) @optional() plugins: Plugin[] = []) {
    this.plugins = plugins
  }

  public register(plugin: Plugin): void {
    this.plugins.push(plugin)
  }

  public activateAll(): void {
    this.plugins.forEach((p) => {
      console.log(`[PluginManager] Activating plugin: ${p.name} v${p.version}`)
      p.activate()
    })
  }

  public getPlugins(): Plugin[] {
    return this.plugins
  }

  public getMatchingPreviewer(fileName: string): any | undefined {
    return this.plugins.find((p: any) => {
      return typeof p.supports === 'function' && p.supports(fileName)
    })
  }
}
