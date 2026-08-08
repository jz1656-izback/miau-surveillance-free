# 🐱 Miau Surveillance Free v4.0

> **Surveillance Toolkit built by cats, made in Germany.**
> 128 global cameras · 10 live data layers · 7000+ traffic cams · Wind particles

---

## 🚀 Quick Start

```bash
npm install
npm run dev      # → http://localhost:5199
npm run present  # → http://localhost:5200 (presentation)
```

## 📡 Live Data Layers

| Layer | Source | Update | Count |
|-------|--------|--------|-------|
| 📷 CCTV | YouTube + EarthCam | Static | 128 cams |
| ⚔ Conflicts | Curated zones | Static | 50 zones |
| ★ Military | Nuclear + bases | Static | 50 installations |
| ✈ Flights | OpenSky ADS-B | 30s | 80+ live |
| 🌍 Quakes | USGS | 60s | 100+ daily |
| ⚠ Disasters | NASA EONET | 60s | 20+ events |
| 🌤 Weather | Open-Meteo | 60s | 15 cities |
| 🔥 Wildfires | NASA FIRMS | 60s | 500+ hotspots |
| 🛰 ISS | Open-Notify | 2s | 3 satellites |
| ⚡ Lightning | Blitzortung | 60s | 200+ strikes |
| 🚦 Traffic | OpenTrafficCamMap | On load | 7,000+ cams |

## 🎯 Tracking Features

| Feature | Detail |
|---------|--------|
| ✈ Flight trails | 60-minute history, military detection |
| 🛰 Satellites | ISS + Hubble + Tiangong with orbital paths |
| 🚢 Ships | 12 demo vessels, AIS-ready |
| 🕰 Timeline | 24h scrubber, playback 1x-600x |
| 🔗 Correlation | Click map → related events within 200km |
| 🚨 Alerts | Push notifications, configurable rules |
| 🛰 Pass predictions | ISS + Hubble next 12h overflights |

## 🎮 Controls

| Key | Action |
|-----|--------|
| `Alt+K` | Command palette |
| `1`–`8` | Layer tabs |
| `R` | Refresh |
| `F` | Fullscreen |
| `?` | Help overlay |
| `Tab` | Cycle theme |
| `~` | Log panel |

## 🎨 Features

- 🌊 **Wind particles** — animated jet streams on map
- 🖥 **Grid view** — 4/9/16 cameras simultaneously
- ⌨️ **Terminal** — `help`, `status`, `go tokyo`, `cat`
- 🎤 **Voice** — "Show cameras", "Go to Tokyo"
- 📰 **News ticker** — GDELT global headlines
- 🏆 **Achievements** — First Watch, Globe Trotter, Katastrophenschutz
- 😺 **Cat mascot** — click for cat surveillance facts
- 🌪 **Windy mode** — 5 weather tile overlays
- 📺 **CRT scanlines** — 3 themes (CRT/Dark/Matrix)
- ~~~ **Log panel** — press tilde for debug logs

## 🧪 Tests

**36 automated tests** across 6 test files:
- Logger (5), DOM helpers (5), Data validation (9)
- Tracking (5), History store (5), Correlation (4), Alerts (3)

## 📦 Export

Terminal: `cam export` — exports custom cameras as JSON
Dashboard state exportable via JSON

---

*No API keys needed. Built by cats. For cats. In Germany. Miau.*
