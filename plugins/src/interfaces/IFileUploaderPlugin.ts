import type { IPlugin } from '../Plugin'

export interface IFileUploaderPlugin extends IPlugin {
  upload(file: File | string, destination: string): void
}
