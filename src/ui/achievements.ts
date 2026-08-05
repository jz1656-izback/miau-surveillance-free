import { toast } from './toast';

interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  condition: () => boolean;
  awarded: boolean;
  awardedAt?: number;
}

const achievements: Achievement[] = [];

interface SavedAchievement { id: string; awardedAt: number; }

export function loadAchievements(): SavedAchievement[] {
  const stored = JSON.parse(localStorage.getItem('miau-achievements') || '[]');
  return stored;
}

export function saveAchievement(id: string) {
  const stored = loadAchievements();
  if (!stored.find(a => a.id === id)) {
    stored.push({ id, awardedAt: Date.now() });
    localStorage.setItem('miau-achievements', JSON.stringify(stored));
    toast('Achievement unlocked!', 3000);
  }
}

export function getAchievements(): Achievement[] {
  return [
    {
      id: 'first_watch', name: 'First Watch', desc: 'Opened a live camera feed',
      icon: '👁', condition: () => !!localStorage.getItem('miau-first-cam'), awarded: false,
    },
    {
      id: 'globe_trotter', name: 'Globe Trotter', desc: 'Viewed cameras on 3+ continents',
      icon: '🌍', condition: () => (JSON.parse(localStorage.getItem('miau-continents') || '[]') as string[]).length >= 3, awarded: false,
    },
    {
      id: 'night_owl', name: 'Night Owl', desc: 'Used surveillance past 2am',
      icon: '🦉', condition: () => new Date().getHours() < 5 && new Date().getHours() >= 0, awarded: false,
    },
    {
      id: 'katastrophenschutz', name: 'Katastrophenschutz', desc: 'German engineering — enabled all alert types',
      icon: '🇩🇪', condition: () => {
        const alerts = JSON.parse(localStorage.getItem('miau-alerts') || '[]');
        return alerts.length >= 5 && alerts.every((a: any) => a.enabled);
      }, awarded: false,
    },
    {
      id: 'commander', name: 'Commander', desc: 'Used the terminal 10+ times',
      icon: '⌨️', condition: () => (parseInt(localStorage.getItem('miau-terminal-uses') || '0')) >= 10, awarded: false,
    },
    {
      id: 'grid_master', name: 'Grid Master', desc: 'Used all 3 grid sizes',
      icon: '🖥', condition: () => {
        const sizes = JSON.parse(localStorage.getItem('miau-grid-sizes') || '[]');
        return sizes.includes(4) && sizes.includes(9) && sizes.includes(16);
      }, awarded: false,
    },
  ];
}

export function trackAction(action: string, value?: string) {
  if (action === 'open-camera') { localStorage.setItem('miau-first-cam', 'true'); }
  if (action === 'continent') {
    const continents = JSON.parse(localStorage.getItem('miau-continents') || '[]');
    if (value && !continents.includes(value)) { continents.push(value); localStorage.setItem('miau-continents', JSON.stringify(continents)); }
  }
  if (action === 'terminal') {
    const uses = parseInt(localStorage.getItem('miau-terminal-uses') || '0') + 1;
    localStorage.setItem('miau-terminal-uses', String(uses));
  }
  if (action === 'grid-size') {
    const sizes = JSON.parse(localStorage.getItem('miau-grid-sizes') || '[]');
    if (value && !sizes.includes(parseInt(value))) { sizes.push(parseInt(value)); localStorage.setItem('miau-grid-sizes', JSON.stringify(sizes)); }
  }

  // Check achievements
  getAchievements().forEach(a => {
    if (!loadAchievements().find(s => s.id === a.id) && a.condition()) {
      saveAchievement(a.id);
    }
  });
}
