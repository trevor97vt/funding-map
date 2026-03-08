<script setup lang="ts">
import { ref, watch } from 'vue'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import MapView, { type DistrictProperties } from './components/MapView.vue'
import { toStateAbbr } from './utils/stateAbbr'

const FEC_API_KEY = import.meta.env.VITE_FEC_API_KEY

interface Committee {
  name: string
}

interface Candidate {
  candidate_id: string
  name: string
  party: string
  party_full: string
  incumbent_challenge_full: string
  has_raised_funds: boolean
  principal_committees: Committee[]
}

const selectedDistrict = ref<DistrictProperties | null>(null)
const candidates = ref<Candidate[]>([])
const candidatesLoading = ref(false)
const candidatesError = ref<string | null>(null)

function districtLabel(district: number) {
  return district === 0 || district === -1 ? 'At Large' : `District ${Math.round(district)}`
}

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

watch(selectedDistrict, async (district) => {
  if (!district) return

  const stateAbbr = toStateAbbr(district.statename)
  if (!stateAbbr) return

  const districtNum = district.district <= 0
    ? '00'
    : String(Math.round(district.district)).padStart(2, '0')

  candidatesLoading.value = true
  candidatesError.value = null
  candidates.value = []

  try {
    const url = new URL('https://api.open.fec.gov/v1/candidates/search/')
    url.searchParams.set('election_year', '2026')
    url.searchParams.set('office', 'H')
    url.searchParams.set('state', stateAbbr)
    url.searchParams.set('district', districtNum)
    url.searchParams.set('sort', 'party')
    url.searchParams.set('api_key', FEC_API_KEY)

    const data = await fetch(url.toString()).then(r => r.json())
    candidates.value = data.results ?? []
  } catch {
    candidatesError.value = 'Failed to load candidate data.'
  } finally {
    candidatesLoading.value = false
  }
})
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Congressional Funding Map</h1>
    </header>
    <div class="app-body">
      <MapView @district-select="selectedDistrict = $event" />
      <div class="overlay">
        <Card class="info-card">
          <template #content>
            <template v-if="selectedDistrict">
              <h2 class="district-title">{{ selectedDistrict.statename }}</h2>
              <p class="district-subtitle">{{ districtLabel(selectedDistrict.district) }}</p>

              <div v-if="candidatesLoading" class="candidates-status">
                Loading candidates…
              </div>
              <div v-else-if="candidatesError" class="candidates-status error">
                {{ candidatesError }}
              </div>
              <div v-else-if="candidates.length === 0" class="candidates-status">
                No candidates found for this district.
              </div>
              <Accordion v-else>
                <AccordionPanel
                  v-for="c in candidates"
                  :key="c.candidate_id"
                  :value="c.candidate_id"
                >
                  <AccordionHeader>
                    <div class="candidate-header">
                      <span class="candidate-name">{{ toTitleCase(c.name) }}</span>
                      <span class="party-badge" :class="c.party.toLowerCase()">
                        {{ c.party }}
                      </span>
                    </div>
                  </AccordionHeader>
                  <AccordionContent>
                    <dl class="candidate-meta">
                      <dt>Party</dt>
                      <dd>{{ c.party_full }}</dd>
                      <dt>Status</dt>
                      <dd>{{ c.incumbent_challenge_full }}</dd>
                      <dt>Has raised funds</dt>
                      <dd>{{ c.has_raised_funds ? 'Yes' : 'No' }}</dd>
                      <template v-if="c.principal_committees.length">
                        <dt>Committee</dt>
                        <dd>{{ toTitleCase(c.principal_committees[0]?.name ?? '') }}</dd>
                      </template>
                    </dl>
                  </AccordionContent>
                </AccordionPanel>
              </Accordion>
            </template>
            <p v-else class="placeholder">
              Click a district on the map to view candidates and funding information
            </p>
          </template>
        </Card>
      </div>
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
  position: relative;
  flex: 1;
  overflow: hidden;
}

.overlay {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  bottom: 1.5rem;
  width: 340px;
  z-index: 1000;
  pointer-events: none;
  display: flex;
  flex-direction: column;
}

.info-card {
  pointer-events: auto;
  height: 100%;
  overflow-y: auto;
}

.district-title {
  margin: 0 0 0.25rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
}

.district-subtitle {
  margin: 0 0 1rem;
  font-size: 0.95rem;
  color: #475569;
}

.candidates-status {
  font-size: 0.875rem;
  color: #64748b;
  text-align: center;
  padding: 1rem 0;
}

.candidates-status.error {
  color: #b91c1c;
}

.candidate-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.candidate-name {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.party-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  color: #fff;
  flex-shrink: 0;
}

.party-badge.dem {
  background-color: #1d4ed8;
}

.party-badge.rep {
  background-color: #b91c1c;
}

.party-badge:not(.dem):not(.rep) {
  background-color: #64748b;
}

.candidate-meta {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.35rem 0.75rem;
  margin: 0;
  font-size: 0.825rem;
}

.candidate-meta dt {
  color: #64748b;
  font-weight: 500;
}

.candidate-meta dd {
  margin: 0;
  color: #1e293b;
}

.placeholder {
  margin: 0;
  font-size: 0.9rem;
  color: #94a3b8;
  text-align: center;
  line-height: 1.5;
}
</style>
