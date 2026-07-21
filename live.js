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

function isTikTokUrl(url) {
    try {
        return new URL(url).hostname.includes('tiktok.com');
    } catch {
        return false;
    }
}

function buildLiveButtons(liveUrl) {
    return `
        <div class="live-actions">
            <a href="${liveUrl}" target="_blank" rel="noreferrer" class="btn-live">
                ${t.watchLive}
            </a>
            <a href="https://www.tiktok.com/@prokhanesagnsevip" target="_blank" rel="noreferrer" class="btn-live btn-live-secondary">
                ${t.tiktokVideos}
            </a>
        </div>
    `;
}

function renderLive(data) {
    if (!container) return;

    if (data.statut === 'on' || data.statut === 'online') {
        const liveUrl = data.lien || 'https://www.tiktok.com';
        const liveContent = isTikTokUrl(liveUrl)
            ? buildLiveButtons(liveUrl)
            : `
                <iframe
                    src="${liveUrl}"
                    title="Live Porokhane Sagnse VIP"
                    allowfullscreen>
                </iframe>
                ${buildLiveButtons(liveUrl)}
              `;

        container.innerHTML = `
            <div class="live-online">
                <span class="badge-live">${t.liveActive}</span>
                ${liveContent}
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

Promise.all([
    fetch('/api/public/live').then(response => response.json()),
    fetch('/api/public/events').then(response => response.json())
])
    .then(([liveData, events]) => {
        renderLive(liveData);
        const grid = document.getElementById('announcement-grid');
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
