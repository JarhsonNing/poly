const fs = require('fs')
const path = require('path')

const pluginName = process.argv[2]

if (!pluginName) {
  console.error('Please provide a plugin name/directory.')
  console.error('Usage: node scripts/scaffold-plugin.js <plugin-name>')
  process.exit(1)
}

const templateDir = path.join(__dirname, 'templates', 'plugin')
const targetDir = path.resolve(pluginName)

console.log(`Creating plugin in ${targetDir}...`)

if (fs.existsSync(targetDir)) {
  console.error(`Target directory ${targetDir} already exists.`)
  process.exit(1)
}

fs.mkdirSync(targetDir, { recursive: true })

function copyRecursive(src, dest) {
  const stats = fs.statSync(src)
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true })
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName))
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}

try {
  copyRecursive(templateDir, targetDir)

  // Update package.json
  const packageJsonPath = path.join(targetDir, 'package.json')
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    pkg.name = path.basename(pluginName)
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2))
  }

  // Update index.ts name if we want to default it?
  // Let's leave it as "My Custom Plugin" for user to change.

  console.log('Plugin scaffold created successfully!')
  console.log('To get started:')
  console.log(`  cd ${pluginName}`)
  console.log('  npm install')
  console.log('  npm run build')
} catch (err) {
  console.error('Failed to create scaffold:', err)
}
