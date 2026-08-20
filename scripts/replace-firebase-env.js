const fs = require('fs')
const path = require('path')

const swPath = path.join(process.cwd(), 'public', 'firebase-messaging-sw.js')
const envPath = path.join(process.cwd(), '.env.local')

if (!fs.existsSync(swPath) || !fs.existsSync(envPath)) {
  process.exit(0)
}

const envContent = fs.readFileSync(envPath, 'utf-8')
const swContent = fs.readFileSync(swPath, 'utf-8')

const envVars = {}
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
})

let replaced = swContent

    Object.entries(envVars).forEach(([key, value]) => {
      const placeholder = `\${${key}}`
      const regex = new RegExp(placeholder.replace(/[\${}]/g, '\\$&'), 'g')
      replaced = replaced.replace(regex, value)
    })

fs.writeFileSync(swPath, replaced)
console.log('Firebase service worker environment variables replaced successfully.')
