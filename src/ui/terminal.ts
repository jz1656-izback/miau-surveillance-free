import { flyTo, toggleWindyMode, toggleSingleWindyLayer, removeWindyOverlay } from '../map/core';
import { showOnlyLayer, showAllLayers } from '../map/layers';
import { cycleTheme, setTheme } from '../utils/theme';
import { toast } from './toast';
import { addCustomCamera, getCustomCameras, exportCameras, importCameras } from './custom-cameras';

const COMMANDS: Record<string, { help: string; fn: (args: string[]) => string | void }> = {
  help: {
    help: 'Show available commands',
    fn: () => Object.entries(COMMANDS).map(([k, v]) => `  ${k.padEnd(16)} ${v.help}`).join('\n'),
  },
  status: {
    help: 'Show system status',
    fn: () => {
      const els = {
        cameras: document.getElementById('camc')?.textContent || '0',
        conflicts: document.getElementById('cc')?.textContent || '0',
        flights: document.getElementById('cf')?.textContent || '0',
        quakes: document.getElementById('cq')?.textContent || '0',
      };
      return `Cameras: ${els.cameras} | Conflicts: ${els.conflicts} | Flights: ${els.flights} | Quakes: ${els.quakes}`;
    },
  },
  theme: {
    help: 'Switch theme (crt/dark/matrix)',
    fn: (args) => {
      const t = args[0];
      if (t === 'crt' || t === 'dark' || t === 'matrix') {
        setTheme(t);
        return `Theme set to ${t}`;
      }
      cycleTheme();
      return 'Theme cycled';
    },
  },
  go: {
    help: 'Fly to location (e.g. go tokyo)',
    fn: (args) => {
      const q = args.join(' ').toLowerCase();
      if (q.includes('tokyo')) { flyTo(35.68, 139.76, 12); return 'Flying to Tokyo'; }
      if (q.includes('new york') || q.includes('nyc')) { flyTo(40.71, -74.01, 12); return 'Flying to New York'; }
      if (q.includes('london')) { flyTo(51.51, -0.13, 12); return 'Flying to London'; }
      if (q.includes('dubai')) { flyTo(25.2, 55.27, 12); return 'Flying to Dubai'; }
      if (q.includes('paris')) { flyTo(48.86, 2.35, 12); return 'Flying to Paris'; }
      if (q.includes('sydney')) { flyTo(-33.87, 151.21, 12); return 'Flying to Sydney'; }
      if (q.includes('moscow')) { flyTo(55.75, 37.62, 12); return 'Flying to Moscow'; }
      return `Unknown location: ${q}. Try: tokyo, london, dubai, paris, sydney, moscow, new york`;
    },
  },
  show: {
    help: 'Show layer (cameras, flights, quakes, all)',
    fn: (args) => {
      const layer = args[0]?.toLowerCase();
      if (layer === 'all') { showAllLayers(); return 'Showing all layers'; }
      if (layer === 'cameras' || layer === 'cctv') { showOnlyLayer('camera'); return 'Showing CCTV'; }
      if (layer === 'flights') { showOnlyLayer('flight'); return 'Showing flights'; }
      if (layer === 'quakes' || layer === 'earthquakes') { showOnlyLayer('quake'); return 'Showing quakes'; }
      if (layer === 'fires' || layer === 'wildfires') { showOnlyLayer('wildfire'); return 'Showing wildfires'; }
      if (layer === 'conflicts') { showOnlyLayer('conflict'); return 'Showing conflicts'; }
      return `Unknown layer. Try: cameras, flights, quakes, fires, conflicts, all`;
    },
  },
  alert: {
    help: 'Set alert (e.g. alert quake 5)',
    fn: (args) => {
      return `Alert system: use the Alerts panel (bell icon) to configure push notifications`;
    },
  },

  windy: {
    help: "windy on|off|<layer> — Weather overlay (wind/temp/precip/clouds/pressure)",
    fn: (args) => {
      if (args[0] === "on" || args[0] === undefined || args[0] === "") { toggleWindyMode(); return "Windy mode toggled"; }
      if (args[0] === "off") { removeWindyOverlay(); return "Windy mode off"; }
      const valid = ["wind","temp","precip","clouds","pressure"];
      if (valid.includes(args[0]!)) { toggleSingleWindyLayer(args[0] as any); return "Windy layer: " + args[0]; }
      return "Usage: windy [on|off|wind|temp|precip|clouds|pressure]";
    },
  },
  cam: {
    help: "cam add <name> <lat> <lon> <url> [yt_id] | cam list | cam export",
    fn: (args) => {
      if (args[0] === "list") {
        const cams = getCustomCameras();
        if (cams.length === 0) return "No custom cameras. Add: cam add <name> <lat> <lon> <url>";
        return cams.map((c, i) => "  [" + i + "] " + c.n + " (" + c.la + ", " + c.lo + ") - " + c.u).join("\n");
      }
      if (args[0] === "export") { navigator.clipboard.writeText(exportCameras()); return "Copied!"; }
      if (args[0] === "add" && args.length >= 5) {
        addCustomCamera({ n: args[1]!, la: +args[2]!, lo: +args[3]!, t: "city", u: args[4]!, c: "Custom", vid: args[5] });
        return "Camera '" + args[1] + "' added!";
      }
      return "Usage: cam add <name> <lat> <lon> <url> [yt_id] | cam list | cam export";
    },
  },
  clear: {
    help: 'Clear terminal',
    fn: () => { return '__CLEAR__'; },
  },
  cat: {
    help: 'Display a cat',
    fn: () => {
      const cats = [
        '  /\\_/\\  \n ( o.o ) \n  > ^ <  \n Miau!',
        '  |\\__/,|   (`\\\n  |o o  |__ _) )\n _.( T   )  `  /\n((_ `^--\' /_<  \\\n`` `-((\'  - ((__/',
        '   |\\      _,,,---,,_\n   /,`.-\'`\'    -.  ;-;;,_\n  |,4-  ) )-,_..;\\ (  `\'-\'\n \'---\'\'(_/--\'  `-\'\\_)',
        '╱|、\n(˚ˎ 。7  \n |、˜〵  \n じしˍ,)ノ  Miau~',
      ];
      return cats[Math.floor(Math.random() * cats.length)]!;
    },
  },
  exit: {
    help: 'Close terminal',
    fn: () => { closeTerminal(); return ''; },
  },
};

let terminalOpen = false;

export function toggleTerminal() {
  terminalOpen = !terminalOpen;
  const el = document.getElementById('terminal-overlay')!;
  if (terminalOpen) {
    el.classList.add('show');
    setTimeout(() => (document.getElementById('term-input') as HTMLInputElement)?.focus(), 100);
  } else {
    el.classList.remove('show');
  }
}

export function closeTerminal() {
  terminalOpen = false;
  document.getElementById('terminal-overlay')!.classList.remove('show');
}

export function initTerminal() {
  const input = document.getElementById('term-input') as HTMLInputElement;
  const output = document.getElementById('term-output')!;

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim();
      if (!cmd) return;
      output.innerHTML += `<div><span style="color:#0f0">miau@surveillance:~$</span> ${cmd}</div>`;
      input.value = '';

      const parts = cmd.split(/\s+/);
      const name = parts[0]!.toLowerCase();
      const args = parts.slice(1);

      if (COMMANDS[name]) {
        const result = COMMANDS[name]!.fn(args);
        if (result === '__CLEAR__') {
          output.innerHTML = '';
        } else if (result) {
          output.innerHTML += `<div style="color:#0c0;white-space:pre-wrap">${result}</div>`;
        }
      } else {
        output.innerHTML += `<div style="color:#f66">Unknown command: ${name}. Type "help" for commands.</div>`;
      }
      output.scrollTop = output.scrollHeight;
    }
    if (e.key === 'Escape') closeTerminal();
  });

  document.getElementById('terminal-btn')?.addEventListener('click', () => toggleTerminal());
}
