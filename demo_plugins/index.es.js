class TextFileOpener {
  constructor() {
    this.name = 'TextFileOpener'
    this.version = '1.0.0'
  }
  activate() {
    console.log('TextFileOpener activated')
  }
  deactivate() {
    console.log('TextFileOpener deactivated')
  }
  render(container, file) {
    container.innerHTML = file.content
  }
}
export default TextFileOpener
