import L from 'leaflet';
import { Camera } from '../data/cameras';
import { Conflict } from '../data/conflicts';
import { Military } from '../data/military';
import { flyTo } from './core';
import { openModal } from '../ui/modal';
import { CAMERA_TYPES } from '../data/cameras';

let currentPopup: L.Popup | null = null;

function closePopup() {
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
}

export function embedUrl(cam: Camera): string | null {
  if (cam.vid) return `https://www.youtube.com/embed/${cam.vid}?autoplay=1&mute=1&playsinline=1`;
  if (cam.u.includes('earthcam.com')) return cam.u.replace(/\/$/, '') + '?embed=1&autoplay=1';
  return cam.u;
}

export function createCameraMarker(cam: Camera, onClick?: () => void): L.Marker {
  const cols: Record<string, string> = { city: '#ff64c8', traffic: '#ffa040', landmark: '#ffd040', beach: '#40d0ff', weather: '#40ff80', wildlife: '#ff8040' };
  const col = cols[cam.t] || '#ff64c8';
  const eu = embedUrl(cam);

  let vidHTML: string;
  if (eu) {
    const isEC = !cam.vid && cam.u.includes('earthcam');
    vidHTML = `<div class="cam-vid-wrap${isEC ? ' cam-ec' : ''}"><div class="vid-loading">${cam.vid ? '▶ YouTube Live' : '🔄 EarthCam Live'}</div><iframe src="${eu}" allow="autoplay; encrypted-media" allowfullscreen onload="this.previousElementSibling.style.display='none'" onerror="this.previousElementSibling.textContent='⚠ Cannot load'"></iframe></div>`;
  } else {
    vidHTML = `<div class="cam-vid-wrap cam-poster"><div style="font-size:36px">📷</div><div style="font-size:9px;color:rgba(130,150,180,0.4);text-align:center">Live feed available<br>on EarthCam.com</div><a class="cam-link" href="${cam.u}" target="_blank" style="font-size:10px;padding:4px 12px">▶ Open Live Feed</a></div>`;
  }

  const m = L.marker([cam.la, cam.lo], {
    icon: L.divIcon({
      className: '',
      html: `<div style="font-size:16px;filter:drop-shadow(0 0 4px ${col})">📷</div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    }),
  });

  const popup = L.popup({ maxWidth: eu && !cam.vid && cam.u.includes('earthcam') ? 500 : 340, closeButton: true })
    .setContent(`<b>📷 ${cam.n}</b><br><span style="font-size:8px;color:rgba(130,150,180,0.4)">${cam.c} · ${cam.t}</span>${vidHTML}<a class="cam-link" href="${cam.u}" target="_blank">🔗 Open Full Page →</a>`);

  m.bindPopup(popup);
  m.on('click', () => { closePopup(); currentPopup = popup; onClick?.(); });

  return m;
}

export function createConflictMarker(conflict: Conflict): L.Marker {
  const col = conflict.i === 'high' ? '#ff2020' : conflict.i === 'medium' ? '#ff8800' : '#ffb400';
  const sz = conflict.i === 'high' ? 20 : conflict.i === 'medium' ? 16 : 12;
  return L.marker([conflict.la, conflict.lo], {
    icon: L.divIcon({
      className: '',
      html: `<div style="font-size:${sz}px;filter:drop-shadow(0 0 3px ${col})">⚠</div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    }),
  }).bindPopup(`<b>${conflict.n}</b><br>${conflict.p}<br>Since ${conflict.s}<br><span style="color:${col}">${conflict.i} intensity</span>`);
}

export function createMilitaryMarker(m: Military): L.Marker {
  const col = m.t === 'nuclear' ? '#ff4080' : m.t === 'base' ? '#cc8800' : '#8860aa';
  return L.marker([m.la, m.lo], {
    icon: L.divIcon({
      className: '',
      html: `<div style="font-size:${m.t === 'nuclear' ? 18 : 14}px;filter:drop-shadow(0 0 3px ${col})">${m.t === 'nuclear' ? '☢' : '⭐'}</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    }),
  }).bindPopup(`<b>${m.n}</b><br>${m.c} · ${m.t}`);
}

export function createFlightMarker(state: [number, number], callsign: string, origin: string, alt: number | null, isMilitary: boolean, milType?: string): L.Marker {
  return L.marker(state, {
    icon: L.divIcon({
      className: '',
      html: isMilitary
        ? '<div style="font-size:16px;text-shadow:0 0 4px #ff4466">🛩</div>'
        : '<div style="font-size:13px;text-shadow:0 0 3px #0088ff">✈</div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    }),
  }).bindPopup(`<b>${isMilitary ? '🛩 MIL: ' : '✈ '}${callsign}</b><br>${origin}<br>Alt: ${alt ? Math.round(alt) + 'm' : '-'}${isMilitary ? `<br><span style="color:#ff4466">MILITARY: ${milType}</span>` : ''}`);
}

export function createQuakeMarker(lat: number, lon: number, mag: number, place: string, depth: number): L.CircleMarker {
  const c = mag >= 5 ? '#ff2020' : mag >= 3 ? '#ff8800' : '#00aa44';
  return L.circleMarker([lat, lon], {
    radius: Math.max(4, mag * 3),
    color: c,
    fillColor: c,
    fillOpacity: 0.35,
    weight: 1,
  }).bindPopup(`<b>M${mag.toFixed(1)}</b><br>${place}<br>Depth: ${depth.toFixed(1)}km`);
}

export function createDisasterMarker(lat: number, lon: number, title: string, categories: string): L.Marker {
  return L.marker([lat, lon], {
    icon: L.divIcon({
      className: '',
      html: '<div style="font-size:16px;filter:drop-shadow(0 0 4px #ff6600)">🔥</div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    }),
  }).bindPopup(`<b>${title}</b><br>${categories}`);
}

export function createWeatherMarker(lat: number, lon: number, cityName: string, temp: number | null, wind: number | null, emoji: string): L.Marker {
  return L.marker([lat, lon], {
    icon: L.divIcon({
      className: '',
      html: '<div style="font-size:15px;filter:drop-shadow(0 0 3px #0cc)">🌤</div>',
      iconSize: [17, 17],
      iconAnchor: [8, 8],
    }),
  }).bindPopup(`<b>${emoji} ${cityName}</b><br>Temp: ${temp != null ? temp.toFixed(1) + '°C' : '?'}<br>Wind: ${wind != null ? wind.toFixed(1) + ' km/h' : '?'}`);
}

export function createWildfireMarker(lat: number, lon: number, brightness: number, confidence: number, satellite: string): L.CircleMarker {
  const r = Math.max(3, brightness / 50);
  return L.circleMarker([lat, lon], {
    radius: r,
    color: confidence > 80 ? '#ff2000' : confidence > 50 ? '#ff6600' : '#ffaa00',
    fillColor: confidence > 80 ? '#ff2000' : confidence > 50 ? '#ff6600' : '#ffaa00',
    fillOpacity: 0.5,
    weight: 1,
  }).bindPopup(`<b>🔥 Wildfire</b><br>Brightness: ${brightness.toFixed(1)}K<br>Confidence: ${confidence}%<br>Satellite: ${satellite}`);
}

export function createIssMarker(lat: number, lon: number, timestamp: number): L.Marker {
  return L.marker([lat, lon], {
    icon: L.divIcon({
      className: '',
      html: '<div style="font-size:18px;filter:drop-shadow(0 0 6px #fff)">🛰</div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    }),
  }).bindPopup(`<b>🛰 International Space Station</b><br>Lat: ${lat.toFixed(2)}<br>Lon: ${lon.toFixed(2)}<br>Updated: ${new Date(timestamp * 1000).toLocaleTimeString()}`);
}

export function createLightningMarker(lat: number, lon: number, time: number): L.CircleMarker {
  return L.circleMarker([lat, lon], {
    radius: 5,
    color: '#ffff00',
    fillColor: '#ffff00',
    fillOpacity: 0.8,
    weight: 0,
  }).bindPopup(`<b>⚡ Lightning strike</b><br>Time: ${new Date(time).toLocaleTimeString()}`);
}

export function createAirQualityMarker(lat: number, lon: number, city: string, aqi: number, pm25: number): L.Marker {
  const col = aqi > 150 ? '#ff2020' : aqi > 100 ? '#ff8800' : aqi > 50 ? '#ffcc00' : '#00cc44';
  return L.marker([lat, lon], {
    icon: L.divIcon({
      className: '',
      html: `<div style="background:${col};color:#000;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700">${aqi}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    }),
  }).bindPopup(`<b>🌫 ${city}</b><br>AQI: ${aqi}<br>PM2.5: ${pm25.toFixed(1)} µg/m³<br><span style="color:${col}">${aqi > 150 ? 'Hazardous' : aqi > 100 ? 'Unhealthy' : aqi > 50 ? 'Moderate' : 'Good'}</span>`);
}

export function clearMarkers(group: L.LayerGroup | L.MarkerClusterGroup) {
  if ('clearLayers' in group) {
    (group as L.MarkerClusterGroup).clearLayers();
  } else {
    (group as L.LayerGroup).clearLayers();
  }
}
