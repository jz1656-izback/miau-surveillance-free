import { CAMERAS, Camera } from '../data/cameras';
import { embedUrl as getEmbedUrl } from '../map/markers';
import { state } from '../store/state';

let gridMode = false;
let gridSize = 4; // 4, 9, or 16

export function toggleGrid() {
  gridMode = !gridMode;
  const overlay = document.getElementById('grid-overlay')!;
  if (gridMode) {
    renderGrid();
    overlay.classList.add('show');
  } else {
    overlay.classList.remove('show');
  }
}

export function setGridSize(size: number) {
  gridSize = size;
  if (gridMode) renderGrid();
}

function renderGrid() {
  const container = document.getElementById('grid-container')!;
  const favCams = state.favorites.length > 0
    ? CAMERAS.filter(c => state.favorites.includes(c.n))
    : CAMERAS.slice(0, gridSize);

  const cams = favCams.slice(0, gridSize);
  const cols = gridSize <= 4 ? 2 : 3;

  container.innerHTML = cams.map(c => {
    const eu = getEmbedUrl(c);
    const src = eu || c.u;
    return `<div class="grid-tile">
      <div class="grid-tile-hdr">📷 ${c.n} <span style="font-size:7px;color:rgba(130,150,180,0.3)">${c.c}</span></div>
      ${eu
        ? `<iframe src="${src}" allow="autoplay" allowfullscreen loading="lazy" class="grid-iframe"></iframe>`
        : `<div class="grid-tile-fallback"><div>📷</div><a href="${c.u}" target="_blank">Open ${c.n}</a></div>`
      }
    </div>`;
  }).join('');

  container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
}

export function initGrid() {
  // Grid buttons
  document.getElementById('grid-btn')?.addEventListener('click', () => toggleGrid());
  document.getElementById('grid-close')?.addEventListener('click', () => {
    gridMode = false;
    document.getElementById('grid-overlay')!.classList.remove('show');
  });

  // Size buttons
  ['grid-4', 'grid-9', 'grid-16'].forEach((id, i) => {
    document.getElementById(id)?.addEventListener('click', () => setGridSize([4, 9, 16][i]!));
  });
}
