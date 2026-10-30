// UI+ diagnostics: Ctrl+Alt+Shift+D saves a snapshot of the parts of Claude's
// page UI+ hooks into (sidebar, session rail, usage popover) as
// ui-plus-diagnostics.html in Downloads, with a count of each selector UI+
// looks for. Nothing is sent anywhere.
(() => {
  const SELECTORS = [
    '.dframe-nav-scroll',
    '.dframe-nav-scroll > .dframe-recents-by-mode',
    '[data-row]',
    '[data-row-main-button]',
    '[data-row-main-button]:not([data-row-nav])',
    '.df-leading-slot',
    '[data-row-label="iconless"]',
    '.status-dot[data-kind]',
    '[data-attention]',
    '[role="status"][aria-label]',
    '[data-rail-context-summary]',
    'section [data-rail-context-summary]',
    '[data-cds="StackedMeter"]',
    '[data-cds="Popover"]',
    '[data-cds="Meter"]',
    'a[href="/settings/usage"]',
    '#ui-plus-widget, .up-settings, .up-context, [data-up-session]',
  ];
  const clean = (el) => {
    if (!el) return '';
    const copy = el.cloneNode(true);
    for (const n of [copy, ...copy.querySelectorAll('*')]) {
      n.removeAttribute('style');
      if (n.tagName === 'svg') n.innerHTML = '';
    }
    return copy.outerHTML;
  };
  function snapshot() {
    const counts = SELECTORS.map((s) => {
      let n; try { n = document.querySelectorAll(s).length; } catch { n = 'bad selector'; }
      return `${s}  =>  ${n}`;
    }).join('\n');
    const parts = [
      ['url', location.href],
      ['userAgent', navigator.userAgent],
      ['selector counts', counts],
      ['sidebar (.dframe-nav-scroll)', clean(document.querySelector('.dframe-nav-scroll'))],
      ['nav (fallback: first <nav>)', document.querySelector('.dframe-nav-scroll') ? '' : clean(document.querySelector('nav'))],
      ['session rail section', clean(document.querySelector('[data-rail-context-summary]')?.closest('section'))],
      ['all <section> heads', [...document.querySelectorAll('section')].map((s) => s.outerHTML.slice(0, 400)).join('\n\n')],
      ['status markers anywhere (with their row)', [...document.querySelectorAll('.status-dot, [data-kind="running"], [data-kind="unread"], [data-kind="awaiting"], [data-kind="ready"], [data-attention], [role="status"], [class*="animate-"], [aria-label*="nread" i], [aria-label*="eady" i], [aria-label*="aiting" i], [aria-label*="unning" i]')]
        .filter((el) => !el.closest('#ui-plus-widget'))
        .map((el) => {
          const row = el.closest('[data-row], li, a, button') ?? el.parentElement;
          return `IN SIDEBAR: ${!!el.closest('.dframe-nav-scroll')}\nMARKER: ${clean(el).slice(0, 400)}\nROW: ${clean(row).slice(0, 2500)}`;
        }).join('\n\n----\n\n')],
      ['session-like rows outside the sidebar', [...document.querySelectorAll('[data-row], [data-row-main-button], a[href*="/epitaxy/"], a[href*="/code/"]')]
        .filter((el) => !el.closest('.dframe-nav-scroll')).slice(0, 15).map((el) => clean(el).slice(0, 2500)).join('\n\n----\n\n')],
      ['main pane (first 30k chars)', clean(document.querySelector('main')).slice(0, 30000)],
      ['open popovers',[...document.querySelectorAll('[data-cds="Popover"], [role="dialog"]')].map(clean).join('\n\n')],
    ];
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const html = '<meta charset="utf-8"><title>UI+ diagnostics</title>' +
      parts.map(([h, b]) => `<h2>${esc(h)}</h2><pre style="white-space:pre-wrap">${esc(b)}</pre>`).join('');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = 'ui-plus-diagnostics.html';
    document.body.append(a); a.click(); a.remove();
  }
  addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.shiftKey && e.code === 'KeyD') { e.preventDefault(); snapshot(); }
  }, true);
})();
