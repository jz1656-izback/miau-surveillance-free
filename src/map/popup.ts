// Nice popup templates with cats
export function nicePopup(title: string, subtitle: string, body: string, icon = '📷', status?: string): string {
  const statusHTML = status ? `<span class="pp-status">${status}</span>` : '';
  return `<div class="nice-popup">
    <div class="pp-header">
      <span class="pp-icon">${icon}</span>
      <div>
        <div class="pp-title">${title}</div>
        <div class="pp-subtitle">${subtitle} ${statusHTML}</div>
      </div>
    </div>
    <div class="pp-body">${body}</div>
    <div class="pp-footer">🐱 Miau Surveillance</div>
  </div>`;
}

export function nicePopupMini(title: string, subtitle: string, icon = '📷'): string {
  return `<div class="nice-popup">
    <div class="pp-header">
      <span class="pp-icon">${icon}</span>
      <div>
        <div class="pp-title">${title}</div>
        <div class="pp-subtitle">${subtitle}</div>
      </div>
    </div>
    <div class="pp-footer">🐱 Miau watching</div>
  </div>`;
}
