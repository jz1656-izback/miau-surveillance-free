import { state, notify, subscribe, saveFavorites } from '../store/state';
import { CAMERAS, CAMERA_TYPES, Camera } from '../data/cameras';
import { CONFLICTS } from '../data/conflicts';
import { MILITARY } from '../data/military';
import { initMap, flyTo, fitBounds, getMap, switchTile, toggleWindyMode, toggleSingleWindyLayer, removeWindyOverlay, toggleParticleMode } from '../map/core';
import { createLayer, layers, toggleLayer, showOnlyLayer, showAllLayers } from '../map/layers';
import { createCameraMarker, createConflictMarker, createMilitaryMarker, createFlightMarker, createQuakeMarker, createDisasterMarker, createWeatherMarker, createWildfireMarker, createIssMarker, createLightningMarker, clearMarkers, embedUrl } from '../map/markers';
import { fetchFlights } from '../api/flights';
import { fetchQuakes, fetchDisasters, fetchWeather } from '../api/data';
import { fetchWildfires } from '../api/wildfires';
import { fetchIssPosition } from '../api/iss';
import { fetchLightning } from '../api/lightning';
import { fetchNews } from '../api/news';
import { openModal, closeModal } from './modal';
import { toast } from './toast';
import { setupKeyboard } from '../utils/keyboard';
import { initTheme, cycleTheme, setTheme } from '../utils/theme';
import { initGrid } from './grid';
import { initTerminal } from './terminal';
import { initVoice, toggleVoice } from './voice';
import { initEasterEggs } from './eastereggs';
import { trackAction } from './achievements';
import { addHistoryEvent } from './timeline';
import { addCustomCamera, getAllCameras, getCustomCameras, removeCustomCamera, importCameras, exportCameras } from './custom-cameras';
import { initCitySearch } from './city-panel';
import { fetchTrafficCams } from '../api/traffic-cams';
import { createTrafficMarker } from '../map/markers';
import { initCatMascot } from './cat-mascot';
import { initTracking } from '../tracking/layer';
import { initTimeline } from './timeline-bar';
import { addEvent, loadHistory } from '../tracking/history';
import { findNearby, correlateEvent, autoCorrelate, findClusters } from '../tracking/correlation';
import { logger, initLogPanel } from '../utils/logger';
import { $$, safeText, safeHTML, safeOnClick } from '../utils/dom';
import { getRules, toggleRule, getAlertHistory, requestPermission, checkAlert, playAlertSound } from './alert-system';

const REFRESH_INTERVAL = 60000;

// ── Build DOM ──

function renderApp(): string {
  return `
<div id="app">
  <header class="hdr">
    <div class="dot" style="width:auto;height:auto;border-radius:0;background:transparent;box-shadow:none;animation:none;font-size:14px">🐾</div>
    <h1>🐱 MIAU SURVEILLANCE</h1>
    <span id="cat-mascot" class="cat-mascot" title="Click for cat facts! 🐱">😺</span>
    <div class="tabs" id="tabs">
      <button class="tab on" data-layer="">ALL</button>
      <button class="tab" data-layer="conflict">CONFLICTS</button>
      <button class="tab" data-layer="military">MILITARY</button>
      <button class="tab" data-layer="camera">📷 CCTV</button>
      <button class="tab" data-layer="flight">FLIGHTS</button>
      <button class="tab" data-layer="quake">QUAKES</button>
      <button class="tab" data-layer="disaster">DISASTERS</button>
      <button class="tab" data-layer="weather">WEATHER</button>
      <button class="tab" data-layer="wildfire">🔥 FIRES</button>
      <button class="tab" data-layer="iss">🛰 ISS</button>
      <button class="tab" data-layer="lightning">⚡ STRIKES</button>
      <button class="tab" data-layer="traffic">🚦 TRAFFIC</button>
    </div>
    <div class="city-search-wrap" id="city-search-wrap">
      <input class="city-search" id="city-search" placeholder="🔍 Search any city..." autocomplete="off" spellcheck="false" />
      <div class="city-results" id="city-results"></div>
    </div>
    <div class="stats" id="stats">
      <span>⚔<b id="cc">0</b></span><span>★<b id="cm">0</b></span><span>📷<b id="camc">0</b></span>
      <span>✈<b id="cf">0</b></span><span>🌍<b id="cq">0</b></span><span>⚠<b id="cd">0</b></span><span>🌤<b id="cw">0</b></span>
      <span>🔥<b id="cfire">0</b></span><span>🛰<b id="ciss">-</b></span><span>⚡<b id="clit">0</b></span>
      <button class="rfbtn windy-mode-btn" id="windy-mode-btn" title="Windy Weather Mode">🌪 Windy</button>
      <button class="rfbtn windy-mode-btn" id="windy-full-btn" title="Windy.com Full View">🌍 Windy.com</button>
      <button class="rfbtn" id="grid-btn" title="Grid View">🖥</button>
      <button class="rfbtn" id="terminal-btn" title="Terminal">⌨️</button>
      <button class="rfbtn" id="voice-btn" title="Voice">🔇</button>
      <button class="rfbtn" id="rfbtn" title="Refresh (R)">↻</button>
      <span class="live" id="live-dot">● LIVE</span>
      <span id="tracking-status" style="font-size:8px;color:#f44;margin-left:6px"></span>
    </div>
  </header>
  <div class="main">
    <div class="map-wrap">
      <div id="map"></div>
      <div class="layers" id="layers">
        <button class="on" data-layer="conflict">⚔ Conflicts</button>
        <button class="on" data-layer="military">★ Military</button>
        <button class="on" data-layer="camera">📷 CCTV</button>
        <button class="on" data-layer="flight">✈ Flights</button>
        <button class="on" data-layer="quake">🌍 Quakes</button>
        <button class="on" data-layer="disaster">⚠ Disasters</button>
        <button class="on" data-layer="weather">🌤 Weather</button>
        <button class="on" data-layer="wildfire">🔥 Wildfires</button>
        <button class="on" data-layer="iss">🛰 ISS</button>
        <button class="on" data-layer="lightning">⚡ Lightning</button>
        <button class="on" data-layer="traffic">🚦 Traffic</button>
      </div>
      <div class="tile-switcher">
        <button class="tile-btn on" data-tile="dark" onclick="window._switchTile?.('dark')">🌙</button>
        <button class="tile-btn" data-tile="satellite" onclick="window._switchTile?.('satellite')">🛰</button>
        <button class="tile-btn" data-tile="terrain" onclick="window._switchTile?.('terrain')">⛰</button>
        <button class="tile-btn" data-tile="streets" onclick="window._switchTile?.('streets')">🗺</button>
      </div>
      <div class="tile-switcher windy-switcher">
        <span class="sw-label">Windy:</span>
        <button class="windy-btn" data-windy="wind" onclick="window._toggleSingleWindy?.('wind')">💨 Wind</button>
        <button class="windy-btn" data-windy="temp" onclick="window._toggleSingleWindy?.('temp')">🌡 Temp</button>
        <button class="windy-btn" data-windy="precip" onclick="window._toggleSingleWindy?.('precip')">🌧 Rain</button>
        <button class="windy-btn" data-windy="clouds" onclick="window._toggleSingleWindy?.('clouds')">☁ Clouds</button>
        <button class="windy-btn" data-windy="pressure" onclick="window._toggleSingleWindy?.('pressure')">🔘 Press</button>
      </div>
    </div>
    <div class="sidebar" id="sidebar">
      <div class="sidebar-resize"></div>
      <div class="panel" id="city-panel" style="min-height:120px;display:none;">
        <div class="p-title" style="color:#09f">📍 CITY VIEW <span class="badge">search a city above</span></div>
        <div class="p-body"><div class="ld">Type a city in the search bar</div></div>
      </div>
      <div class="panel" id="camera-panel">
        <div class="p-title" style="color:#ff64c8">📷 CCTV FEEDS <span class="badge" id="scam">-</span>
          <button class="fav-btn" id="fav-filter" title="Show favorites">⭐</button>
          <button class="fav-btn" id="add-cam-btn" title="Add custom camera">+</button>
          <input class="filter-inp" id="cam-filter" placeholder="Filter..." />
        </div>
        <div class="p-body" id="caml"><div class="ld">🐱 Cats deploying cameras...</div></div>
      </div>
      <div class="panel" id="conflict-panel">
        <div class="p-title">⚔ CONFLICTS & ★ MILITARY <span class="badge" id="sc">-</span></div>
        <div class="p-body" id="cl"><div class="ld">🐱 Cats analyzing conflicts...</div></div>
      </div>
      <div class="panel" id="disaster-panel">
        <div class="p-title" style="color:#ff6600">⚠ DISASTERS <span class="badge" id="sd">-</span></div>
        <div class="p-body" id="dl"><div class="ld">🐱 Cats sniffing for disasters...</div></div>
      </div>
      <div class="panel" id="flight-panel">
        <div class="p-title">✈ FLIGHTS & 🌍 QUAKES <span class="badge" id="sf">-</span></div>
        <div class="p-body" id="fl"><div class="ld">🐱 Cats tracking the skies...</div></div>
      </div>
      <div class="panel" id="weather-panel">
        <div class="p-title" style="color:#0cc">🌤 WEATHER <span class="badge" id="sw">-</span></div>
        <div class="p-body" id="wl"><div class="ld">🐱 Cats checking the weather...</div></div>
      </div>
      <div class="panel" id="wildfire-panel">
        <div class="p-title" style="color:#ff4400">🔥 WILDFIRES (NASA FIRMS) <span class="badge" id="sfire">-</span></div>
        <div class="p-body" id="firel"><div class="ld">🐱 Cats scanning for fires...</div></div>
      </div>
      <div class="panel" id="iss-panel">
        <div class="p-title" style="color:#fff">🛰 ISS TRACKER <span class="badge" id="siss">-</span></div>
        <div class="p-body" id="issl"><div class="ld">🐱 Cats tracking the ISS...</div></div>
      </div>
      <div class="panel" id="correlation-panel" style="display:none">
        <div class="p-title" style="color:#ffaa00">🔗 CORRELATION <span class="badge" id="scorr">-</span></div>
        <div class="p-body" id="corrl"><div class="ld">Click on the map to see related activity</div></div>
      </div>
      <div class="panel" id="alert-panel">
        <div class="p-title" style="color:#ff4444">🚨 ALERTS <span class="badge" id="salert">-</span>
          <button class="fav-btn" id="alert-perm-btn" style="font-size:7px">🔔 Allow</button>
        </div>
        <div class="p-body" id="alertl">
          ${getRules().map(r => `<div class="item" style="font-size:9px">
            <div class="i-h"><span class="i-t ${r.enabled ? 'r' : ''}">${r.enabled ? '🔔' : '🔕'}</span>
            <span class="i-n" style="font-size:9px">${r.type}${r.threshold ? ' ≥ ' + r.threshold : ''}</span>
            <span class="fav-star" data-alert="${r.id}">${r.enabled ? 'ON' : 'OFF'}</span></div>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>
  <div class="timeline-bar" id="timeline-bar">
    <button class="timeline-btn" id="timeline-play" title="Play/Pause">▶</button>
    <button class="timeline-btn" id="timeline-speed" title="Playback speed">1x</button>
    <span class="timeline-label" id="timeline-label">Now</span>
    <input type="range" class="timeline-slider" id="timeline-slider" min="0" max="100" value="100" />
    <span class="timeline-stats" id="timeline-stats">No events</span>
  </div>
  <footer class="bar">
    <span>🐱 MIAU SURVEILLANCE — Built by cats. For cats. In Germany. Miau.</span>
    <span class="keys">Alt+K Palette · R Refresh · F Fullscreen · ? Help</span>
    <span id="lr">-</span>
    <span id="theme-btn" title="Toggle theme">🎨</span>
  </footer>
</div>
<div class="toast" id="toast"></div>

<div class="modal-overlay" id="vid-modal" onclick="window._closeModal?.(event)">
  <div class="modal-box" onclick="event.stopPropagation()">
    <div class="modal-hdr">
      <span id="modal-title">📷 Live Feed</span>
      <button onclick="window._closeModal?.()">✕</button>
    </div>
    <div class="modal-vid"><iframe id="modal-iframe" src="" allowfullscreen loading="lazy"></iframe></div>
    <div class="modal-link"><a id="modal-link" href="#" target="_blank">🔗 Open Full Page →</a></div>
  </div>
</div>

<div class="cmd-palette" id="cmd-palette">
  <div class="cmd-box">
    <input class="cmd-input" id="cmd-input" placeholder="Type a command... (e.g. 'go tokyo', 'filter beach', 'theme dark')" />
    <div class="cmd-results" id="cmd-results"></div>
  </div>
</div>

<div class="help-overlay" id="help-overlay" onclick="this.classList.remove('show')">
  <div class="help-box" onclick="event.stopPropagation()">
    <h3>🐱 Keyboard Shortcuts</h3>
    <table>
      <tr><td><kbd>Alt+K</kbd></td><td>Command palette</td></tr>
      <tr><td><kbd>1</kbd>-<kbd>7</kbd></td><td>Switch layer tabs</td></tr>
      <tr><td><kbd>8</kbd></td><td>Show all layers</td></tr>
      <tr><td><kbd>R</kbd></td><td>Refresh data</td></tr>
      <tr><td><kbd>F</kbd></td><td>Fullscreen</td></tr>
      <tr><td><kbd>?</kbd></td><td>Toggle help</td></tr>
      <tr><td><kbd>Esc</kbd></td><td>Close panels</td></tr>
      <tr><td><kbd>Tab</kbd></td><td>Cycle theme</td></tr>
    </table>
    <p style="margin-top:8px;color:rgba(130,150,180,0.3);font-size:8px">Made in Germany. Written by cats.</p>
  </div>
</div>

<div class="grid-overlay" id="grid-overlay" onclick="if(event.target===this)this.classList.remove('show')">
  <div class="grid-hdr">
    <span>🖥 Multi-Camera Grid</span>
    <div>
      <button id="grid-4">4</button><button id="grid-9">9</button><button id="grid-16">16</button>
      <button id="grid-close">✕</button>
    </div>
  </div>
  <div class="grid-container" id="grid-container"></div>
</div>

<div class="terminal-overlay" id="terminal-overlay">
  <div class="terminal-box">
    <div class="terminal-hdr">🐱 MIAU SHELL v4.0 — Type "help" for commands</div>
    <div class="terminal-output" id="term-output">
      <div>Miau Surveillance Shell v4.0</div>
      <div>Built by cats. Made in Germany.</div>
      <div>Type <span style="color:#0f0">help</span> for available commands.</div>
      <div>────────────────────────────────────────</div>
    </div>
    <div class="terminal-input-line">
      <span style="color:#0f0">miau@surveillance:~$</span>
      <input type="text" class="terminal-input" id="term-input" autocomplete="off" spellcheck="false" />
    </div>
  </div>
</div>

<div class="news-ticker" id="news-ticker">
  <div class="news-ticker-inner" id="news-ticker-inner">📰 Loading headlines...</div>
</div>

<div class="modal-overlay" id="add-cam-modal" onclick="if(event.target===this)this.classList.remove('show')">
  <div class="modal-box" style="width:420px" onclick="event.stopPropagation()">
    <div class="modal-hdr"><span>📷 Add Custom Camera</span><button onclick="document.getElementById('add-cam-modal').classList.remove('show')">✕</button></div>
    <div style="padding:14px;display:flex;flex-direction:column;gap:8px">
      <input id="add-cam-name" placeholder="Camera name (e.g. My Backyard)" class="filter-inp" style="width:100%" />
      <div style="display:flex;gap:8px">
        <input id="add-cam-lat" placeholder="Latitude" class="filter-inp" style="width:50%" />
        <input id="add-cam-lon" placeholder="Longitude" class="filter-inp" style="width:50%" />
      </div>
      <input id="add-cam-url" placeholder="Stream URL or YouTube link" class="filter-inp" style="width:100%" />
      <input id="add-cam-vid" placeholder="YouTube video ID (optional)" class="filter-inp" style="width:100%" />
      <select id="add-cam-type" class="filter-inp" style="width:100%">
        <option value="city">City</option><option value="beach">Beach</option><option value="landmark">Landmark</option>
        <option value="traffic">Traffic</option><option value="weather">Weather</option><option value="wildlife">Wildlife</option>
      </select>
      <div style="display:flex;gap:8px;margin-top:4px">
        <button id="add-cam-save" class="rfbtn" style="flex:1">Save Camera</button>
        <button id="add-cam-import" class="rfbtn">📥 Import</button>
        <button id="add-cam-export" class="rfbtn">📤 Export</button>
      </div>
    </div>
  </div>
</div>

<div class="error-overlay" id="error-recovery" style="display:none">
  <div class="error-box">
    <h2>😿 Miau! Something broke</h2>
    <p id="err-msg" style="color:#f44;font-size:10px;margin:8px 0"></p>
    <button onclick="location.reload()" style="padding:8px 16px;background:var(--green);color:#000;border:none;border-radius:4px;cursor:pointer;font-family:inherit">🔄 Reload App</button>
    <button onclick="document.getElementById('error-recovery').style.display='none'" style="padding:8px 16px;background:transparent;border:1px solid var(--dim);color:var(--dim);border-radius:4px;cursor:pointer;font-family:inherit;margin-left:8px">Try anyway</button>
  </div>
</div>

<div class="log-overlay" id="log-overlay" style="display:none">
  <div class="log-box">
    <div class="log-hdr">🐱 Miau Logs (press ~ to toggle)</div>
    <div class="log-body" id="log-panel"></div>
  </div>
</div>

<div class="windy-overlay" id="windy-overlay">
  <div class="windy-hdr">
    <span>🌍 Windy.com — Global Weather</span>
    <button onclick="document.getElementById('windy-overlay').style.display='none'">✕ Close</button>
  </div>
  <iframe id="windy-iframe" src="" allowfullscreen style="flex:1;border:0"></iframe>
</div>
`;
}

// ── Render sidebar lists ──

function renderCameras(cameras: Camera[], filterType: string | null, favoritesOnly: boolean): string {
  const filtered = cameras
    .filter(c => !filterType || c.t === filterType)
    .filter(c => !favoritesOnly || state.favorites.includes(c.n))
    .sort((a, b) => a.n.localeCompare(b.n));

  const typeCounts: Record<string, Camera[]> = {};
  filtered.forEach(c => { if (!typeCounts[c.t]) typeCounts[c.t] = []; typeCounts[c.t]!.push(c); });

  let idx = 0;
  return Object.entries(typeCounts).map(([type, cams]) => {
    const sectionId = 'cam-section-' + (idx++);
    return `
    <div class="cam-section">
      <div class="section-hd cam-toggle" data-section="${sectionId}" style="cursor:pointer">
        <span class="toggle-arrow" id="${sectionId}-arrow">▼</span>
        ${CAMERA_TYPES[type] || type} (${cams.length})
      </div>
      <div class="cam-group" id="${sectionId}">
      ${cams.map(c => {
        const isFav = state.favorites.includes(c.n);
        const eu = embedUrl(c);
        const isLive = c.live;
        return `<div class="item" data-lat="${c.la}" data-lon="${c.lo}">
          <div class="i-h">
            <span class="i-t cam">${isLive ? '🔴' : '📷'}</span>
            <span class="i-n">${c.n}</span>
            <span class="fav-star${isFav ? ' active' : ''}" data-cam="${c.n}">${isFav ? '⭐' : '☆'}</span>
          </div>
          <div class="i-s">${c.c} ${isLive ? '<span class="live-badge">LIVE</span>' : '<span class="rec-badge">STREAM</span>'}</div>
          <button class="preview-btn" data-title="${c.n.replace(/'/g, "\\'")}" data-embed="${eu || ''}" data-url="${c.u}">▶ Preview</button>
          <button class="fly-btn" data-lat="${c.la}" data-lon="${c.lo}">📍 Map</button>
        </div>`;
      }).join('')}
      </div>
    </div>`;
  }).join('') || '<div class="ld">No cameras found</div>';
}

function renderConflicts(): string {
  return `<div class="section-hd">⚔ CONFLICTS (${CONFLICTS.length})</div>
    ${CONFLICTS.map(z => {
      const cls = z.i === 'high' ? 'r' : z.i === 'medium' ? 'o' : 'g';
      return `<div class="item" data-lat="${z.la}" data-lon="${z.lo}">
        <div class="i-h"><span class="i-t ${cls}">⚠</span><span class="i-n">${z.n}</span></div>
        <div class="i-s">${z.p} · Since ${z.s}</div>
      </div>`;
    }).join('')}
    <div class="section-hd">★ MILITARY (${MILITARY.length})</div>
    ${MILITARY.map(m => `
      <div class="item" data-lat="${m.la}" data-lon="${m.lo}">
        <div class="i-h"><span class="i-t m">${m.t === 'nuclear' ? '☢' : '★'}</span><span class="i-n">${m.n}</span></div>
        <div class="i-s">${m.c} · ${m.t}</div>
      </div>`).join('')}`;
}

// ── Command palette ──

function setupCommandPalette() {
  const input = document.getElementById('cmd-input') as HTMLInputElement;
  const results = document.getElementById('cmd-results')!;
  const palette = document.getElementById('cmd-palette')!;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!q) { results.innerHTML = ''; return; }

    const suggestions: { label: string; action: () => void }[] = [];

    // Camera search
    CAMERAS.filter(c => c.n.toLowerCase().includes(q) || c.c.toLowerCase().includes(q)).slice(0, 5)
      .forEach(c => suggestions.push({ label: `📷 Go to ${c.n} (${c.c})`, action: () => flyTo(c.la, c.lo, 14) }));

    // Layer filters
    if ('beach'.includes(q)) suggestions.push({ label: '🏖 Filter: Beach cams', action: () => { state.filterType = 'beach'; notify(); } });
    if ('city'.includes(q)) suggestions.push({ label: '🏙 Filter: City cams', action: () => { state.filterType = 'city'; notify(); } });
    if ('landmark'.includes(q)) suggestions.push({ label: '🏛 Filter: Landmarks', action: () => { state.filterType = 'landmark'; notify(); } });

    // Theme
    suggestions.push({ label: '🎨 Cycle theme (crt/dark/matrix)', action: () => cycleTheme() });
    suggestions.push({ label: '🎨 Theme: CRT', action: () => setTheme('crt') });
    suggestions.push({ label: '🎨 Theme: Dark', action: () => setTheme('dark') });

    // Actions
    suggestions.push({ label: '🔄 Refresh all data', action: () => refreshAll() });
    suggestions.push({ label: '🗺 Show all layers', action: () => showAllLayers() });
    suggestions.push({ label: '📷 Show CCTV only', action: () => showOnlyLayer('camera') });

    results.innerHTML = suggestions.map(s => `<div class="cmd-item">${s.label}</div>`).join('');

    // Click handlers
    results.querySelectorAll('.cmd-item').forEach((el, i) => {
      (el as HTMLElement).onclick = () => { suggestions[i]!.action(); palette.classList.remove('show'); input.value = ''; results.innerHTML = ''; };
    });
  });

  // Close on click outside
  palette.addEventListener('click', e => { if (e.target === palette) palette.classList.remove('show'); });
}

// ── Sidebar bindings ──

function bindSidebarClicks() {
  // Camera section toggle (expand/collapse)
  document.getElementById('caml')!.addEventListener('click', e => {
    const target = e.target as HTMLElement;
    // Toggle section
    const toggle = target.closest('.cam-toggle') as HTMLElement;
    if (toggle) {
      const sectionId = toggle.dataset.section!;
      const group = document.getElementById(sectionId)!;
      const arrow = document.getElementById(sectionId + '-arrow')!;
      const isCollapsed = group.style.display === 'none';
      group.style.display = isCollapsed ? '' : 'none';
      arrow.textContent = isCollapsed ? '▼' : '▶';
      return;
    }
    // Fly-to
    if (target.classList.contains('fly-btn') || target.closest('.item')) {
      const item = target.closest('.item') as HTMLElement | null;
      const lat = parseFloat(item?.dataset.lat || target.dataset.lat || '0');
      const lon = parseFloat(item?.dataset.lon || target.dataset.lon || '0');
      if (lat && lon) flyTo(lat, lon, 14);
    }
    // Preview
    if (target.classList.contains('preview-btn')) {
      const title = target.dataset.title || 'Camera';
      const embed = target.dataset.embed || null;
      const url = target.dataset.url || '#';
      openModal(title, embed || null, url);
    }
    // Favorite
    if (target.classList.contains('fav-star')) {
      const camName = target.dataset.cam!;
      const idx = state.favorites.indexOf(camName);
      if (idx >= 0) state.favorites.splice(idx, 1); else state.favorites.push(camName);
      saveFavorites();
      notify();
    }
  });

  document.getElementById('cl')!.addEventListener('click', e => {
    const item = (e.target as HTMLElement).closest('.item') as HTMLElement | null;
    if (item) {
      const lat = parseFloat(item.dataset.lat || '0');
      const lon = parseFloat(item.dataset.lon || '0');
      if (lat && lon) flyTo(lat, lon, 10);
    }
  });

  // Filter input
  document.getElementById('cam-filter')!.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value.toLowerCase();
    state.searchQuery = val;
    notify();
  });

  // Favorites filter
  document.getElementById('fav-filter')!.addEventListener('click', function() {
    this.classList.toggle('on');
    notify();
  });
}

// ── Layer toggles ──

function bindLayerToggles() {
  document.getElementById('layers')!.addEventListener('click', e => {
    const btn = (e.target as HTMLElement).closest('button') as HTMLElement | null;
    if (!btn) return;
    const layer = btn.dataset.layer!;
    const on = toggleLayer(layer);
    btn.classList.toggle('on', on);
  });

  document.getElementById('tabs')!.addEventListener('click', e => {
    const btn = (e.target as HTMLElement).closest('button') as HTMLElement | null;
    if (!btn) return;
    const layer = btn.dataset.layer!;
    document.querySelectorAll('#tabs .tab').forEach(t => t.classList.remove('on'));
    btn.classList.add('on');
    if (!layer) showAllLayers();
    else showOnlyLayer(layer);
  });
}

// ── Re-render on state change ──

let favoritesOnly = false;

subscribe(() => {
  // Update layer toggles
  document.querySelectorAll('#layers button').forEach(b => {
    const el = b as HTMLElement;
    el.classList.toggle('on', state.visibleLayers.has(el.dataset.layer!));
  });

  // Update tab highlighting
  document.querySelectorAll('#tabs .tab').forEach(t => {
    const el = t as HTMLElement;
    el.classList.toggle('on', state.activeLayer === el.dataset.layer || (!state.activeLayer && !el.dataset.layer));
  });

  // Re-render cameras
  const filterEl = document.getElementById('cam-filter') as HTMLInputElement;
  const filterVal = filterEl?.value.toLowerCase() || state.searchQuery;
  document.getElementById('caml')!.innerHTML = renderCameras(getAllCameras(), state.filterType, favoritesOnly);
  document.getElementById('camc')!.textContent = CAMERAS.length.toString();
  document.getElementById('scam')!.textContent = CAMERAS.length.toString();

  // Update conflicts
  document.getElementById('cl')!.innerHTML = renderConflicts();
  document.getElementById('cc')!.textContent = CONFLICTS.length.toString();
  document.getElementById('cm')!.textContent = MILITARY.length.toString();
  document.getElementById('sc')!.textContent = (CONFLICTS.length + MILITARY.length).toString();
});

// ── Refresh ──

let countdown = REFRESH_INTERVAL;

async function refreshAll() {
  try {
  const start = Date.now();

  // Disasters
  try {
    const layer = layers.get('disaster')!;
    clearMarkers(layer.group);
    const disasters = await fetchDisasters();
    disasters.forEach(d => createDisasterMarker(d.lat, d.lon, d.title, d.categories).addTo(layer.group));
    document.getElementById('cd')!.textContent = disasters.length.toString();
    document.getElementById('dl')!.innerHTML = `<div class="section-hd">⚠ ACTIVE EVENTS (${disasters.length})</div>${disasters.map(d => `<div class="item"><div class="i-h"><span class="i-t o">⚠</span><span class="i-n">${d.title.substring(0, 55)}</span></div></div>`).join('')}`;
    document.getElementById('sd')!.textContent = disasters.length.toString();
  } catch (e) { /* silent */ }

  // Flights
  let flightCount = 0;
  try {
    const layer = layers.get('flight')!;
    clearMarkers(layer.group);
    const flights = await fetchFlights();
    flightCount = flights.length;
    let mil = 0;
    flights.forEach(f => { if (f.isMilitary) mil++; createFlightMarker([f.lat, f.lon], f.callsign, f.origin, f.alt, f.isMilitary, f.milType).addTo(layer.group); if (f.isMilitary) addEvent({ id: '', timestamp: Date.now(), type: 'flight', lat: f.lat, lon: f.lon, label: 'MIL ' + f.callsign, detail: f.milType }); });
    document.getElementById('cf')!.textContent = `${flights.length}${mil ? ` (${mil} mil)` : ''}`;
    document.getElementById('sf')!.textContent = flights.length.toString();
  } catch (e) { /* silent */ }

  // Quakes
  try {
    const layer = layers.get('quake')!;
    clearMarkers(layer.group);
    const quakes = await fetchQuakes();
    quakes.forEach(q => { createQuakeMarker(q.lat, q.lon, q.mag, q.place, q.depth).addTo(layer.group); if (q.mag >= 3) { addEvent({ id: '', timestamp: Date.now(), type: 'quake', lat: q.lat, lon: q.lon, label: 'M' + q.mag.toFixed(1) + ' ' + q.place, magnitude: q.mag }); checkAlert('quake', q.mag, 'M' + q.mag.toFixed(1) + ' quake near ' + q.place); }});
    document.getElementById('cq')!.textContent = quakes.length.toString();
    document.getElementById('fl')!.innerHTML = `<div class="section-hd">🌍 QUAKES (${quakes.length})</div>${quakes.slice(0, 15).map(q => {
      const tag = q.mag >= 5 ? 'r' : q.mag >= 3 ? 'o' : 'g';
      return `<div class="item"><div class="i-h"><span class="i-t ${tag}">M${q.mag.toFixed(1)}</span><span class="i-n">${q.place}</span></div><div class="i-s">Depth ${q.depth.toFixed(1)}km</div></div>`;
    }).join('')}${flightCount ? `<div class="section-hd">✈ FLIGHTS (${flightCount})</div>` : ''}`;
  } catch (e) { /* silent */ }

  // Weather
  try {
    const layer = layers.get('weather')!;
    clearMarkers(layer.group);
    const weather = await fetchWeather();
    let wxHTML = '';
    weather.forEach(w => {
      createWeatherMarker(w.lat, w.lon, w.name, w.temp, w.wind, w.emoji).addTo(layer.group);
      wxHTML += `<div class="item"><div class="i-h"><span class="i-t wx">${w.emoji} ${w.temp != null ? w.temp.toFixed(1) + '°C' : '?'}</span><span class="i-n">${w.name}</span></div><div class="i-s">Wind ${w.wind != null ? w.wind.toFixed(1) + ' km/h' : '?'}</div></div>`;
    });
    document.getElementById('cw')!.textContent = weather.length.toString();
    document.getElementById('wl')!.innerHTML = wxHTML || '<div class="ld">No weather data</div>';
    document.getElementById('sw')!.textContent = weather.length.toString();
  } catch (e) { /* silent */ }

  // Wildfires
  try {
    const fireLayer = layers.get('wildfire')!;
    clearMarkers(fireLayer.group);
    const fires = await fetchWildfires();
    fires.slice(0, 500).forEach(f => createWildfireMarker(f.lat, f.lon, f.brightness, f.confidence, f.satellite).addTo(fireLayer.group));
    document.getElementById('cfire')!.textContent = fires.length.toString();
    document.getElementById('sfire')!.textContent = fires.length.toString();
    document.getElementById('firel')!.innerHTML = `<div class="section-hd">🔥 ACTIVE FIRES (${fires.length})</div>` +
      fires.slice(0, 10).map(f => `<div class="item"><div class="i-h"><span class="i-t o">🔥</span><span class="i-n">${f.brightness.toFixed(0)}K · ${f.confidence}%</span></div><div class="i-s">${f.satellite} · ${f.acqDate}</div></div>`).join('');
    fires.filter(f => f.confidence > 90).forEach(f => addHistoryEvent({ time: Date.now(), type: 'wildfire', label: `Wildfire ${f.brightness.toFixed(0)}K`, lat: f.lat, lon: f.lon }));
  } catch (e) { /* silent */ }

  // ISS
  try {
    const issLayer = layers.get('iss')!;
    clearMarkers(issLayer.group);
    const iss = await fetchIssPosition();
    if (iss) {
      createIssMarker(iss.lat, iss.lon, iss.timestamp).addTo(issLayer.group);
      document.getElementById('ciss')!.textContent = '📍';
      document.getElementById('siss')!.textContent = 'live';
      document.getElementById('issl')!.innerHTML = `<div class="section-hd">🛰 ISS CURRENT POSITION</div>
        <div class="item"><div class="i-h"><span class="i-t b">🛰</span><span class="i-n">ISS</span></div><div class="i-s">Lat: ${iss.lat.toFixed(2)} · Lon: ${iss.lon.toFixed(2)} · ${new Date(iss.timestamp * 1000).toLocaleTimeString()}</div><button class="fly-btn" data-lat="${iss.lat}" data-lon="${iss.lon}">📍 Track ISS</button></div>`;
    }
  } catch (e) { /* silent */ }

  // Lightning
  try {
    const litLayer = layers.get('lightning')!;
    clearMarkers(litLayer.group);
    const strikes = await fetchLightning();
    strikes.forEach(s => createLightningMarker(s.lat, s.lon, s.time).addTo(litLayer.group));
    document.getElementById('clit')!.textContent = strikes.length.toString();
  } catch (e) { /* silent */ }

  // News
  try {
    const news = await fetchNews();
    if (news.length > 0) {
      document.getElementById('news-ticker-inner')!.innerHTML = '📰 ' + news.map(n => `<span class="news-item">${n.title}</span>`).join(' · ');
    }
  } catch (e) { /* silent */ }

  safeText('lr', `Last: ${new Date().toLocaleTimeString()} (${Date.now() - start}ms)`);
  safeText('live-dot', '● LIVE');
  countdown = REFRESH_INTERVAL;
  } catch (e) { logger.warn('REFRESH', 'Refresh error (non-fatal)', e); }
}

// ── Init ──

export async function initApp() {
  // Render app shell (safely)
  const appEl = document.getElementById('app');
  if (!appEl) { logger.error('APP', 'No #app element in DOM'); return; }
  appEl.innerHTML = renderApp();

  // Init theme
  initTheme();
  initLogPanel();
  logger.info('APP', 'UI rendered, initializing systems...');

  // Init map
  try { initMap('map'); logger.info('APP', 'Map initialized'); } catch (e) { logger.error('MAP', 'Map init failed', e); }

  // Create all layer groups (cameras + conflicts use clustering)
  createLayer('conflict', false);
  createLayer('military', false);
  createLayer('camera', true);
  createLayer('flight', false);
  createLayer('quake', false);
  createLayer('disaster', false);
  createLayer('weather', false);
  createLayer('wildfire', true);
  createLayer('iss', false);
  createLayer('lightning', false);
  createLayer('traffic', true);

  // Static markers
  const cameraLayer = layers.get('camera')!;
  CAMERAS.forEach(c => createCameraMarker(c).addTo(cameraLayer.group));

  const conflictLayer = layers.get('conflict')!;
  CONFLICTS.forEach(c => createConflictMarker(c).addTo(conflictLayer.group));

  const milLayer = layers.get('military')!;
  MILITARY.forEach(m => createMilitaryMarker(m).addTo(milLayer.group));

  // Initial sidebar render
  document.getElementById('caml')!.innerHTML = renderCameras(CAMERAS, null, false);
  document.getElementById('camc')!.textContent = CAMERAS.length.toString();
  document.getElementById('scam')!.textContent = CAMERAS.length.toString();
  document.getElementById('cl')!.innerHTML = renderConflicts();
  document.getElementById('cc')!.textContent = CONFLICTS.length.toString();
  document.getElementById('cm')!.textContent = MILITARY.length.toString();
  document.getElementById('sc')!.textContent = (CONFLICTS.length + MILITARY.length).toString();

  // Bind events
  bindLayerToggles();
  bindSidebarClicks();
  setupKeyboard();
  setupCommandPalette();

  // Init new modules (wrapped to prevent single failure from breaking everything)
  try { initCitySearch(); } catch (e) { console.warn('City search init failed:', e); }
  try { initGrid(); } catch (e) { console.warn('Grid init failed:', e); }
  try { initTerminal(); } catch (e) { console.warn('Terminal init failed:', e); }
  try { initVoice(); } catch (e) { console.warn('Voice init failed:', e); }
  try { initCatMascot(); } catch (e) { console.warn('Cat mascot init failed:', e); }
  try { initEasterEggs(); } catch (e) { console.warn('Easter eggs init failed:', e); }

  // Alert panel
  document.getElementById('alert-perm-btn')?.addEventListener('click', () => requestPermission());
  document.getElementById('alertl')?.addEventListener('click', (e) => {
    const star = (e.target as HTMLElement).closest('.fav-star') as HTMLElement;
    if (star?.dataset.alert) toggleRule(star.dataset.alert);
  });

  // Timeline
  loadHistory();
  initTimeline();

  // Voice button
  const voiceBtn = document.getElementById('voice-btn');
  if (voiceBtn) voiceBtn.addEventListener('click', () => toggleVoice());

  // Add camera button
  const addCamBtn = document.getElementById('add-cam-btn');
  if (addCamBtn) addCamBtn.addEventListener('click', () => document.getElementById('add-cam-modal')!.classList.add('show'));

  // Save custom camera
  document.getElementById('add-cam-save')?.addEventListener('click', () => {
    const name = (document.getElementById('add-cam-name') as HTMLInputElement).value;
    const lat = parseFloat((document.getElementById('add-cam-lat') as HTMLInputElement).value);
    const lon = parseFloat((document.getElementById('add-cam-lon') as HTMLInputElement).value);
    const url = (document.getElementById('add-cam-url') as HTMLInputElement).value;
    const vid = (document.getElementById('add-cam-vid') as HTMLInputElement).value;
    const type = (document.getElementById('add-cam-type') as HTMLSelectElement).value as Camera['t'];
    if (!name || !url || isNaN(lat) || isNaN(lon)) { toast('Fill all fields (name, lat, lon, url)', 3000); return; }
    const cam: Camera = { n: name, la: lat, lo: lon, t: type, u: url, c: 'Custom' };
    if (vid) cam.vid = vid;
    addCustomCamera(cam);
    document.getElementById('add-cam-modal')!.classList.remove('show');
    // Clear form
    ['add-cam-name','add-cam-lat','add-cam-lon','add-cam-url','add-cam-vid'].forEach(id => (document.getElementById(id) as HTMLInputElement).value = '');
  });

  // Import/export
  document.getElementById('add-cam-import')?.addEventListener('click', () => {
    const json = prompt('Paste camera JSON:');
    if (json) importCameras(json);
  });
  document.getElementById('add-cam-export')?.addEventListener('click', () => {
    const json = exportCameras();
    navigator.clipboard.writeText(json).then(() => toast('Copied to clipboard!', 2000));
  });

  // Modal globals
  (window as any)._closeModal = (e?: MouseEvent) => closeModal(e);
  (window as any)._switchTile = (key: string) => switchTile(key);
  (window as any)._toggleSingleWindy = (layer: string) => toggleSingleWindyLayer(layer as any);

  // Windy Mode button
  const windyBtn = document.getElementById('windy-mode-btn');
  if (windyBtn) windyBtn.addEventListener('click', () => toggleWindyMode());
  // Windy.com full view
  const fullWindyBtn = document.getElementById('windy-full-btn');
  if (fullWindyBtn) fullWindyBtn.addEventListener('click', () => {
    const overlay = document.getElementById('windy-overlay')!;
    const iframe = document.getElementById('windy-iframe') as HTMLIFrameElement;
    if (overlay.style.display === 'flex') {
      overlay.style.display = 'none';
      iframe.src = '';
    } else {
      iframe.src = `https://embed.windy.com/embed2.html?lat=20&lon=10&zoom=3&level=surface&overlay=wind&menu=&message=&marker=&calendar=&pressure=&type=map&location=coordinates&detail=&detailLat=20&detailLon=10&metricWind=default&metricTemp=default&radarRange=-1`;
      overlay.style.display = 'flex';
    }
  });

  // Refresh button
  document.getElementById('rfbtn')!.addEventListener('click', () => { refreshAll(); toast('🐱 Miau! Refreshing...', 1500); });

  // Theme button
  document.getElementById('theme-btn')!.addEventListener('click', () => { const t = cycleTheme(); toast(`🎨 Theme: ${t}`, 1500); });

  // Tab key → cycle theme
  document.addEventListener('keydown', e => { if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey && !(e.target as HTMLElement)?.closest('input')) { e.preventDefault(); cycleTheme(); } });

  // Custom events
  window.addEventListener('miau-refresh', () => refreshAll());
  window.addEventListener('miau-show-all', () => showAllLayers());
  window.addEventListener('miau-focus-layer', ((e: CustomEvent) => showOnlyLayer(e.detail)) as EventListener);

  // Load traffic cameras (one-time, 7000+ cameras)
  try {
    const tLayer = layers.get('traffic')!;
    const trafficCams = await fetchTrafficCams();
    trafficCams.forEach(c => createTrafficMarker(c.latitude, c.longitude, c.description, c.url, c.format, c.state || '').addTo(tLayer.group));
  } catch (e) { console.warn('Traffic cam load failed:', e); }

  // Map click → show related events within 200km
  getMap().on('click', (e: any) => {
    const { lat, lng } = e.latlng;
    const group = correlateEvent({ id: '', timestamp: Date.now(), type: 'quake', lat, lon: lng, label: 'Map click' }, 200);
    if (group.events.length > 0) {
      document.getElementById('correlation-panel')!.style.display = '';
      document.getElementById('corrl')!.innerHTML = 
        `<div class="section-hd" style="color:#ffaa00">🔗 ${group.events.length} events within 200km</div>
        <div style="padding:4px;font-size:9px;color:var(--dim)">${group.summary}</div>
        ${group.events.slice(0, 10).map(e => `<div class="item" data-lat="${e.lat}" data-lon="${e.lon}">
          <div class="i-h"><span class="i-t ${e.type === 'quake' ? 'r' : e.type === 'flight' ? 'p' : 'o'}">${e.type}</span>
          <span class="i-n">${e.label}</span></div><div class="i-s">${new Date(e.timestamp).toLocaleTimeString()}</div>
        </div>`).join('')}`;
    }
  });

  // Start tracking (flights, satellites, ships)
  try { initTracking(); } catch (e) { console.warn('Tracking init failed:', e); }

  // Initial fetch + periodic refresh
  refreshAll();
  setInterval(refreshAll, REFRESH_INTERVAL);

  // Countdown timer
  setInterval(() => {
    countdown -= 1000;
    if (countdown <= 0) countdown = REFRESH_INTERVAL;
    document.getElementById('live-dot')!.textContent = `● ${Math.round(countdown / 1000)}s`;
  }, 1000);

  // Map resize fix
  setTimeout(() => {
    getMap().invalidateSize();
  }, 500);
}
