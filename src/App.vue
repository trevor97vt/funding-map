<script setup lang="ts">
import { ref } from 'vue'
import MapView, { type DistrictProperties } from './components/MapView.vue'

const selectedDistrict = ref<DistrictProperties | null>(null)

function districtLabel(district: number) {
  return district === 0 || district === -1 ? 'At Large' : `District ${Math.round(district)}`
}
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Congressional Funding Map</h1>
    </header>
    <div class="app-body">
      <aside class="sidebar" :class="{ 'sidebar--empty': !selectedDistrict }">
        <template v-if="selectedDistrict">
          <div class="district-info">
            <h2 class="district-title">{{ selectedDistrict.statename }}</h2>
            <p class="district-subtitle">{{ districtLabel(selectedDistrict.district) }}</p>
            <dl class="district-meta">
              <dt>Congress</dt>
              <dd>119th</dd>
            </dl>
          </div>
        </template>
        <p v-else class="sidebar-placeholder">
          Click a district on the map to view campaign finance information
        </p>
      </aside>
      <main class="map-area">
        <MapView @district-select="selectedDistrict = $event" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.app-header {
  background-color: #1a3a5c;
  color: #fff;
  padding: 0.75rem 1.5rem;
  flex-shrink: 0;
}

.app-header h1 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 30%;
  flex-shrink: 0;
  background-color: #f8fafc;
  border-right: 1px solid #e2e8f0;
  overflow-y: auto;
}

.sidebar--empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-placeholder {
  color: #94a3b8;
  font-size: 0.95rem;
  text-align: center;
  padding: 1.5rem;
  margin: 0;
}

.district-info {
  padding: 1.5rem;
}

.district-title {
  margin: 0 0 0.25rem;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
}

.district-subtitle {
  margin: 0 0 1.25rem;
  font-size: 1rem;
  color: #475569;
}

.district-meta {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.4rem 1rem;
  margin: 0;
  font-size: 0.9rem;
}

.district-meta dt {
  color: #64748b;
  font-weight: 500;
}

.district-meta dd {
  margin: 0;
  color: #1e293b;
}

.map-area {
  flex: 1;
  overflow: hidden;
}
</style>
