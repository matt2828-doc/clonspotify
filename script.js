// ---------------- Utilidades Spotify ----------------
function buildSpotifyEmbedSrc(value) {
  if (typeof value === 'string' && value.includes('open.spotify.com')) {
    const clean = value.split('?')[0];
    const m = clean.match(/open\.spotify\.com\/(track|playlist|album|artist)\/([A-Za-z0-9]+)$/);
    if (m) return `https://open.spotify.com/embed/${m[1]}/${m[2]}`;
    return clean.replace('open.spotify.com/', 'open.spotify.com/embed/');
  }
  const map = { 'pl:': 'playlist', 'al:': 'album', 'ar:': 'artist' };
  const pref = Object.keys(map).find(k => value.startsWith(k));
  const id = pref ? value.replace(pref, '') : value;
  const type = pref ? map[pref] : 'track';
  return `https://open.spotify.com/embed/${type}/${id}`;
}

function toSpotifyUrl(val) {
  if (val.includes('open.spotify.com')) return val.split('?')[0];
  const map = { 'pl:': 'playlist', 'al:': 'album', 'ar:': 'artist' };
  const pref = Object.keys(map).find(k => val.startsWith(k));
  const id = pref ? val.replace(pref, '') : val;
  const entity = pref ? map[pref] : 'track';
  return `https://open.spotify.com/${entity}/${id}`;
}

function getEntityFromValue(val) {
  if (val.includes('open.spotify.com')) {
    const clean = val.split('?')[0];
    const m = clean.match(/open\.spotify\.com\/(track|playlist|album|artist)\/[A-Za-z0-9]+$/);
    if (m) return m[1]; // 'track' | 'playlist' | 'album' | 'artist'
    return 'track';
  }
  const map = { 'pl:': 'playlist', 'al:': 'album', 'ar:': 'artist' };
  const pref = Object.keys(map).find(k => val.startsWith(k));
  return pref ? map[pref] : 'track';
}

function humanizeEntity(entity) {
  switch (entity) {
    case 'playlist': return 'Playlist';
    case 'album':    return 'Álbum';
    case 'artist':   return 'Artista';
    default:         return 'Canción';
  }
}

// ---------------- Player embed ----------------
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('[data-spotify]');
  const playerBar = document.getElementById('playerBar');
  const iframe = document.getElementById('spotifyFrame');
  const closeBtn = document.getElementById('closePlayer');

  items.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const val = el.getAttribute('data-spotify');
      const src = buildSpotifyEmbedSrc(val);
      iframe.src = src;
      playerBar.classList.remove('hidden');
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  });

  closeBtn?.addEventListener('click', () => {
    iframe.src = '';
    playerBar.classList.add('hidden');
  });

  // ---------------- Spinners para imágenes ----------------
  const imgs = document.querySelectorAll('img[data-cover], img[data-spinner]');
  imgs.forEach(attachSpinnerTo);

  // Rellena carátulas/títulos y tipo dinámico
  fillCoversFromSpotify();
});

// Crea overlay spinner y lo elimina al cargar la imagen
function attachSpinnerTo(img) {
  const parent = img.closest('.relative') || img.parentElement;
  if (!parent) return;
  parent.classList.add('relative');

  img.classList.add('opacity-0', 'transition-opacity', 'duration-300');

  const overlay = document.createElement('div');
  overlay.setAttribute('data-spinner-overlay', '');
  overlay.className = 'absolute inset-0 grid place-content-center bg-black/20 rounded-lg';
  overlay.innerHTML = `
    <svg class="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  `;
  parent.appendChild(overlay);

  const done = () => {
    img.classList.remove('opacity-0');
    overlay.remove();
  };

  if (img.complete && img.naturalWidth) {
    requestAnimationFrame(done);
  } else {
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', () => overlay.remove(), { once: true });
  }
}

// ---------------- oEmbed carátulas/títulos + tipo ----------------
async function fillCoversFromSpotify() {
  const cards = document.querySelectorAll('[data-spotify]');
  for (const el of cards) {
    const val = el.getAttribute('data-spotify');
    const entity = getEntityFromValue(val);           // 'track' | 'playlist' | 'album' | 'artist'
    const url = toSpotifyUrl(val);

    // Setea tipo legible si hay data-kind
    const kindEl = el.querySelector('[data-kind]');
    if (kindEl) kindEl.textContent = humanizeEntity(entity);

    // Completa cover y título si hay data-cover / data-title
    const img = el.querySelector('[data-cover]');
    const titleEl = el.querySelector('[data-title]');
    if (!img && !titleEl) continue;

    try {
      const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
      if (!res.ok) continue;
      const data = await res.json();
      if (img && data.thumbnail_url) img.src = data.thumbnail_url;
      if (titleEl && data.title) titleEl.textContent = data.title;
      // El spinner se quita en 'load' (attachSpinnerTo)
    } catch (_) {
      // Silencioso
    }
  }
}

// ---- Helpers Spotify
function buildSpotifyEmbedSrc(value) {
  if (typeof value === 'string' && value.includes('open.spotify.com')) {
    const clean = value.split('?')[0];
    const m = clean.match(/open\.spotify\.com\/(track|playlist|album|artist)\/([A-Za-z0-9]+)$/);
    if (m) return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&autoplay=1`;
    return clean.replace('open.spotify.com/', 'open.spotify.com/embed/') + '?autoplay=1';
  }
  const map = { 'pl:': 'playlist', 'al:': 'album', 'ar:': 'artist' };
  const pref = Object.keys(map).find(k => value.startsWith(k));
  const id = pref ? value.replace(pref, '') : value;
  const type = pref ? map[pref] : 'track';
  return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&autoplay=1`;
}
function toSpotifyUrl(val) {
  if (val.includes('open.spotify.com')) return val.split('?')[0];
  const map = { 'pl:': 'playlist', 'al:': 'album', 'ar:': 'artist' };
  const pref = Object.keys(map).find(k => val.startsWith(k));
  const id = pref ? val.replace(pref, '') : val;
  const entity = pref ? map[pref] : 'track';
  return `https://open.spotify.com/${entity}/${id}`;
}
function getEntityFromValue(val) {
  if (val.includes('open.spotify.com')) {
    const clean = val.split('?')[0];
    const m = clean.match(/open\.spotify\.com\/(track|playlist|album|artist)\/[A-Za-z0-9]+$/);
    if (m) return m[1];
    return 'track';
  }
  const map = { 'pl:': 'playlist', 'al:': 'album', 'ar:': 'artist' };
  const pref = Object.keys(map).find(k => val.startsWith(k));
  return pref ? map[pref] : 'track';
}
function extractId(val) {
  const m = val.match(/open\.spotify\.com\/(?:track|playlist|album|artist)\/([A-Za-z0-9]+)/);
  if (m) return m[1];
  return val.replace(/^pl:|^al:|^ar:/, '');
}

// ---- Estado cola
let PLAYABLES = [];
let CURRENT_INDEX = -1;
let IS_ADVANCING = false;

// Track “starter” por artista (puedes editar estos IDs si prefieres otras canciones)
const ARTIST_STARTER_TRACK = {
  '3TVXtAsR1Inumwj472S9r4': '6rXvMpWJbTyhSrVWye7jPE', // Drake
  '0EFisYRi20PTADoJrifHuz': '559YUIWxUc8Mx4lsla13Ff', // Arcangel
  '4q3ewBCX7sLwd24euuV69X': '6habFhsOp2NvshLv26DqMb', // Bad Bunny
  '0EmeFodog0BfCgMzAIvKQp': '20pJKlNIU3J1CrvhBr1kQ8', // Shakira
  '6qqNVTkY8uBg9cP3Jd7DAH': '1IHWl5LamUGEuP4ozKQSXZ', // Billie Eilish
  '1Xyo4u8uXC1ZmMpatF05PJ': '0TUW9faHNaBmi89wsYGp9y'  // The Weeknd
};

// ---- Boot
(function initPlayerAddon(){
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init(){
    const items = document.querySelectorAll('[data-spotify]');
    if (!items.length) return; // si no hay nada marcado, no hacemos nada

    PLAYABLES = Array.from(items);

    // Clicks en cualquier tarjeta existente con data-spotify (sin cambiar su HTML)
    PLAYABLES.forEach(el => {
      el.addEventListener('click', (e) => {
        // Evita que un <a> navegue fuera, pero respeta si trae cmd/ctrl
        if (!(e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          playByElement(el);
        }
      });
    });

    // Botón cerrar (si existe el bloque añadido)
    document.getElementById('closePlayer')?.addEventListener('click', () => {
      const iframe = document.getElementById('spotifyFrame');
      const bar = document.getElementById('playerBar');
      if (iframe) iframe.src = '';
      bar?.classList.add('hidden');
    });

    // Limpiar recientes (si existe la sección)
    document.getElementById('clearRecent')?.addEventListener('click', () => {
      localStorage.removeItem('recentTracks');
      renderRecent();
    });

    // Llenar recientes al inicio
    renderRecent();

    // Detectar término de canción para pasar a la siguiente
    window.addEventListener('message', onSpotifyMessage, false);
  }
})();

// ---- Reproducir
function playByElement(el) {
  const bar = document.getElementById('playerBar');
  const iframe = document.getElementById('spotifyFrame');
  if (!iframe || !bar) return;

  let val = el.getAttribute('data-spotify') || '';
  const entity = getEntityFromValue(val);

  // Si es artista: usa un track mapeado para reproducir al click
  if (entity === 'artist') {
    const artistId = extractId(val);
    const starter = ARTIST_STARTER_TRACK[artistId];
    if (starter) val = starter;
  }

  iframe.src = buildSpotifyEmbedSrc(val);
  bar.classList.remove('hidden');

  CURRENT_INDEX = PLAYABLES.indexOf(el);
  pushToRecent(el);

  // scroll opcional al player
  try { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); } catch(_) {}
}

function playNext() {
  if (IS_ADVANCING || !PLAYABLES.length) return;
  IS_ADVANCING = true;
  const nextIndex = (CURRENT_INDEX + 1) % PLAYABLES.length;
  const nextEl = PLAYABLES[nextIndex];
  setTimeout(() => {
    IS_ADVANCING = false;
    playByElement(nextEl);
  }, 120);
}

// ---- Mensajes del iframe
function onSpotifyMessage(event) {
  const ok = typeof event.origin === 'string' && event.origin.includes('open.spotify.com');
  if (!ok) return;
  const data = event.data;
  if (!data || (data.type !== 'playback_update' && data.type !== 'ready')) return;

  if (data.type === 'playback_update' && data.data) {
    const pos = Number(data.data.position || data.data.progressMs || 0);
    const dur = Number(data.data.duration || data.data.durationMs || 0);
    const paused = !!data.data.isPaused;
    if (dur > 0 && pos >= dur - 500 && !paused) {
      playNext();
    }
  }
}

// ---- Recientes (usa localStorage si #recentList existe)
function pushToRecent(el) {
  const val = el.getAttribute('data-spotify') || '';
  const entity = getEntityFromValue(val);
  const idOriginal = extractId(val);

  // Normaliza: si es artista, usa el track "starter"
  let id = idOriginal;
  if (entity === 'artist' && ARTIST_STARTER_TRACK[idOriginal]) {
    id = ARTIST_STARTER_TRACK[idOriginal];
  }

  // Título e imagen (si existen en la tarjeta)
  const titleEl = el.querySelector('[data-title]');
  const title = (titleEl?.textContent || el.textContent || 'Reproducción').trim();

  let cover = '';
  const img = el.querySelector('[data-cover], img');
  if (img?.getAttribute('src')) cover = img.getAttribute('src');

  const key = 'recentTracks';
  const prev = JSON.parse(localStorage.getItem(key) || '[]');

  // ✅ Si el primer elemento ya es el mismo track, no hagas nada (evita "repetir")
  if (prev.length && prev[0].id === id) {
    return;
  }

  // Elimina cualquier aparición previa del mismo id y súbelo al tope
  const filtered = prev.filter(x => x.id !== id);
  filtered.unshift({ id, title, url: toSpotifyUrl(id), cover });

  // Seguridad extra: dedup por ID por si algo raro quedó en el storage
  const seen = new Set();
  const deduped = [];
  for (const it of filtered) {
    if (!seen.has(it.id)) {
      seen.add(it.id);
      deduped.push(it);
    }
  }

  localStorage.setItem(key, JSON.stringify(deduped.slice(0, 12)));
  renderRecent();
}

function renderRecent() {
  const ul = document.getElementById('recentList');
  if (!ul) return; // no rompe nada si no existe

  const items = JSON.parse(localStorage.getItem('recentTracks') || '[]');
  ul.innerHTML = '';
  if (!items.length) {
    const li = document.createElement('li');
    li.className = 'text-xs text-app-mute';
    li.textContent = 'Aún no hay reproducciones.';
    ul.appendChild(li);
    return;
  }

  for (const it of items) {
    const li = document.createElement('li');
    li.className = 'flex items-center gap-3 p-2 rounded-lg hover:bg-app-cardHover cursor-pointer';
    li.setAttribute('data-spotify', it.id);

    const img = document.createElement('img');
    img.className = 'w-10 h-10 rounded object-cover';
    img.alt = 'cover';
    if (it.cover) img.src = it.cover;

    const info = document.createElement('div');
    info.innerHTML = `
      <p class="text-sm line-clamp-1">${it.title || 'Reproducción'}</p>
      <p class="text-xs text-app-mute">Reciente</p>
    `;

    li.appendChild(img);
    li.appendChild(info);
    li.addEventListener('click', (e) => {
      e.preventDefault();
      playByElement(li);
    });

    ul.appendChild(li);
  }
}