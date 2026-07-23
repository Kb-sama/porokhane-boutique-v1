const countProducts = document.getElementById('count-products');
const countOrders = document.getElementById('count-orders');
const liveStatus = document.getElementById('live-status');
const productsTable = document.querySelector('#products-table tbody');
const modelsTable = document.querySelector('#models-table tbody');
const relationsTable = document.querySelector('#relations-table tbody');
const ordersTable = document.querySelector('#orders-table tbody');
const addProductButton = document.getElementById('add-product');
const productModal = document.getElementById('product-modal');
const productModalTitle = document.getElementById('product-modal-title');
const cancelProductButton = document.getElementById('cancel-product');
const productForm = document.getElementById('product-form');
const productIdField = document.getElementById('product-id');
const productImageFile = document.getElementById('product-image-file');
const productImagePath = document.getElementById('product-image-path');
const productImagePreview = document.getElementById('product-image-preview');
const modelForm = document.getElementById('model-form');
const modelProductSelect = document.getElementById('model-product-id');
const relationForm = document.getElementById('relation-form');
const relationRobeSelect = document.getElementById('relation-robe-id');
const relationTissueSelect = document.getElementById('relation-tissue-id');
const cameraPreview = document.getElementById('camera-preview');
const cameraCanvas = document.getElementById('camera-canvas');
const startCameraButton = document.getElementById('start-camera');
const takePhotoButton = document.getElementById('take-photo');
const stopCameraButton = document.getElementById('stop-camera');
const siteTextsInput = document.getElementById('site-texts-input');
const saveSiteTexts = document.getElementById('save-site-texts');
const catalogCategoriesInput = document.getElementById('catalog-categories-input');
const featuredCategoriesInput = document.getElementById('featured-categories-input');
const saveCatalogConfig = document.getElementById('save-catalog-config');
const siteTextHeroTitle = document.getElementById('site-text-hero-title');
const siteTextHeroSubtitle = document.getElementById('site-text-hero-subtitle');
const siteTextButton = document.getElementById('site-text-button');
const siteTextHeroBadge = document.getElementById('site-text-hero-badge');
const catalogCategoriesPreview = document.getElementById('catalog-categories-preview');
const featuredCategoriesPreview = document.getElementById('featured-categories-preview');
const eventCardForm = document.getElementById('event-card-form');
const eventCardTitle = document.getElementById('event-card-title');
const eventCardDescription = document.getElementById('event-card-description');
const eventCardAccent = document.getElementById('event-card-accent');
const eventCardDate = document.getElementById('event-card-date');
const eventCardImage = document.getElementById('event-card-image');
const eventCardList = document.getElementById('event-card-list');
const saveEventCards = document.getElementById('save-event-cards');
const liveForm = document.getElementById('live-form');
const logoutButton = document.getElementById('logout-button');
const cleanupOrdersButton = document.getElementById('cleanup-orders');
const cleanupKeepLast = document.getElementById('cleanup-keep-last');
const cleanupOlderThan = document.getElementById('cleanup-older-than');
const adminMain = document.querySelector('.admin-main');
let cameraStream = null;
let cachedProducts = [];
let eventCards = [];
let categoriesCache = [];
let categorySearchTerm = '';

function formatProductPrice(product) {
    const current = Number(product.prix || 0);
    const previous = Number(product.prix_avant || 0);
    if (Number.isFinite(previous) && previous > 0 && previous !== current) {
        const diff = Math.round((Math.abs(current - previous) / previous) * 100);
        const label = current < previous ? `-${diff}%` : `+${diff}%`;
        return `
            <div class="price-stack">
                <span class="price-current">${current} FCFA</span>
                <span class="price-previous">${previous} FCFA</span>
                <small class="price-change ${current < previous ? 'decrease' : 'increase'}">${label}</small>
            </div>
        `;
    }
    return `<span class="price-current">${current} FCFA</span>`;
}

function resetProductForm() {
    productForm.reset();
    if (productIdField) productIdField.value = '';
    if (productModalTitle) productModalTitle.textContent = 'Ajouter un produit';
}

function openEditProductModal(product) {
    openProductModal();
    if (productModalTitle) productModalTitle.textContent = 'Modifier un produit';
    if (productIdField) productIdField.value = product.id;
    productForm.nom.value = product.nom || '';
    productForm.description.value = product.description || '';
    productForm.categorie.value = product.categorie || '';
    productForm.productType.value = product.product_type || 'autre';
    productForm.prix.value = product.prix ?? '';
    productForm.stock.value = product.stock ?? 0;
    productForm.promotion.value = product.promotion ?? 0;
    productForm.disponible.value = product.disponible ?? 1;
    productForm.image.value = product.image || '';
    setPreview(product.image || '');
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

function splitCategories(value) {
    return String(value || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
}

function renderChips(container, value) {
    if (!container) return;
    const items = splitCategories(value);
    container.innerHTML = items.length
        ? items.map(item => `<span class="chip">${item}</span>`).join('')
        : '<span class="chip chip-empty">Aucune categorie</span>';
}

function getCatalogElements() {
    return {
        section: document.getElementById('catalog-config'),
        visibleInput: document.getElementById('catalog-categories-input'),
        featuredInput: document.getElementById('featured-categories-input'),
        visiblePreview: document.getElementById('catalog-categories-preview'),
        featuredPreview: document.getElementById('featured-categories-preview'),
        saveButton: document.getElementById('save-catalog-config')
    };
}

function ensureCatalogConfigTable() {
    const elements = getCatalogElements();
    if (!elements.section || elements.section.dataset.tableReady === '1') return;
    elements.section.dataset.tableReady = '1';
    elements.section.innerHTML = `
        <h2>Catégories du catalogue</h2>
        <p>Gestion rapide des catégories affichées sur le site.</p>
        <table class="catalog-table">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Valeurs</th>
                    <th>Aperçu</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Catégories visibles</td>
                    <td><input id="catalog-categories-input" type="text" placeholder="Sac, Robe, Tissu, Collier, Chaussure"></td>
                    <td><div id="catalog-categories-preview" class="chips-preview"></div></td>
                </tr>
                <tr>
                    <td>Catégories suggérées</td>
                    <td><input id="featured-categories-input" type="text" placeholder="Sac, Chaussure, Collier"></td>
                    <td><div id="featured-categories-preview" class="chips-preview"></div></td>
                </tr>
            </tbody>
        </table>
        <div class="catalog-table-toolbar">
            <button id="save-catalog-config" type="button">Enregistrer</button>
        </div>
    `;
}

function openCategoryModal(category = null) {
    const modal = document.getElementById('category-modal');
    if (!modal) return;
    document.getElementById('category-modal-title').textContent = category ? 'Modifier une catégorie' : 'Ajouter une catégorie';
    document.getElementById('category-id').value = category?.id || '';
    document.getElementById('category-name').value = category?.name || '';
    document.getElementById('category-parent').value = category?.parent_id || '';
    document.getElementById('category-image').value = category?.image || '';
    document.getElementById('category-description').value = category?.description || '';
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
}

function closeCategoryModal() {
    const modal = document.getElementById('category-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
}

function renderCategoryManager() {
    const list = document.getElementById('category-list');
    const parentSelect = document.getElementById('category-parent');
    if (!list || !parentSelect) return;
    const categories = categoriesCache.filter(category => {
        const term = categorySearchTerm.toLowerCase();
        return !term || String(category.name || '').toLowerCase().includes(term);
    });
    parentSelect.innerHTML = '<option value="">Aucune</option>' + categoriesCache.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    list.innerHTML = categories.length ? categories.map(category => `
        <div class="category-row">
            <div>
                <strong>${category.name}</strong>
                <p>${category.productCount || 0} produits</p>
            </div>
            <div class="category-actions">
                <button type="button" data-action="edit" data-id="${category.id}">Modifier</button>
                <button type="button" data-action="children" data-id="${category.id}">Sous-catégorie</button>
                <button type="button" data-action="delete" data-id="${category.id}">Supprimer</button>
            </div>
        </div>
    `).join('') : '<p class="message-erreur">Aucune catégorie trouvée.</p>';
}

async function fetchCategories() {
    const res = await fetch('/api/categories');
    categoriesCache = await res.json();
    renderCategoryManager();
}

function renderCategoryManager() {
    const list = document.getElementById('category-list');
    const parentSelect = document.getElementById('category-parent');
    if (!list || !parentSelect) return;

    const categories = categoriesCache.filter(category => {
        const term = categorySearchTerm.toLowerCase();
        return !term || String(category.name || '').toLowerCase().includes(term);
    });

    parentSelect.innerHTML = '<option value="">Aucune</option>' + categoriesCache.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    list.innerHTML = categories.length ? `
        <table class="category-table">
            <thead>
                <tr>
                    <th>Catégorie</th>
                    <th>Parent</th>
                    <th>Produits</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${categories.map(category => {
                    const parent = categoriesCache.find(item => Number(item.id) === Number(category.parent_id));
                    return `
                        <tr>
                            <td>
                                <strong>${category.name}</strong>
                                <div class="category-meta">${category.description || ''}</div>
                            </td>
                            <td>${parent ? parent.name : 'Aucune'}</td>
                            <td>${category.productCount || 0}</td>
                            <td>
                                <div class="category-actions">
                                    <button type="button" data-action="edit" data-id="${category.id}">Modifier</button>
                                    <button type="button" data-action="children" data-id="${category.id}">Sous-catégorie</button>
                                    <button type="button" data-action="delete" data-id="${category.id}">Supprimer</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    ` : '<p class="message-erreur">Aucune catégorie trouvée.</p>';
}

function ensureCategoryManagerUI() {
    if (!adminMain || document.getElementById('category-manager')) return;
    const section = document.createElement('section');
    section.id = 'category-manager';
    section.className = 'admin-section';
    section.innerHTML = `
        <h2>Gestion des catégories</h2>
        <div class="category-toolbar">
            <input id="category-search" type="search" placeholder="Rechercher une catégorie">
            <button id="open-category-modal" type="button">+ Ajouter une catégorie</button>
        </div>
        <div id="category-list" class="category-list"></div>
        <div id="category-modal" class="modal hidden" aria-hidden="true">
            <div class="modal-content">
                <h3 id="category-modal-title">Ajouter une catégorie</h3>
                <form id="category-form">
                    <input type="hidden" id="category-id">
                    <label>Nom
                        <input id="category-name" type="text" required>
                    </label>
                    <label>Catégorie parent
                        <select id="category-parent">
                            <option value="">Aucune</option>
                        </select>
                    </label>
                    <label>Image
                        <input id="category-image" type="text" placeholder="img/categorie.jpg">
                    </label>
                    <label>Description
                        <textarea id="category-description" rows="3"></textarea>
                    </label>
                    <div class="modal-actions">
                        <button type="button" id="cancel-category">Annuler</button>
                        <button type="submit">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    adminMain.insertBefore(section, document.getElementById('event-config'));
}

function openProductModal() {
    productModal.classList.remove('hidden');
    productModal.setAttribute('aria-hidden', 'false');
}

function setPreview(source) {
    if (!source) {
        productImagePreview.removeAttribute('src');
        return;
    }
    productImagePreview.src = source;
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    cameraPreview.srcObject = null;
}

async function startCamera() {
    try {
        stopCamera();
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
        });
        cameraPreview.srcObject = cameraStream;
        showToast('Caméra activée');
    } catch (error) {
        showToast('Caméra indisponible');
    }
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

function closeProductModal() {
    productModal.classList.add('hidden');
    productModal.setAttribute('aria-hidden', 'true');
    resetProductForm();
    setPreview('');
    stopCamera();
}

async function fetchProducts(){
    const res = await fetch('/api/products');
    const products = await res.json();
    cachedProducts = products;
    countProducts.textContent = products.length;
    productsTable.innerHTML = products.map(product => `
        <tr>
            <td><img src="${product.image}" width="60" height="60" alt=""></td>
            <td>${product.nom}</td>
            <td>${product.product_type || 'autre'}</td>
            <td>${product.categorie}</td>
            <td>${formatProductPrice(product)}</td>
            <td>${product.stock || 0}</td>
            <td>
                <button data-id="${product.id}" class="edit-product">Modifier</button>
                <button data-id="${product.id}" class="delete-product">Supprimer</button>
            </td>
        </tr>
    `).join('');
    refreshProductSelects(products);
    await fetchModels();
    await fetchRelations();
}

function refreshProductSelects(products) {
    const tissueProducts = products.filter(product => product.product_type === 'tissue');
    const robeProducts = products.filter(product => product.product_type === 'robe');

    const tissueOptions = tissueProducts.map(product => `<option value="${product.id}">${product.nom}</option>`).join('');
    const robeOptions = robeProducts.map(product => `<option value="${product.id}">${product.nom}</option>`).join('');

    modelProductSelect.innerHTML = tissueOptions || '<option value="">Aucun tissu disponible</option>';
    relationTissueSelect.innerHTML = tissueOptions || '<option value="">Aucun tissu disponible</option>';
    relationRobeSelect.innerHTML = robeOptions || '<option value="">Aucune robe disponible</option>';
}

async function fetchModels() {
    const res = await fetch('/api/product-models');
    const models = await res.json();
    const productMap = new Map(cachedProducts.map(product => [product.id, product]));
    modelsTable.innerHTML = models.map(model => {
        const product = productMap.get(model.product_id);
        return `
            <tr>
                <td>${product ? product.nom : `Produit #${model.product_id}`}</td>
                <td>${model.nom}</td>
                <td>${model.image || '—'}</td>
                <td>${model.description || '—'}</td>
                <td><button data-id="${model.id}" class="delete-model">Supprimer</button></td>
            </tr>
        `;
    }).join('');
}

async function fetchRelations() {
    const res = await fetch('/api/product-relations');
    const relations = await res.json();
    const productMap = new Map(cachedProducts.map(product => [product.id, product]));
    relationsTable.innerHTML = relations.map(relation => {
        const robe = productMap.get(relation.robe_product_id);
        const tissue = productMap.get(relation.tissue_product_id);
        return `
            <tr>
                <td>${robe ? robe.nom : `Produit #${relation.robe_product_id}`}</td>
                <td>${tissue ? tissue.nom : `Produit #${relation.tissue_product_id}`}</td>
                <td><button data-id="${relation.id}" class="delete-relation">Supprimer</button></td>
            </tr>
        `;
    }).join('');
}

async function fetchOrders(){
    const res = await fetch('/api/orders');
    const orders = await res.json();
    countOrders.textContent = orders.length;
    ordersTable.innerHTML = orders.map(order => `
        <tr>
            <td>
                <strong>${order.numero_commande}</strong><br>
                <small>${order.created_at}</small>
            </td>
            <td>${order.client_nom}<br>${order.telephone}<br>${order.adresse}, ${order.ville}</td>
            <td>${order.montant_total} FCFA</td>
            <td>
                <select data-order-id="${order.id}" class="status-select">
                    <option value="en_attente" ${order.statut === 'en_attente' ? 'selected' : ''}>En attente</option>
                    <option value="a_verifier" ${order.statut === 'a_verifier' ? 'selected' : ''}>À vérifier</option>
                    <option value="confirme" ${order.statut === 'confirme' ? 'selected' : ''}>Confirmé</option>
                    <option value="preparee" ${order.statut === 'preparee' ? 'selected' : ''}>Préparée</option>
                    <option value="expediee" ${order.statut === 'expediee' ? 'selected' : ''}>Expédiée</option>
                    <option value="livree" ${order.statut === 'livree' ? 'selected' : ''}>Livrée</option>
                    <option value="annulee" ${order.statut === 'annulee' ? 'selected' : ''}>Annulée</option>
                </select>
            </td>
            <td><a href="${order.preuve_paiement}" target="_blank" rel="noreferrer">Voir la preuve</a></td>
            <td>${(order.items || []).map(item => `${item.nom} x${item.quantite}`).join(', ') || '—'}</td>
        </tr>
    `).join('');
}

async function fetchSiteTexts(){
    const res = await fetch('/api/site-texts');
    const texts = await res.json();
    const textMap = new Map(texts.map(item => [item.key, item.value]));
    if (siteTextHeroTitle) siteTextHeroTitle.value = textMap.get('hero_title') || '';
    if (siteTextHeroSubtitle) siteTextHeroSubtitle.value = textMap.get('hero_subtitle') || '';
    if (siteTextButton) siteTextButton.value = textMap.get('button_text') || '';
    if (siteTextHeroBadge) siteTextHeroBadge.value = textMap.get('hero_badge') || '';
    if (siteTextsInput) {
        siteTextsInput.value = texts
            .filter(item => !['catalog_categories', 'featured_categories', 'event_cards'].includes(item.key))
            .map(item => `${item.key}=${item.value}`)
            .join('\n');
    }
    ensureCatalogConfigTable();
    const catalogEls = getCatalogElements();
    if (catalogEls.visibleInput) catalogEls.visibleInput.value = textMap.get('catalog_categories') || '';
    if (catalogEls.featuredInput) catalogEls.featuredInput.value = textMap.get('featured_categories') || '';
    renderChips(catalogEls.visiblePreview, catalogEls.visibleInput?.value || '');
    renderChips(catalogEls.featuredPreview, catalogEls.featuredInput?.value || '');
    try {
        eventCards = JSON.parse(textMap.get('event_cards') || '[]');
        if (!Array.isArray(eventCards)) eventCards = [];
    } catch {
        eventCards = [];
    }
    renderEventCards();
}

function renderEventCards() {
    if (!eventCardList) return;
    if (!eventCards.length) {
        eventCardList.innerHTML = '<p class="message-erreur">Aucune carte événement ajoutée.</p>';
        return;
    }
    eventCardList.innerHTML = eventCards.map((card, index) => `
        <article class="event-card-item">
            <div>
                <strong>${card.titre || 'Sans titre'}</strong>
                <p>${card.description || ''}</p>
                <small>${card.accent || '—'} ${card.date ? `• ${card.date}` : ''}</small>
            </div>
            <button type="button" class="delete-event-card" data-index="${index}">Supprimer</button>
        </article>
    `).join('');
}

async function saveEventCardsConfig() {
    await fetch('/api/site-texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'event_cards', value: JSON.stringify(eventCards) })
    });
}

async function fetchLive(){
    const res = await fetch('/api/live-status');
    const live = await res.json();
    if(live.length){
        const item = live[0];
        liveStatus.textContent = item.statut === 'on' ? 'En ligne' : 'Hors ligne';
        liveForm.statut.value = item.statut;
        liveForm.titre.value = item.titre;
        liveForm.plateforme.value = item.plateforme;
        liveForm.lien.value = item.lien;
        liveForm.message.value = item.message;
    }
}

addProductButton.addEventListener('click', () => {
    resetProductForm();
    setPreview('');
    openProductModal();
});
cancelProductButton.addEventListener('click', closeProductModal);
productModal.addEventListener('click', (event) => {
    if (event.target === productModal) closeProductModal();
});

productImageFile.addEventListener('change', async () => {
    const file = productImageFile.files && productImageFile.files[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    productImagePath.value = dataUrl;
    setPreview(dataUrl);
});

startCameraButton.addEventListener('click', startCamera);

takePhotoButton.addEventListener('click', async () => {
    if (!cameraStream) {
        showToast('Activez d\'abord la caméra');
        return;
    }
    const width = cameraPreview.videoWidth || 1280;
    const height = cameraPreview.videoHeight || 720;
    cameraCanvas.width = width;
    cameraCanvas.height = height;
    const context = cameraCanvas.getContext('2d');
    context.drawImage(cameraPreview, 0, 0, width, height);
    const photo = cameraCanvas.toDataURL('image/jpeg', 0.92);
    productImagePath.value = photo;
    setPreview(photo);
    stopCamera();
    showToast('Photo ajoutée');
});

stopCameraButton.addEventListener('click', stopCamera);

productForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(productForm);
    const payload = Object.fromEntries(formData.entries());
    payload.prix = Number(payload.prix);
    payload.stock = Number(payload.stock);
    payload.promotion = Number(payload.promotion || 0);
    payload.disponible = Number(payload.disponible);
    payload.productType = String(payload.productType || 'autre');
    payload.image = String(payload.image || '').trim();
    if (!payload.image && productImagePreview.src) {
        payload.image = productImagePreview.src;
    }

    const productId = Number(payload.productId || 0);
    const method = productId ? 'PUT' : 'POST';
    const url = productId ? `/api/products/${productId}` : '/api/products';
    delete payload.productId;

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) {
        showToast(data.error || 'Erreur lors de l’ajout');
        return;
    }
    closeProductModal();
    showToast(productId ? 'Produit modifié' : 'Produit ajouté');
    fetchProducts();
});

modelForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(modelForm);
    const payload = Object.fromEntries(data.entries());
    payload.productId = Number(payload.productId);

    const res = await fetch('/api/product-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) {
        showToast(result.error || 'Erreur lors de l’ajout du modèle');
        return;
    }
    modelForm.reset();
    fetchModels();
    showToast('Modèle ajouté');
});

relationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(relationForm);
    const payload = Object.fromEntries(data.entries());
    payload.robeProductId = Number(payload.robeProductId);
    payload.tissueProductId = Number(payload.tissueProductId);

    const res = await fetch('/api/product-relations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) {
        showToast(result.error || 'Erreur lors de la liaison');
        return;
    }
    relationForm.reset();
    fetchRelations();
    showToast('Robe liée au tissu');
});

if (saveSiteTexts) {
    saveSiteTexts.addEventListener('click', async () => {
        const requests = [
            fetch('/api/site-texts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'hero_title', value: (siteTextHeroTitle?.value || '').trim() })
            }),
            fetch('/api/site-texts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'hero_subtitle', value: (siteTextHeroSubtitle?.value || '').trim() })
            }),
            fetch('/api/site-texts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'button_text', value: (siteTextButton?.value || '').trim() })
            }),
            fetch('/api/site-texts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'hero_badge', value: (siteTextHeroBadge?.value || '').trim() })
            })
        ];
        await Promise.all(requests);
        showToast('Textes enregistrés');
    });
}

if (saveCatalogConfig) {
    saveCatalogConfig.addEventListener('click', async () => {
        const requests = [
            fetch('/api/site-texts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'catalog_categories', value: (catalogCategoriesInput?.value || '').trim() })
            }),
            fetch('/api/site-texts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'featured_categories', value: (featuredCategoriesInput?.value || '').trim() })
            })
        ];
        await Promise.all(requests);
        showToast('Catalogue enregistré');
    });
}

ensureCategoryManagerUI();
const catalogSaveButton = document.getElementById('save-catalog-config');
if (catalogSaveButton) {
    catalogSaveButton.addEventListener('click', async () => {
        const catalogEls = getCatalogElements();
        const requests = [
            fetch('/api/site-texts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'catalog_categories', value: (catalogEls.visibleInput?.value || '').trim() })
            }),
            fetch('/api/site-texts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'featured_categories', value: (catalogEls.featuredInput?.value || '').trim() })
            })
        ];
        await Promise.all(requests);
        showToast('Catalogue enregistré');
    });
}
if (document.getElementById('open-category-modal')) {
    document.getElementById('open-category-modal').addEventListener('click', () => openCategoryModal());
}
if (document.getElementById('category-search')) {
    document.getElementById('category-search').addEventListener('input', (event) => {
        categorySearchTerm = event.target.value || '';
        renderCategoryManager();
    });
}
const categoryManager = document.getElementById('category-manager');
if (categoryManager) {
    categoryManager.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const id = Number(button.dataset.id);
        const category = categoriesCache.find(item => Number(item.id) === id);
        if (!category) return;
        if (button.dataset.action === 'edit') openCategoryModal(category);
        if (button.dataset.action === 'children') openCategoryModal({ parent_id: category.id });
        if (button.dataset.action === 'delete') {
            await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            fetchCategories();
        }
    });
}
const categoryModal = document.getElementById('category-modal');
if (categoryModal) {
    categoryModal.addEventListener('click', (event) => {
        if (event.target === categoryModal) closeCategoryModal();
    });
}
const cancelCategoryButton = document.getElementById('cancel-category');
if (cancelCategoryButton) cancelCategoryButton.addEventListener('click', closeCategoryModal);
const categoryForm = document.getElementById('category-form');
if (categoryForm) {
    categoryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = Number(document.getElementById('category-id').value || 0);
        const payload = {
            name: document.getElementById('category-name').value,
            parentId: document.getElementById('category-parent').value,
            image: document.getElementById('category-image').value,
            description: document.getElementById('category-description').value
        };
        const url = id ? `/api/categories/${id}` : '/api/categories';
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (!res.ok) return showToast(data.error || 'Erreur catégorie');
        closeCategoryModal();
        fetchCategories();
        showToast(id ? 'Catégorie modifiée' : 'Catégorie ajoutée');
    });
}

if (catalogCategoriesInput) {
    catalogCategoriesInput.addEventListener('input', () => renderChips(catalogCategoriesPreview, catalogCategoriesInput.value));
}

if (featuredCategoriesInput) {
    featuredCategoriesInput.addEventListener('input', () => renderChips(featuredCategoriesPreview, featuredCategoriesInput.value));
}

if (eventCardForm) {
    eventCardForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const card = {
            titre: String(eventCardTitle?.value || '').trim(),
            description: String(eventCardDescription?.value || '').trim(),
            accent: String(eventCardAccent?.value || '').trim(),
            date: String(eventCardDate?.value || '').trim(),
            image: String(eventCardImage?.value || '').trim()
        };

        if (!card.titre || !card.description) {
            showToast('Titre et texte sont requis');
            return;
        }

        eventCards.unshift(card);
        await saveEventCardsConfig();
        renderEventCards();
        eventCardForm.reset();
        showToast('Carte événement ajoutée');
    });
}

if (eventCardList) {
    eventCardList.addEventListener('click', async (event) => {
        const button = event.target.closest('.delete-event-card');
        if (!button) return;
        const index = Number(button.dataset.index);
        if (!Number.isInteger(index)) return;
        eventCards.splice(index, 1);
        await saveEventCardsConfig();
        renderEventCards();
        showToast('Carte événement supprimée');
    });
}

if (saveEventCards) {
    saveEventCards.addEventListener('click', async () => {
        await saveEventCardsConfig();
        showToast('Cartes événement enregistrées');
    });
}

if (cleanupOrdersButton) {
    cleanupOrdersButton.addEventListener('click', async () => {
        const keepLast = Number(cleanupKeepLast?.value || 0);
        const olderThanDays = Number(cleanupOlderThan?.value || 0);
        const res = await fetch('/api/orders/cleanup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keepLast, olderThanDays })
        });
        const result = await res.json();
        if (!res.ok) {
            showToast(result.error || 'Erreur de nettoyage');
            return;
        }
        showToast('Base nettoyée');
        fetchOrders();
    });
}

liveForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(liveForm);
    await fetch('/api/live-status', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({
        statut: data.get('statut'),
        titre: data.get('titre'),
        plateforme: data.get('plateforme'),
        lien: data.get('lien'),
        message: data.get('message')
    })});
    showToast('Live mis à jour');
});

logoutButton.addEventListener('click', async () => {
    await fetch('/api/logout', { method:'POST' });
    window.location.href = '/admin/login.html';
});

productsTable.addEventListener('click', async (event) => {
    if (event.target.classList.contains('edit-product')) {
        const id = Number(event.target.dataset.id);
        const product = cachedProducts.find(item => Number(item.id) === id);
        if (product) openEditProductModal(product);
        return;
    }
    if(event.target.classList.contains('delete-product')){
        const id = event.target.dataset.id;
        await fetch(`/api/products/${id}`, { method:'DELETE' });
        fetchProducts();
    }
});

modelsTable.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete-model')) {
        const id = event.target.dataset.id;
        await fetch(`/api/product-models/${id}`, { method: 'DELETE' });
        fetchModels();
        showToast('Modèle supprimé');
    }
});

relationsTable.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete-relation')) {
        const id = event.target.dataset.id;
        await fetch(`/api/product-relations/${id}`, { method: 'DELETE' });
        fetchRelations();
        showToast('Liaison supprimée');
    }
});

ordersTable.addEventListener('change', async (event) => {
    if (event.target.classList.contains('status-select')) {
        const id = event.target.dataset.orderId;
        const statut = event.target.value;
        await fetch(`/api/orders/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ statut })
        });
        fetchOrders();
        showToast('Statut mis à jour');
    }
});

window.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    fetchSiteTexts();
    fetchLive();
    fetchOrders();
    fetchCategories();
});
