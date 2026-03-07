import { readdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const geojsonDir = resolve(__dirname, '../public/geojson')
const outFile = resolve(geojsonDir, 'manifest.json')

const files = readdirSync(geojsonDir)
  .filter(f => f.endsWith('.geojson'))
  .map(filename => {
    const match = filename.match(/^(.+)_(\d{3})_to_(\d{3})\.geojson$/)
    if (!match) return null
    return {
      file: filename,
      state: match[1],
      start: parseInt(match[2], 10),
      end: parseInt(match[3], 10),
    }
  })
  .filter(Boolean)

writeFileSync(outFile, JSON.stringify(files, null, 2))
console.log(`Wrote ${files.length} entries to manifest.json`)
