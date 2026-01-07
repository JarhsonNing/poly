import { injectable, unmanaged } from 'inversify'

export interface IPlugin {
  name: string
  version: string
  activate(): void
  deactivate(): void
}

@injectable()
export abstract class Plugin implements IPlugin {
  public name: string
  public version: string

  constructor(@unmanaged() name: string, @unmanaged() version: string) {
    this.name = name
    this.version = version
  }

  abstract activate(): void
  abstract deactivate(): void
}
