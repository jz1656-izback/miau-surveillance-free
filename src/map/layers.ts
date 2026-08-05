import L from 'leaflet';
import 'leaflet.markercluster';
import { getMap } from './core';
import { state, notify } from '../store/state';

export interface LayerGroup {
  name: string;
  group: L.LayerGroup | L.MarkerClusterGroup;
  cluster: boolean;
}

export const layers: Map<string, LayerGroup> = new Map();

export function createLayer(name: string, cluster = false): LayerGroup {
  const map = getMap();
  const group = cluster
    ? L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cl) => {
          const count = cl.getChildCount();
          return L.divIcon({
            html: `<div style="background:rgba(0,200,100,0.85);color:#000;border-radius:50%;width:${Math.min(40, 20 + count)}px;height:${Math.min(40, 20 + count)}px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid #00c864;box-shadow:0 0 10px rgba(0,200,100,0.4)">${count}</div>`,
            className: '',
            iconSize: L.point(40, 40),
          });
        },
      })
    : L.layerGroup();

  const lg: LayerGroup = { name, group, cluster };
  layers.set(name, lg);

  if (state.visibleLayers.has(name)) {
    group.addTo(map);
  }

  return lg;
}

export function toggleLayer(name: string): boolean {
  const lg = layers.get(name);
  if (!lg) return false;

  const map = getMap();
  if (state.visibleLayers.has(name)) {
    map.removeLayer(lg.group);
    state.visibleLayers.delete(name);
  } else {
    map.addLayer(lg.group);
    state.visibleLayers.add(name);
  }
  notify();
  return state.visibleLayers.has(name);
}

export function showOnlyLayer(name: string) {
  const map = getMap();
  layers.forEach((lg) => {
    if (lg.name === name) {
      map.addLayer(lg.group);
      state.visibleLayers.add(name);
    } else {
      map.removeLayer(lg.group);
      state.visibleLayers.delete(lg.name);
    }
  });
  state.activeLayer = name;
  notify();
}

export function showAllLayers() {
  const map = getMap();
  layers.forEach((lg) => {
    map.addLayer(lg.group);
    state.visibleLayers.add(lg.name);
  });
  state.activeLayer = null;
  notify();
}

export function getLayerMarkerCount(name: string): number {
  const lg = layers.get(name);
  if (!lg) return 0;
  if ('getLayers' in lg.group) {
    return (lg.group as L.MarkerClusterGroup).getLayers().length;
  }
  return (lg.group as L.LayerGroup).getLayers().length;
}
