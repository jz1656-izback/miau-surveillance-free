export function openModal(title: string, embedUrl: string | null, pageUrl: string) {
  const overlay = document.getElementById('vid-modal')!;
  const iframe = document.getElementById('modal-iframe') as HTMLIFrameElement;
  document.getElementById('modal-title')!.textContent = `📷 ${title}`;
  document.getElementById('modal-link')!.setAttribute('href', pageUrl);
  if (embedUrl) {
    iframe.style.display = 'block';
    iframe.src = embedUrl;
  } else {
    iframe.style.display = 'none';
  }
  overlay.classList.add('show');
}

export function closeModal(e?: MouseEvent) {
  if (e && e.target !== document.getElementById('vid-modal')) return;
  const overlay = document.getElementById('vid-modal')!;
  overlay.classList.remove('show');
  (document.getElementById('modal-iframe') as HTMLIFrameElement).src = '';
}

export function initModal() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.getElementById('vid-modal')?.classList.remove('show');
      (document.getElementById('modal-iframe') as HTMLIFrameElement).src = '';
    }
  });
}
