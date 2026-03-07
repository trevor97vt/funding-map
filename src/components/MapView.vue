<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface ManifestEntry {
  file: string
  state: string
  start: number
  end: number
}

export interface DistrictProperties {
  statename: string
  district: number
  startcong: number
  endcong: number
  id: string
}

const emit = defineEmits<{
  'district-select': [props: DistrictProperties]
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let geojsonLayer: L.GeoJSON | null = null
let selectedLayer: L.Path | null = null

const loading = ref(true)
const error = ref<string | null>(null)

const defaultStyle: L.PathOptions = {
  color: '#2563eb',
  weight: 1,
  fillColor: '#3b82f6',
  fillOpacity: 0.15,
}

const selectedStyle: L.PathOptions = {
  color: '#1e40af',
  weight: 2,
  fillColor: '#1d4ed8',
  fillOpacity: 0.4,
}

onMounted(async () => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView([38.9, -95.7], 4)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map)

  try {
    const manifest: ManifestEntry[] = await fetch('/geojson/manifest.json').then(r => r.json())
    const current = manifest.filter(e => e.end === 119)

    const results = await Promise.all(
      current.map(e => fetch(`/geojson/${e.file}`).then(r => r.json()))
    )

    geojsonLayer = L.geoJSON(results, {
      style: defaultStyle,
      onEachFeature(feature, layer) {
        const { statename, district } = feature.properties ?? {}
        const districtLabel = district === 0 || district === -1
          ? 'At Large'
          : `District ${Math.round(district)}`
        layer.bindTooltip(`${statename} — ${districtLabel}`, { sticky: true })

        layer.on({
          mouseover(e) {
            if (e.target === selectedLayer) return
            e.target.setStyle({ fillOpacity: 0.45, weight: 2 })
          },
          mouseout(e) {
            if (e.target === selectedLayer) return
            geojsonLayer!.resetStyle(e.target)
          },
          click(e) {
            if (selectedLayer) geojsonLayer!.resetStyle(selectedLayer)
            selectedLayer = e.target
            e.target.setStyle(selectedStyle)
            emit('district-select', feature.properties as DistrictProperties)
          },
        })
      },
    }).addTo(map)
  } catch (e) {
    error.value = 'Failed to load district data.'
    console.error(e)
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map-container" />
    <div v-if="loading" class="map-overlay">Loading districts…</div>
    <div v-if="error" class="map-overlay error">{{ error }}</div>
  </div>
</template>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 100%;
}

.map-overlay {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  padding: 0.4rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  pointer-events: none;
  z-index: 1000;
}

.map-overlay.error {
  background: rgba(185, 28, 28, 0.85);
}
</style>
