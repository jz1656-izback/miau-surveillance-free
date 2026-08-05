import { toast } from './toast';

let konamiCode = '';
const KONAMI = 'arrowuparrowuparrowdownarrowdownarrowleftrightarrowleftrightarrowba';
let miauCount = 0;
let lastMiauTime = 0;

export function initEasterEggs() {
  document.addEventListener('keydown', (e) => {
    konamiCode += e.key.toLowerCase().replace('arrow', 'arrow');
    if (konamiCode.length > 50) konamiCode = konamiCode.slice(-30);
    if (konamiCode.includes(KONAMI)) {
      konamiCode = '';
      triggerKonami();
    }

    // Miau counter
    if (e.key.toLowerCase() === 'm' || e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'u') {
      const now = Date.now();
      if (now - lastMiauTime < 2000) miauCount++;
      else miauCount = 1;
      lastMiauTime = now;
      if (miauCount >= 4) {
        miauCount = 0;
        triggerMiauStorm();
      }
    }
  });
}

function triggerKonami() {
  toast('Matrix mode activated. Wake up, Neo...', 3000);
  document.documentElement.style.setProperty('--scanlines', 'rgba(0,255,0,0.05)');
  document.body.style.animation = 'matrixRain 0.5s linear';
  setTimeout(() => {
    document.body.style.animation = '';
    document.documentElement.style.setProperty('--scanlines', 'rgba(0,200,100,0.012)');
  }, 3000);
}

function triggerMiauStorm() {
  const facts = [
    'Cats have 32 muscles in each ear',
    'A cat can jump 5x its own height',
    'Cats sleep 70% of their lives',
    'A group of cats is called a clowder',
    'Cats can rotate their ears 180 degrees',
    'The first cat in space was Félicette',
    'Cats walk like camels and giraffes',
    'A cat purrs at 25-150 Hz',
    'Cats have a third eyelid',
    'Cats cannot taste sweetness',
  ];
  toast(`Cat fact: ${facts[Math.floor(Math.random() * facts.length)]!}`, 4000);
}
