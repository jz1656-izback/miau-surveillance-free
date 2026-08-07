import { toast } from './toast';

const FACTS = [
  'Cats have 32 ear muscles — perfect for surveillance',
  'A cat can hear 5x better than a human',
  'Cats see in the dark — born for night surveillance',
  'A cat whiskers detect the slightest vibration',
  'Cats sleep 16h/day — the rest is surveillance',
  'In Germany, cats must have access to outdoor surveillance',
  'A cat can run 48 km/h — faster than most prey',
  'Cats have a 200-degree field of vision',
  'The CIA tried to train cats as spies in the 1960s',
  'A cat purr is at 25-150 Hz — the healing frequency',
];

export function initCatMascot() {
  const cat = document.getElementById('cat-mascot');
  if (!cat) return;
  const faces = ['😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];
  let idx = 0;
  setInterval(() => { cat.textContent = faces[idx++ % faces.length]!; }, 3000);
  cat.addEventListener('click', () => {
    toast('🐱 ' + FACTS[Math.floor(Math.random() * FACTS.length)]!, 4000);
  });
}
