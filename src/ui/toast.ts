let toastTimer: ReturnType<typeof setTimeout> | null = null;

export function toast(msg: string, duration = 3000) {
  const el = document.getElementById('toast')!;
  el.textContent = msg;
  el.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}
