import L from 'leaflet';
import { Camera } from '../data/cameras';
import { Conflict } from '../data/conflicts';
import { Military } from '../data/military';
import { tempColor } from '../api/data';
import { flyTo } from './core';
import { openModal } from '../ui/modal';
import { CAMERA_TYPES } from '../data/cameras';

import { nicePopup, nicePopupMini } from './popup';

let currentPopup: L.Popup | null = null;
function closePopup() { if (currentPopup) { currentPopup.remove(); currentPopup = null; } }

export function embedUrl(cam: Camera): string | null {
  if (cam.vid) return `https://www.youtube-nocookie.com/embed/${cam.vid}?playsinline=1&modestbranding=1&rel=0`;
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
    const ytFallback = cam.vid ? `https://www.youtube.com/watch?v=${cam.vid}` : cam.u;
    vidHTML = `<div class="cam-vid-wrap${isEC ? ' cam-ec' : ''}"><div class="vid-loading">${cam.vid ? '▶ YouTube Live' : '🔄 EarthCam Live'}</div><iframe src="${eu}" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy" sandbox="allow-scripts allow-same-origin allow-presentation" onload="this.previousElementSibling.style.display='none'" onerror="this.style.display='none';this.parentElement.classList.add('blocked');this.parentElement.querySelector('.vid-fallback').style.display='flex'"></iframe><div class="vid-fallback" style="display:none"><div style="font-size:10px;color:var(--dim);margin-bottom:8px">Embed blocked by YouTube</div><a class="cam-link" href="${ytFallback}" target="_blank" style="font-size:11px;padding:6px 14px">▶ Watch on YouTube</a></div></div>`;
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

  const pageUrl = cam.vid ? `https://www.youtube.com/watch?v=${cam.vid}` : cam.u;
  const popup = L.popup({ maxWidth: eu && !cam.vid && cam.u.includes('earthcam') ? 560 : 420, closeButton: true, minWidth: 320 })
    .setContent(nicePopup(cam.n, `${cam.c} · ${cam.t}`, vidHTML, '📷', cam.live ? '🔴 LIVE' : '📡'));

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
  }).bindPopup(nicePopupMini(conflict.n, `${conflict.p} · Since ${conflict.s}`, '⚠'));
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
  }).bindPopup(nicePopupMini(m.n, `${m.c} · ${m.t}`, m.t === 'nuclear' ? '☢' : '★'));
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
  }).bindPopup(nicePopup(callsign, `${origin} · Alt: ${alt ? Math.round(alt) + 'm' : '?'}`, isMilitary ? `<span style="color:#ff4466;font-size:10px">⚠ MILITARY: ${milType || 'Yes'}</span>` : '', isMilitary ? '🛩' : '✈', isMilitary ? '🔴 MIL' : ''));
}

export function createQuakeMarker(lat: number, lon: number, mag: number, place: string, depth: number): L.CircleMarker {
  const c = mag >= 5 ? '#ff2020' : mag >= 3 ? '#ff8800' : '#00aa44';
  return L.circleMarker([lat, lon], {
    radius: Math.max(4, mag * 3),
    color: c,
    fillColor: c,
    fillOpacity: 0.35,
    weight: 1,
  }).bindPopup(nicePopup(`M${mag.toFixed(1)}`, place, `Depth: ${depth.toFixed(1)}km`, '🌍'));
}

export function createDisasterMarker(lat: number, lon: number, title: string, categories: string): L.Marker {
  return L.marker([lat, lon], {
    icon: L.divIcon({
      className: '',
      html: '<div style="font-size:16px;filter:drop-shadow(0 0 4px #ff6600)">🔥</div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    }),
  }).bindPopup(nicePopup(title.substring(0, 60), categories, '', '🔥'));
}

export function createWeatherMarker(lat: number, lon: number, cityName: string, temp: number | null, wind: number | null, emoji: string, humidity?: number | null, feelsLike?: number | null, windDir?: number | null): L.Marker {
  const col = temp != null ? tempColor(temp) : '#0cc';
  const arrow = windDir != null ? `<div style="display:inline-block;transform:rotate(${windDir}deg);font-size:10px">↑</div>` : '';
  return L.marker([lat, lon], {
    icon: L.divIcon({
      className: '',
      html: `<div style="background:${col};color:#000;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;border:2px solid ${col};box-shadow:0 0 8px ${col}44">${temp != null ? Math.round(temp)+'°' : '?'}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    }),
  }).bindPopup(nicePopup(`${emoji} ${cityName}`, `Temp: ${temp != null ? temp.toFixed(1) + '°C' : '?'}${feelsLike != null ? ' · Feels ' + feelsLike.toFixed(1) + '°' : ''}`, `Wind: ${wind != null ? wind.toFixed(1) + ' km/h' : '?'} · Humidity: ${humidity != null ? humidity + '%' : '?'}`, '🌤'));
}

function getTempLabel(temp: number | null): string {
  if (temp == null) return '';
  if (temp >= 35) return '🔥 Very hot'; if (temp >= 28) return '☀ Hot';
  if (temp >= 20) return '😊 Warm'; if (temp >= 12) return '🍃 Mild';
  if (temp >= 5) return '🧥 Cool'; if (temp >= -5) return '❄ Cold';
  return '🥶 Freezing';
}

export function createWildfireMarker(lat: number, lon: number, brightness: number, confidence: number, satellite: string): L.CircleMarker {
  const r = Math.max(3, brightness / 50);
  return L.circleMarker([lat, lon], {
    radius: r,
    color: confidence > 80 ? '#ff2000' : confidence > 50 ? '#ff6600' : '#ffaa00',
    fillColor: confidence > 80 ? '#ff2000' : confidence > 50 ? '#ff6600' : '#ffaa00',
    fillOpacity: 0.5,
    weight: 1,
  }).bindPopup(nicePopup('Wildfire', `Brightness: ${brightness.toFixed(1)}K · Confidence: ${confidence}%`, `Satellite: ${satellite}`, '🔥'));
}

export function createIssMarker(lat: number, lon: number, timestamp: number): L.Marker {
  return L.marker([lat, lon], {
    icon: L.divIcon({
      className: '',
      html: '<div style="font-size:18px;filter:drop-shadow(0 0 6px #fff)">🛰</div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    }),
  }).bindPopup(nicePopup('ISS', `Orbiting Earth`, `Lat: ${lat.toFixed(2)} · Lon: ${lon.toFixed(2)} · ${new Date(timestamp * 1000).toLocaleTimeString()}`, '🛰', '🟢 LIVE'));
}

export function createLightningMarker(lat: number, lon: number, time: number): L.CircleMarker {
  return L.circleMarker([lat, lon], {
    radius: 5,
    color: '#ffff00',
    fillColor: '#ffff00',
    fillOpacity: 0.8,
    weight: 0,
  }).bindPopup(nicePopup('Lightning Strike', '', `Time: ${new Date(time).toLocaleTimeString()}`, '⚡'));
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

import Hls from 'hls.js';

export function createTrafficMarker(
  lat: number, lon: number, desc: string, url: string, format: string, state: string
): L.Marker {
  const isVideo = format === 'M3U8' || format === 'M3U9';
  const playerId = 'tc-' + Math.random().toString(36).slice(2, 8);
  
  let vidHTML: string;
  if (isVideo) {
    vidHTML = `<div class="cam-vid-wrap" style="width:340px;height:200px"><div class="vid-loading" id="vid-load-${playerId}">🚦 Loading stream...</div><video id="${playerId}" controls muted playsinline autoplay style="width:100%;height:100%;background:#000"></video><div class="vid-fallback2" id="vid-fb-${playerId}" style="display:none"><div style="font-size:10px;color:var(--dim);margin-bottom:8px">Stream unavailable</div><a class="cam-link" href="${url}" target="_blank">▶ Open Stream</a></div></div>`;
  } else {
    const imgId = 'tc-img-' + Math.random().toString(36).slice(2, 8);
    vidHTML = `<div class="cam-vid-wrap" style="width:320px;height:200px;overflow:hidden"><div class="vid-loading">📸 Loading...</div><img id="${imgId}" src="${url}" style="width:100%;height:100%;object-fit:cover" onload="this.previousElementSibling.style.display='none'" onerror="this.style.display='none';this.parentElement.querySelector('.vid-fallback2').style.display='flex'" /><div class="vid-fallback2" style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;flex-direction:column;gap:6px;background:rgba(5,12,16,0.9)"><a class="cam-link" href="${url}" target="_blank">▶ Open Stream</a></div></div>`;
    // Auto-refresh image every 10 seconds
    setTimeout(() => {
      const img = document.getElementById(imgId);
      if (img) setInterval(() => { (img as HTMLImageElement).src = '${url}?t=' + Date.now(); }, 10000);
    }, 100);
  }

  const m = L.marker([lat, lon], {
    icon: L.divIcon({
      className: '',
      html: '<div style="font-size:14px;filter:drop-shadow(0 0 3px #ffaa00)">🚦</div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    }),
  });

  const popup = L.popup({ maxWidth: 360, minWidth: 300 })
    .setContent(`<b>🚦 ${desc}</b><br><span style="font-size:9px;color:var(--dim)">${state} · ${format}</span>${vidHTML}`);

  m.bindPopup(popup);
  
  // Init HLS player on popup open
  if (isVideo) {
    m.on('popupopen', () => {
      let tries = 0;
      const maxTries = 20;
      const tryInit = () => {
        const video = document.getElementById(playerId) as HTMLVideoElement;
        const loading = document.getElementById('vid-load-' + playerId);
        const fallback = document.getElementById('vid-fb-' + playerId);
        if (!video) { if (++tries < maxTries) requestAnimationFrame(tryInit); return; }
        
        const showFallback = () => {
          if (loading) loading.style.display = 'none';
          if (video) video.style.display = 'none';
          if (fallback) fallback.style.display = 'flex';
        };

        if (Hls.isSupported()) {
          try {
            const hls = new Hls({ 
              maxBufferLength: 5,
              maxLoadingDelay: 4,
              manifestLoadingTimeOut: 8000,
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              if (loading) loading.style.display = 'none';
              video.play().catch(() => {});
            });
            hls.on(Hls.Events.ERROR, () => showFallback());
            (m as any)._hls = hls;
          } catch { showFallback(); }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.addEventListener('loadedmetadata', () => { if (loading) loading.style.display = 'none'; });
          video.addEventListener('error', () => showFallback());
          video.play().catch(() => {});
          setTimeout(() => { if (video.readyState === 0) showFallback(); }, 5000);
        } else {
          showFallback();
        }
      };
      requestAnimationFrame(tryInit);
    });
    m.on('popupclose', () => {
      const hls = (m as any)._hls;
      if (hls) { hls.destroy(); (m as any)._hls = null; }
    });
  }

  return m;
}

export function clearMarkers(group: L.LayerGroup | L.MarkerClusterGroup) {
  if ('clearLayers' in group) {
    (group as L.MarkerClusterGroup).clearLayers();
  } else {
    (group as L.LayerGroup).clearLayers();
  }
}
