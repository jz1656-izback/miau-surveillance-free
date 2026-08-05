import { flyTo } from '../map/core';
import { showOnlyLayer } from '../map/layers';
import { toast } from './toast';

let listening = false;
let recognition: any = null;

export function initVoice() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    const text: string = event.results[0][0].transcript.toLowerCase().trim();
    handleCommand(text);
  };

  recognition.onerror = () => { listening = false; };
  recognition.onend = () => { listening = false; updateButton(); };
}

function handleCommand(text: string) {
  toast(`Voice: "${text}"`, 2000);

  if (text.includes('show') && text.includes('camera')) { showOnlyLayer('camera'); return; }
  if (text.includes('show') && text.includes('flight')) { showOnlyLayer('flight'); return; }
  if (text.includes('show') && text.includes('quake')) { showOnlyLayer('quake'); return; }
  if (text.includes('show') && text.includes('fire')) { showOnlyLayer('wildfire'); return; }
  if (text.includes('show all')) { showOnlyLayer(''); return; }

  if (text.includes('go to tokyo') || text.includes('tokyo')) { flyTo(35.68, 139.76, 12); return; }
  if (text.includes('new york') || text.includes('nyc')) { flyTo(40.71, -74.01, 12); return; }
  if (text.includes('london')) { flyTo(51.51, -0.13, 12); return; }
  if (text.includes('dubai')) { flyTo(25.2, 55.27, 12); return; }
  if (text.includes('paris')) { flyTo(48.86, 2.35, 12); return; }
  if (text.includes('sydney')) { flyTo(-33.87, 151.21, 12); return; }

  if (text.includes('refresh') || text.includes('reload')) { window.dispatchEvent(new CustomEvent('miau-refresh')); return; }
  if (text.includes('miau') || text.includes('meow') || text.includes('cat')) { toast('Miau!', 1500); return; }
}

export function toggleVoice() {
  if (!recognition) { toast('Voice not supported in this browser', 2000); return; }
  if (listening) {
    recognition.stop();
    listening = false;
  } else {
    recognition.start();
    listening = true;
    toast('Listening...', 1000);
  }
  updateButton();
}

function updateButton() {
  const btn = document.getElementById('voice-btn');
  if (btn) btn.textContent = listening ? '🎤' : '🔇';
}

export function isListening() { return listening; }
