const container = document.getElementById('live-container');

const liveLocales = {
    fr: {
        liveActive: 'EN DIRECT',
        watchLive: 'Regarder le live',
        noLive: 'Aucun live en cours',
        loadingError: 'Impossible de charger les donnees du live.',
        tiktokVideos: 'Voir nos videos TikTok',
        recentPosts: 'Publications recentes'
    },
    wo: {
        liveActive: 'LIVE',
        watchLive: 'Gis live bi',
        noLive: 'Amul live léegi',
        loadingError: 'Mënul a jël xibaar yu live bi.',
        tiktokVideos: 'Xool sunu TikTok videos yi',
        recentPosts: 'Yeneen xibaar yu bees'
    }
};

function getLocale() {
    return localStorage.getItem('porokhane-lang') || 'fr';
}

const t = liveLocales[getLocale()] || liveLocales.fr;

function renderLive(data) {
    if (!container) return;

    if (data.statut === 'on' || data.statut === 'online') {
        container.innerHTML = `
            <div class="live-online">
                <span class="badge-live">${t.liveActive}</span>
                <iframe
                    src="${data.lien}"
                    title="Live Porokhane Sagnse VIP"
                    allowfullscreen>
                </iframe>
                <a href="${data.lien}"
                   target="_blank"
                   rel="noreferrer"
                   class="btn-live">
                    ${t.watchLive}
                </a>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="live-offline">
                <h3>${data.titre || 'Aucun live en cours'}</h3>
                <p>${data.message || 'Notre prochain live sera annonce sur WhatsApp, TikTok et Facebook.'}</p>
                <a href="${data.lien || 'https://www.tiktok.com/@prokhanesagnsevip?is_from_webapp=1&sender_device=pc'}"
                   target="_blank"
                   rel="noreferrer"
                   class="btn-live">
                   ${t.tiktokVideos}
                </a>
            </div>
        `;
    }
}

function renderEvents(events) {
    const grid = document.getElementById('announcement-grid');
    const track = document.getElementById('events-track');

    if (grid) {
        grid.innerHTML = events.map(event => `
            <article class="announcement-card">
                <span class="announcement-tag">${event.accent}</span>
                <strong>${event.titre}</strong>
                <p>${event.description}</p>
                <span class="announcement-meta">${event.date}</span>
            </article>
        `).join('');
    }

    if (track) {
        track.innerHTML = events.map(event => `
            <article class="event-card">
                <img src="img/logo.jpeg" alt="${event.titre}">
                <span class="announcement-tag">${event.accent}</span>
                <h3>${event.titre}</h3>
                <p>${event.description}</p>
                <span class="announcement-meta">${event.date}</span>
            </article>
        `).join('');
    }
}

function initEventCarousel() {
    const viewport = document.getElementById('events-viewport');
    const track = document.getElementById('events-track');
    const prev = document.querySelector('.events-btn.prev');
    const next = document.querySelector('.events-btn.next');

    if (!viewport || !track || !prev || !next) return;

    const originalCards = Array.from(track.children);
    if (!originalCards.length) return;
    originalCards.forEach(card => track.appendChild(card.cloneNode(true)));

    let loopWidth = track.scrollWidth / 2;
    const recompute = () => { loopWidth = track.scrollWidth / 2; };
    window.addEventListener('resize', recompute);
    window.addEventListener('load', recompute);

    const PIXELS_PER_MS = 0.05;
    let x = 0;
    let isPaused = false;
    let rafId = null;
    let lastTime = null;
    let pauseTimeout = null;

    function stepRAF(timestamp) {
        if (lastTime === null) lastTime = timestamp;
        const dt = timestamp - lastTime;
        lastTime = timestamp;

        if (!isPaused) {
            x += dt * PIXELS_PER_MS;
            if (x >= loopWidth) x -= loopWidth;
            track.style.transform = `translateX(-${x}px)`;
        }

        rafId = requestAnimationFrame(stepRAF);
    }

    function start() {
        if (rafId) cancelAnimationFrame(rafId);
        lastTime = null;
        rafId = requestAnimationFrame(stepRAF);
    }

    function pauseTemporarily() {
        isPaused = true;
        if (pauseTimeout) clearTimeout(pauseTimeout);
        pauseTimeout = setTimeout(() => { isPaused = false; }, 1200);
    }

    function move(direction) {
        pauseTemporarily();
        x += direction * 320;
        if (x < 0) x += loopWidth;
        if (x >= loopWidth) x -= loopWidth;
        track.style.transform = `translateX(-${x}px)`;
    }

    prev.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    viewport.addEventListener('mouseenter', () => { isPaused = true; });
    viewport.addEventListener('mouseleave', () => { isPaused = false; });
    viewport.addEventListener('focusin', () => { isPaused = true; });
    viewport.addEventListener('focusout', () => { isPaused = false; });
    viewport.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') move(-1);
        if (event.key === 'ArrowRight') move(1);
    });

    start();
}

Promise.all([
    fetch('/api/public/live').then(response => response.json()),
    fetch('/api/public/events').then(response => response.json())
])
    .then(([liveData, events]) => {
        renderLive(liveData);
        renderEvents(events);
        initEventCarousel();
    })
    .catch((err) => {
        console.error('Erreur live API', err);
        if (!container) return;
        container.innerHTML = `
            <div class="live-offline">
                <h3>${t.noLive}</h3>
                <p>${t.loadingError}</p>
            </div>
        `;
    });
