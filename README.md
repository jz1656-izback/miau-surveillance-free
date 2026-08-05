# 🐱 Miau Surveillance Free v3.0

> **Surveillance Toolkit built by cats, made in Germany.**  
> Even cats use it.

---

## 🚀 Quick Start

```bash
npm install
npm run dev      # → http://localhost:5183
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `⌘K` / `Ctrl+K` | Command palette — search cameras, filter, change theme |
| `1`–`7` | Switch layer tabs |
| `8` | Show all layers |
| `R` | Refresh all live data |
| `F` | Toggle fullscreen |
| `?` | Help overlay |
| `Tab` | Cycle theme (CRT → Dark → Matrix) |
| `Esc` | Close modals / palette |

## 🎨 Themes

- **CRT** — Green-on-black with scanlines (default)
- **Dark** — Blue-tinted GitHub-dark style
- **Matrix** — Pure green terminal, no distractions

## 📡 Data Sources

| Layer | Source | Update |
|-------|--------|--------|
| 📷 CCTV | EarthCam + YouTube Live | Static + embed |
| ⚔ Conflicts | Curated global conflict zones | Static |
| ★ Military | Nuclear + military bases | Static |
| ✈ Flights | OpenSky Network ADS-B | 60s |
| 🌍 Quakes | USGS Earthquake API | 60s |
| ⚠ Disasters | NASA EONET | 60s |
| 🌤 Weather | Open-Meteo (15 cities) | 60s |

## 🏗 Architecture

```
src/
├── main.ts              # Entry point
├── style.css            # All styles (CSS custom properties for theming)
├── map/
│   ├── core.ts          # Leaflet map init, flyTo, fitBounds
│   ├── layers.ts        # Layer groups + marker clustering
│   └── markers.ts       # Marker factories for all data types
├── data/
│   ├── cameras.ts       # 50 global CCTV cameras
│   ├── conflicts.ts     # 50 conflict zones
│   └── military.ts      # 50 military installations
├── api/
│   ├── flights.ts       # OpenSky ADS-B API
│   └── data.ts          # USGS, NASA EONET, Open-Meteo APIs
├── ui/
│   ├── app.ts           # Main app shell + refresh logic
│   ├── modal.ts         # Video modal player
│   └── toast.ts         # Toast notifications
├── store/
│   └── state.ts         # Reactive state management
└── utils/
    ├── keyboard.ts      # Keyboard shortcuts
    └── theme.ts         # Theme system
```

## 🔧 Build

```bash
npm run build    # → dist/
npm run preview  # Preview production build
```

## 📦 PWA

Installable as a standalone app. Works offline for cached resources.

---

*Miau Surveillance Free — No API keys. No tracking. Just cats and surveillance.*
