# Congressional Funding Map

An interactive web application for visualizing campaign finance data by U.S. congressional district.

## Overview

The map displays the 119th Congress district boundaries for all 50 states plus Washington D.C., sourced from historical GeoJSON shapefiles. Clicking a district opens a detail panel where campaign finance information for candidates in that district will be shown.

## Features

- Interactive U.S. map with 119th Congress district boundaries (OpenStreetMap + Leaflet)
- Hover over a district to see the state and district number
- Click a district to select it and view details in the sidebar
- Sidebar panel ready to display campaign finance data per district

## Tech Stack

- [Vue 3](https://vuejs.org/) + TypeScript
- [Vite](https://vitejs.dev/)
- [Leaflet](https://leafletjs.com/) with OpenStreetMap tiles
- GeoJSON district boundary data

## Getting Started

```bash
npm install
npm run dev
```

### Regenerating the GeoJSON manifest

If you update the files in `public/geojson/`, regenerate the manifest:

```bash
npm run generate-manifest
```
