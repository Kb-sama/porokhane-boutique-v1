let tousLesProduits = [];
let panier = JSON.parse(localStorage.getItem('porokhane-panier') || '[]');
let siteTextsCache = {};
const locales = {
    fr: {
        heroBadge: 'Boutique mode et accessoires',
        heroTitle: 'Des articles elegants pour chaque occasion',
        heroSubtitle: 'Decouvrez nos robes, sacs, chaussures et accessoires selectionnes pour leur qualite et leur style.',
        heroButton: 'Voir les produits',
        productsTitle: 'Produits populaires',
        productsSubtitle: 'Les produits les plus utiles pour la vitrine d accueil et la conversion rapide.',
        announcementBadge: 'Annonces et evenements',
        announcementTitle: 'Les contenus mis en avant',
        announcementText: 'Cette section regroupe les actualites utiles pour convertir plus vite: nouveautes, lives et offres.',
        liveTitle: 'Aucun live en cours',
        liveText: 'Revenez plus tard ou suivez-nous pour etre averti du prochain direct.',
        menuHome: 'Accueil',
        menuProducts: 'Produit',
        menuLive: 'Live',
        menuContact: 'Contact',
        langButton: 'Wolof',
    },
    wo: {
        heroBadge: 'Boutik moda ak akseswar',
        heroTitle: 'Am na ay artik yi rafet ci benn mbind',
        heroSubtitle: 'Xamlu ndax rok, sac, sapato ak akseswar yi nu tànn ci seen kalite ak seen style.',
        heroButton: 'Wonee produi yi',
        productsTitle: 'Produi yi gën a am solo',
        productsSubtitle: 'Produi yi ëpp solo ngir vitrine bi ak jàllale jaay bi gaaw.',
        announcementBadge: 'Xibaar ak event yi',
        announcementTitle: 'Xibaar yi gën a am solo',
        announcementText: 'Bii section dafay wone xibaar yi am solo: yeneen, live ak promo.',
        liveTitle: 'Kenn du live lii tax',
        liveText: 'Dellu waxtu weneen walla topp sunu page yi ngir xam lu bees am.',
        menuHome: 'Dal',
        menuProducts: 'Produi',
        menuLive: 'Live',
        menuContact: 'Jokkoo',
        langButton: 'Français',
    }
};

Object.assign(locales.fr, {
    brand_name: 'Porokhane Sagnse VIP',
    brand_logo_alt: 'Logo Porokhane Sagnse VIP',
    nav_home: 'Accueil',
    nav_products: 'Produit',
    nav_live: 'Live',
    nav_contact: 'Contact',
    hero_badge: 'Boutique mode et accessoires',
    hero_title: 'Des articles elegants pour chaque occasion',
    hero_subtitle: 'Decouvrez nos robes, sacs, chaussures et accessoires selectionnes pour leur qualite et leur style.',
    hero_button: 'Voir les produits',
    announcements_badge: 'Annonces',
    announcements_title: 'Les mises en avant importantes',
    announcements_text: 'Les annonces, evenements et offres utiles apparaissent ici pour orienter les visiteurs plus vite.',
    events_badge: 'Evenements',
    events_title: 'Fil d actualite boutique',
    events_text: 'Un carrousel fluide pour afficher les sujets les plus importants sans surcharger la page.',
    live_badge: 'Live',
    live_title: 'Aucun live en cours',
    live_text: 'Revenez plus tard ou suivez-nous pour etre averti du prochain direct.',
    live_offline_title: 'Le direct n a pas encore commence',
    live_offline_text: 'Quand le live sera actif, la video apparaitra ici.',
    stay_informed: 'Rester informe',
    follow_tiktok: 'Suivre sur TikTok',
    notify_whatsapp: 'Etre averti sur WhatsApp',
    join_whatsapp_group: 'Rejoindre le groupe WhatsApp',
    whatsapp_group_text: 'Recevez les nouveautes et les offres exclusives',
    address_text: 'Niogui HLM Grand Yoff, côté rond-point mairie bi.',
    see_map: 'Voir sur la carte',
        footer_text: '© 2026 Porokhane Sagnse VIP. Tous droits reserves.',
        privacy_policy: 'Politique de confidentialité',
    previous: 'Precedent',
    next: 'Suivant',
    whatsapp: 'WhatsApp',
    whatsapp_group: 'Groupe WhatsApp',
    order_success_prefix: 'Votre commande a ete envoyee avec succes.',
    order_success_followup: 'Nous vous contacterons rapidement au numero indique.',
    order_success_commercial: 'Votre commande est bien enregistree. Nous vous appelons rapidement pour confirmer les details et finaliser votre achat.',
    order_missing_panier: 'Votre panier est vide.',
    order_missing_wave: 'Televersez une preuve de paiement.',
    order_submit_error: 'Erreur lors de l envoi de la commande.',
    support_label: 'Besoin d aide rapide ?',
    support_text: 'Ecrivez-nous sur WhatsApp pour confirmer une taille, un stock ou un delai.',
    whatsapp_order_text: 'Commander maintenant',
    whatsapp_support_text: 'Besoin d aide ?'
});

Object.assign(locales.wo, {
    brand_name: 'Porokhane Sagnse VIP',
    brand_logo_alt: 'Logo Porokhane Sagnse VIP',
    nav_home: 'Dal',
    nav_products: 'Produi',
    nav_live: 'Live',
    nav_contact: 'Jokkoo',
    hero_badge: 'Boutik moda ak akseswar',
    hero_title: 'Am na ay artik yu rafet ci benn mbind',
    hero_subtitle: 'Xamlu ndax rok, sac, sapato ak akseswar yi nu tànn ci seen kalite ak seen style.',
    hero_button: 'Wonee produi yi',
    announcements_badge: 'Xibaar',
    announcements_title: 'Lu am solo yi',
    announcements_text: 'Xibaar yi, event yi ak promo yi dinañu feeñ fii ngir aji jaar yi gën a gaaw dox.',
    events_badge: 'Event yi',
    events_title: 'Xibaar bu boutique',
    events_text: 'Carrousel bu néew dëgër ngir wone sujéet yu am solo yi walla page bi mu du metti.',
    live_badge: 'Live',
    live_title: 'Amul live léegi',
    live_text: 'Dellu ci beneen waxtu walla topp sunu page yi ngir xam bu live bi ñëw.',
    live_offline_title: 'Live bi jotagul',
    live_offline_text: 'Bu live bi jàppé, video bi dina feeñ fii.',
    stay_informed: 'Wone sa xam-xam',
    follow_tiktok: 'Topp ci TikTok',
    notify_whatsapp: 'Xamal ma ci WhatsApp',
    join_whatsapp_group: 'Dugg ci groupe WhatsApp bi',
    whatsapp_group_text: 'Jot ay xibaar yu bees ak promo yi.',
    address_text: 'Niogui HLM Grand Yoff, ci wetu rond-point mairie bi.',
    see_map: 'Wonee ci carte bi',
        footer_text: '© 2026 Porokhane Sagnse VIP. Benn droit amul lu ëpp.',
        privacy_policy: 'Politique de confidentialité',
    previous: 'Ginnaaw',
    next: 'Gannaaw',
    whatsapp: 'WhatsApp',
    whatsapp_group: 'Groupe WhatsApp',
    order_success_prefix: 'Sa commande bi jomm naa ak success.',
    order_success_followup: 'Dinañu la woow ci numero bi nga joxe.',
    order_success_commercial: 'Sa commande bi denc naa. Dinañu la woow gaaw ngir valider details yi te soppi jëfandikoo bi.',
    order_missing_panier: 'Sa panier bi dafa féex.',
    order_missing_wave: 'Joxe preuve bi ci paiement.',
    order_submit_error: 'Am na njuumte ci yónnee commande bi.',
    support_label: 'Am na laaj bu gaaw ?',
    support_text: 'Bind nu ci WhatsApp ngir wone size, stock walla waxtu delivery.',
    whatsapp_order_text: 'Jox xaalis léegi',
    whatsapp_support_text: 'Laaj am naa ?'
});

function getLocale() {
    return localStorage.getItem('porokhane-lang') || 'fr';
}

function setLocale(lang) {
    localStorage.setItem('porokhane-lang', lang);
    applyLocale();
}

function applyLocale() {
    const lang = getLocale();
    const t = locales[lang] || locales.fr;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
        const key = el.getAttribute('data-i18n-alt');
        if (t[key]) el.setAttribute('alt', t[key]);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
        const key = el.getAttribute('data-i18n-aria-label');
        if (t[key]) el.setAttribute('aria-label', t[key]);
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
        const key = el.getAttribute('data-i18n-html');
        if (key === 'footer_text') {
            el.innerHTML = `${t.footer_text} <a href="politique-confidentialite.html">${t.privacy_policy}</a>`;
        } else if (t[key]) {
            el.innerHTML = t[key];
        }
    });
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) langToggle.textContent = lang === 'fr' ? 'Wolof' : 'Français';

    const orderMessage = document.getElementById('order-message');
    const paymentInfo = document.getElementById('payment-info');
    if (orderMessage && !orderMessage.dataset.hasUserMessage) {
        orderMessage.textContent = '';
    }
    if (paymentInfo && !paymentInfo.dataset.supportInjected) {
        const supportNumber = getSupportNumber();
        paymentInfo.insertAdjacentHTML('beforeend', `
            <div class="payment-support">
                <strong>${t.support_label}</strong>
                <p>${t.support_text}</p>
                <a class="btn btn-secondary" href="https://wa.me/${supportNumber}?text=${encodeURIComponent(t.whatsapp_support_text)}" target="_blank" rel="noopener noreferrer">${t.whatsapp_support_text}</a>
            </div>
        `);
        paymentInfo.dataset.supportInjected = '1';
    }
}

function getSupportNumber() {
    return '221774137575';
}

function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => toast.classList.remove('show'), 2200);
}

function mettreAJourPanier() {
    localStorage.setItem('porokhane-panier', JSON.stringify(panier));

    const grandTotal = panier.reduce((sum, item) => sum + item.prix * item.quantite, 0);
    const cartTotal = document.getElementById('cart-total');
    const cartItems = document.getElementById('cart-items');
    const orderSubmit = document.getElementById('order-submit');

    if (cartItems) {
        cartItems.innerHTML = panier.length
            ? panier.map(item => `
                <div class="cart-item">
                    <div>
                        <strong>${item.nom}</strong>
                        <p>${item.quantite} x ${item.prix} FCFA</p>
                    </div>
                    <div class="cart-actions">
                        <button type="button" data-action="minus" data-id="${item.id}">-</button>
                        <button type="button" data-action="plus" data-id="${item.id}">+</button>
                        <button type="button" data-action="remove" data-id="${item.id}">Supprimer</button>
                    </div>
                </div>
            `).join('')
            : '<p class="message-erreur">Votre panier est vide.</p>';
    }

    if (cartTotal) cartTotal.textContent = `Total : ${grandTotal} FCFA`;
    if (orderSubmit) orderSubmit.disabled = panier.length === 0;
}

function ajouterAuPanier(produit) {
    const existing = panier.find(item => item.id === produit.id);
    if (existing) {
        existing.quantite += 1;
    } else {
        panier.push({ ...produit, quantite: 1 });
    }
    mettreAJourPanier();
    showToast(`${produit.nom} ajouté au panier`);
}

function modifierPanier(id, delta) {
    const existing = panier.find(item => item.id === id);
    if (!existing) return;
    existing.quantite += delta;
    if (existing.quantite <= 0) {
        panier = panier.filter(item => item.id !== id);
    }
    mettreAJourPanier();
}

function clearPanier() {
    panier = [];
    mettreAJourPanier();
}

async function chargerJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Erreur de chargement: ${url}`);
    }
    return response.json();
}

async function chargerDonneesVitrine() {
    try {
        const [produits, texts, whatsapp, events] = await Promise.all([
            chargerJson('/api/public/products'),
            chargerJson('/api/public/site-texts'),
            chargerJson('/api/public/whatsapp'),
            chargerJson('/api/public/events')
        ]);
        const categories = await chargerJson('/api/public/categories').catch(() => []);

        tousLesProduits = produits;
        siteTextsCache = texts || {};
        siteTextsCache.categories = Array.isArray(categories) ? categories : [];
        afficherProduits(produits);
        afficherEvenements(getDisplayEvents(events));
        appliquerTextesSite(texts);
        appliquerContacts(whatsapp);
        renderCategoryFilters();
        renderTrendTissues(produits);
        mettreAJourPanier();
        initEventCarousel();
    } catch (error) {
        const liste = document.getElementById('liste-produits');
        if (liste) {
            liste.innerHTML = '<p class="message-erreur">Impossible de charger les produits. <button type="button" onclick="chargerDonneesVitrine()">Reessayer</button></p>';
        }
    }
}

function appliquerTextesSite(texts) {
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const heroButton = document.getElementById('hero-button');
    const heroBadge = document.getElementById('hero-badge');

    if (heroTitle && texts.hero_title) heroTitle.textContent = texts.hero_title;
    if (heroSubtitle && texts.hero_subtitle) heroSubtitle.textContent = texts.hero_subtitle;
    if (heroButton && texts.button_text) heroButton.textContent = texts.button_text;
    if (heroBadge && texts.hero_badge) heroBadge.textContent = texts.hero_badge;
}

function appliquerContacts(whatsapp) {
    const primaryLink = document.getElementById('contact-whatsapp');
    const phoneLink = document.getElementById('contact-phone');
    const socialLinks = document.getElementById('social-links');
    const firstWhatsapp = Array.isArray(whatsapp) ? whatsapp[0] : null;

    if (primaryLink && firstWhatsapp) {
        const message = encodeURIComponent(firstWhatsapp.message || 'Bonjour, je souhaite commander.');
        primaryLink.href = `https://wa.me/${firstWhatsapp.numero || '221774137575'}?text=${message}`;
    }

    if (phoneLink && firstWhatsapp) {
        phoneLink.href = `tel:${firstWhatsapp.numero || '+221774137575'}`;
        phoneLink.textContent = firstWhatsapp.numero || '+221 77 413 75 75';
    }

    if (socialLinks) {
        socialLinks.querySelectorAll('a').forEach((link) => {
            if (link.href.includes('tiktok') && firstWhatsapp?.tiktok) {
                link.href = firstWhatsapp.tiktok;
            }
        });
    }
}

function renderPriceBlock(product) {
    const current = Number(product.prix || 0);
    const previous = Number(product.prix_avant || 0);
    const priceChange = product.priceChange || null;
    const previousPrice = Number(priceChange?.oldPrice || previous || 0);
    const diff = Number(priceChange?.changePercent || 0);
    if (Number.isFinite(previousPrice) && previousPrice > 0 && previousPrice !== current) {
        const label = priceChange?.changeType === 'increase' ? `+${diff}%` : `-${diff}%`;
        return `
            <div class="price-stack">
                <strong class="price-current">${current} FCFA</strong>
                <span class="price-previous">${previousPrice} FCFA</span>
                <small class="price-change ${priceChange?.changeType === 'increase' ? 'increase' : 'decrease'}">${label}</small>
            </div>
        `;
    }

    return `<strong class="price-current">${current} FCFA</strong>`;
}

function afficherProduits(produits) {
    const liste = document.getElementById('liste-produits');
    const accueilListe = document.getElementById('produit-container');

    if (liste) {
        liste.innerHTML = produits.map(produit => `
            <article class="card">
                <div class="image-box">
                    <img src="${produit.image}" alt="${produit.nom}">
                </div>
                <div class="card-content">
                    <h3>${produit.nom}</h3>
                    ${renderPriceBlock(produit)}
                    <p>${produit.description || ''}</p>
                    <button class="btn add-to-cart" type="button" data-product-id="${produit.id}">Ajouter au panier</button>
                </div>
            </article>
        `).join('');
    }

    if (accueilListe) {
        accueilListe.innerHTML = getSuggestedProducts(produits).map(produit => `
            <article class="card">
                <div class="image-box">
                    <img src="${produit.image}" alt="${produit.nom}">
                </div>
                <div class="card-content">
                    <h3>${produit.nom}</h3>
                    ${renderPriceBlock(produit)}
                    <button class="btn add-to-cart" type="button" data-product-id="${produit.id}">Ajouter au panier</button>
                </div>
            </article>
        `).join('');
    }
}

function splitCsv(value) {
    return String(value || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
}

function getCatalogCategories() {
    const categories = Array.isArray(siteTextsCache.categories) ? siteTextsCache.categories : [];
    if (categories.length) {
        return categories.filter(category => !category.parent_id);
    }
    const legacy = splitCsv(siteTextsCache.catalog_categories);
    return legacy.length ? legacy.map(name => ({ name })) : [{ name: 'Sac' }, { name: 'Robe' }, { name: 'Tissu' }, { name: 'Collier' }, { name: 'Chaussure' }];
}

function getFeaturedCategories() {
    const categories = Array.isArray(siteTextsCache.categories) ? siteTextsCache.categories : [];
    if (categories.length) {
        return categories.filter(category => !category.parent_id).slice(0, 3);
    }
    const legacy = splitCsv(siteTextsCache.featured_categories);
    return legacy.length ? legacy.map(name => ({ name })) : [{ name: 'Sac' }, { name: 'Chaussure' }, { name: 'Collier' }];
}

function renderCategoryFilters() {
    const container = document.getElementById('category-filters');
    if (!container) return;
    const categories = getCatalogCategories();
    container.innerHTML = [
        `<button type="button" onclick="filtrer('Tous')">${locales[getLocale()].filter_all || 'Tous'}</button>`,
        ...categories.map(category => `<button type="button" onclick="filtrer('${category.name}')">${category.name}${String(category.name).endsWith('s') ? '' : 's'}</button>`)
    ].join('');
}

function afficherEvenements(events) {
    const grid = document.getElementById('announcement-grid');
    const eventTrack = document.getElementById('events-track');

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

    if (eventTrack) {
        eventTrack.innerHTML = events.map(event => `
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

function getCustomEvents() {
    const raw = String(siteTextsCache.event_cards || '').trim();
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function defaultEvents() {
    return [
        {
            titre: 'Nouvelle collection',
            date: 'Chaque semaine',
            description: 'Des arrivages sélectionnés de sacs, robes et chaussures sont publiés en priorité sur la page d accueil.',
            accent: 'Collection',
            image: ''
        },
        {
            titre: 'Annonces live',
            date: 'Avant chaque direct',
            description: 'Les prochains lives sont mis en avant pour permettre aux clients de se préparer et poser leurs questions.',
            accent: 'Live',
            image: ''
        },
        {
            titre: 'Offres WhatsApp',
            date: 'Disponible maintenant',
            description: 'Les promotions et la disponibilité des produits sont partagées en un clic vers WhatsApp.',
            accent: 'Promo',
            image: ''
        },
        {
            titre: 'Commandes rapides',
            date: '24h/24',
            description: 'Le panier et les options de paiement sont optimisés pour finaliser une commande sans friction.',
            accent: 'Commande',
            image: ''
        }
    ];
}

function getDisplayEvents(fallbackEvents) {
    const custom = getCustomEvents();
    return custom.length ? custom : (fallbackEvents && fallbackEvents.length ? fallbackEvents : defaultEvents());
}

function rendreBlocLive(liveData) {
    const liveTitle = document.getElementById('live-title');
    const liveText = document.querySelector('.live-section [data-i18n="live_text"]');
    const liveCard = document.querySelector('.live-section .live-card');
    const liveVideo = document.querySelector('.live-section .live-video');
    const liveActions = document.querySelector('.live-section .live-actions');

    if (!liveCard || !liveVideo || !liveActions) return;

    const isLive = liveData && (liveData.statut === 'on' || liveData.statut === 'online');
    const liveLabel = isLive ? 'En direct maintenant' : 'Aucun live en cours';
    const liveDescription = isLive
        ? (liveData.message || 'Le direct est en cours. Cliquez pour le suivre sur TikTok.')
        : (liveData.message || 'Revenez plus tard ou suivez-nous pour être averti du prochain direct.');

    if (liveTitle) liveTitle.textContent = liveLabel;
    if (liveText) liveText.textContent = liveDescription;

    liveVideo.innerHTML = isLive
        ? `
            <span class="badge-live">EN DIRECT</span>
            <iframe
                src="${liveData.lien}"
                title="Live Porokhane Sagnse VIP"
                allowfullscreen>
            </iframe>
            <a class="btn btn-secondary" href="${liveData.lien}" target="_blank" rel="noopener noreferrer">Ouvrir le live TikTok</a>
          `
        : `
            <span class="live-dot"></span>
            <h3 data-i18n="live_offline_title">Le direct n a pas encore commence</h3>
            <p data-i18n="live_offline_text">Quand le live sera actif, la video apparaitra ici.</p>
          `;

    liveActions.innerHTML = `
        <h3 data-i18n="stay_informed">Rester informe</h3>
        <a class="btn" href="https://www.tiktok.com/@prokhanesagnsevip?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" data-i18n="follow_tiktok">Suivre sur TikTok</a>
        <a class="btn btn-secondary" href="https://wa.me/221774137575?text=Je%20souhaite%20etre%20informe%20du%20prochain%20live" target="_blank" rel="noopener noreferrer" data-i18n="notify_whatsapp">Etre averti sur WhatsApp</a>
    `;
}

function filtrer(categorie) {
    if (categorie === 'Tous') {
        afficherProduits(tousLesProduits);
        return;
    }

    afficherProduits(tousLesProduits.filter(produit => produit.categorie === categorie));
}

function getSuggestedProducts(products) {
    const featured = getFeaturedCategories().map(item => String(item.name || '').toLowerCase());
    const matched = products.filter(product => featured.includes(String(product.categorie || '').toLowerCase()));
    const fallback = products.filter(product => !matched.includes(product));
    return [...matched, ...fallback].slice(0, 4);
}

function renderTrendTissues(products) {
    const container = document.getElementById('tissue-trend-container');
    if (!container) return;
    const tissues = products.filter(product => String(product.product_type || '').toLowerCase() === 'tissue').slice(0, 4);
    container.innerHTML = tissues.length ? tissues.map(product => `
        <article class="trend-card">
            <img src="${product.image}" alt="${product.nom}">
            <div class="trend-card-body">
                <span class="announcement-tag">Tissu tendance</span>
                <h3>${product.nom}</h3>
                <p>${product.description || ''}</p>
                ${renderPriceBlock(product)}
            </div>
        </article>
    `).join('') : '<p class="message-erreur">Aucun tissu tendance disponible pour le moment.</p>';
}

async function chargerInstructionsPaiement() {
    const info = document.getElementById('payment-info');
    if (!info) return;

    try {
        const data = await chargerJson('/api/public/payment-instructions');
        info.innerHTML = `
            <strong>Payez via Wave ou Orange Money</strong>
            <p>Choisissez le service de paiement, puis utilisez le numéro correspondant affiché ci-dessous.</p>
            <p>Wave : ${data.waveNumber || '+221771509100'} / ${data.orangeMoneyNumber || '+221774137575'}</p>
            <p>Orange Money : ${data.waveNumber || '+221771509100'} / ${data.orangeMoneyNumber || '+221774137575'}</p>
            <p>Beneficiaire : ${data.beneficiaire || 'Diary Diop'}</p>
            <p>${data.instructions || 'Prenez une capture d ecran de confirmation puis televersez-la.'}</p>
            <div class="payment-actions">
                <a class="btn btn-secondary" href="tel:${data.waveNumber || '+221771509100'}">Payer avec au 771509100</a>
                <a class="btn btn-secondary" href="tel:${data.orangeMoneyNumber || '+221774137575'}">Payer avec au 774137575</a>
            </div>
        `;
    } catch (error) {
        info.innerHTML = '<p>Impossible de charger les instructions de paiement.</p>';
    }
}

async function chargerLiveAccueil() {
    try {
        const liveData = await chargerJson('/api/public/live');
        rendreBlocLive(liveData || {});
    } catch (error) {
        rendreBlocLive({});
    }
}

function setupPaymentChoice() {
    const modeButtons = document.querySelectorAll('[data-payment-mode]');
    const choice = document.getElementById('payment-number-choice');
    const question = document.getElementById('payment-number-question');
    const note = document.getElementById('payment-number-note');
    const waveLink = document.getElementById('payment-number-wave');
    const orangeLink = document.getElementById('payment-number-orange');
    if (!modeButtons.length || !choice || !question || !note || !waveLink || !orangeLink) return;

    const openChoice = (mode) => {
        choice.hidden = false;
        if (mode === 'wave') {
            question.textContent = 'Mode choisi : Wave';
            note.textContent = 'Wave peut utiliser les deux numéros ci-dessous.';
        } else {
            question.textContent = 'Mode choisi : Orange Money';
            note.textContent = 'Orange Money peut utiliser les deux numéros ci-dessous.';
        }
        waveLink.textContent = 'Payer au 771509100';
        orangeLink.textContent = 'Payer au 774137575';
        choice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    modeButtons.forEach((button) => {
        button.addEventListener('click', () => openChoice(button.dataset.paymentMode));
    });
}

async function envoyerCommande(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.querySelector('input[name="waveProof"]');
    const phoneInput = form.querySelector('input[name="telephone"]');
    const paymentModeInput = form.querySelector('select[name="paymentMode"]');
    const orderMessage = document.getElementById('order-message');

    if (!panier.length) {
        orderMessage.dataset.hasUserMessage = '1';
        orderMessage.dataset.state = 'error';
        orderMessage.textContent = locales[getLocale()].order_missing_panier;
        return;
    }

    if (!fileInput?.files?.[0]) {
        orderMessage.dataset.hasUserMessage = '1';
        orderMessage.dataset.state = 'error';
        orderMessage.textContent = locales[getLocale()].order_missing_wave;
        return;
    }

    const rawPhone = String(phoneInput?.value || '').trim();
    const digitsOnly = rawPhone.replace(/\D/g, '');
    const paymentMode = String(paymentModeInput?.value || '').trim();
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
        orderMessage.dataset.hasUserMessage = '1';
        orderMessage.dataset.state = 'error';
        orderMessage.textContent = 'Le numero client doit contenir entre 8 et 15 chiffres.';
        return;
    }

    if (!paymentMode) {
        orderMessage.dataset.hasUserMessage = '1';
        orderMessage.dataset.state = 'error';
        orderMessage.textContent = 'Choisissez un mode de paiement.';
        return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
        const payload = Object.fromEntries(new FormData(form).entries());
        payload.telephone = digitsOnly;
        payload.items = panier.map(item => ({ nom: item.nom, quantite: item.quantite, prix: item.prix }));
        payload.waveProof = reader.result;
        payload.paymentMode = paymentMode;

        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (!response.ok) {
            orderMessage.dataset.hasUserMessage = '1';
            orderMessage.dataset.state = 'error';
            orderMessage.textContent = result.error || locales[getLocale()].order_submit_error;
            return;
        }

        orderMessage.dataset.hasUserMessage = '1';
        orderMessage.dataset.state = 'success';
        orderMessage.textContent = `${locales[getLocale()].order_success_commercial} Numéro de commande : ${result.orderNumber}. ${locales[getLocale()].order_success_followup}`;
        const targetNumber = paymentMode === 'orange' ? '221774137575' : '221771509100';
        const waMessage = [
            'Bonjour, nouvelle commande.',
            `Mode de paiement : ${paymentMode === 'orange' ? 'Orange Money' : 'Wave'}.`,
            `Commande : ${result.orderNumber}.`,
            `Client : ${payload.clientNom || ''}.`,
            `Telephone : ${payload.telephone}.`,
            `Adresse : ${payload.adresse || ''}.`,
            `Ville : ${payload.ville || ''}.`,
            `Total : ${result.total} FCFA.`
        ].join('\n');
        window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(waMessage)}`, '_blank', 'noopener,noreferrer');
        clearPanier();
        form.reset();
    };

    reader.readAsDataURL(fileInput.files[0]);
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

    const PIXELS_PER_MS = 0.025;
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

    function stop() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        lastTime = null;
    }

    function pauseTemporarily() {
        isPaused = true;
        if (pauseTimeout) clearTimeout(pauseTimeout);
        pauseTimeout = setTimeout(() => { isPaused = false; }, 1200);
    }

    const chunk = () => Math.floor(viewport.clientWidth * 0.8);
    prev.addEventListener('click', () => {
        x = Math.max(0, x - chunk());
        track.style.transform = `translateX(-${x}px)`;
        pauseTemporarily();
    });
    next.addEventListener('click', () => {
        x += chunk();
        if (x >= loopWidth) x -= loopWidth;
        track.style.transform = `translateX(-${x}px)`;
        pauseTemporarily();
    });

    viewport.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') next.click();
        if (e.key === 'ArrowLeft') prev.click();
    });

    viewport.addEventListener('mouseenter', () => { isPaused = true; });
    viewport.addEventListener('mouseleave', () => { isPaused = false; });
    viewport.addEventListener('focusin', () => { isPaused = true; });
    viewport.addEventListener('focusout', () => { isPaused = false; });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    });

    start();
    window.addEventListener('beforeunload', stop);
}

document.addEventListener('DOMContentLoaded', () => {
    chargerDonneesVitrine();
    chargerInstructionsPaiement();
    chargerLiveAccueil();
    applyLocale();
    setupPaymentChoice();

    document.addEventListener('click', (event) => {
        const target = event.target;

        if (target.classList.contains('add-to-cart')) {
            const productId = Number(target.dataset.productId);
            const found = tousLesProduits.find(item => item.id === productId);
            if (found) ajouterAuPanier(found);
        }

        if (target.dataset.action === 'minus') modifierPanier(Number(target.dataset.id), -1);
        if (target.dataset.action === 'plus') modifierPanier(Number(target.dataset.id), 1);
        if (target.dataset.action === 'remove') modifierPanier(Number(target.dataset.id), -999);

        if (target.id === 'lang-toggle') {
            const nextLang = getLocale() === 'fr' ? 'wo' : 'fr';
            setLocale(nextLang);
        }
    });

    const clearCartButton = document.getElementById('clear-cart');
    if (clearCartButton) clearCartButton.addEventListener('click', clearPanier);

    const orderForm = document.getElementById('order-form');
    if (orderForm) orderForm.addEventListener('submit', envoyerCommande);
});
