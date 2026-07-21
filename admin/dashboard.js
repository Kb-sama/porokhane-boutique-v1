const countProducts = document.getElementById('count-products');
const countOrders = document.getElementById('count-orders');
const liveStatus = document.getElementById('live-status');
const productsTable = document.querySelector('#products-table tbody');
const modelsTable = document.querySelector('#models-table tbody');
const relationsTable = document.querySelector('#relations-table tbody');
const ordersTable = document.querySelector('#orders-table tbody');
const addProductButton = document.getElementById('add-product');
const productModal = document.getElementById('product-modal');
const cancelProductButton = document.getElementById('cancel-product');
const productForm = document.getElementById('product-form');
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
let cameraStream = null;
let cachedProducts = [];
let eventCards = [];

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
    productForm.reset();
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
            <td>${product.prix}</td>
            <td>${product.stock || 0}</td>
            <td><button data-id="${product.id}" class="delete-product">Supprimer</button></td>
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
    siteTextsInput.value = texts
        .filter(item => !['catalog_categories', 'featured_categories', 'event_cards'].includes(item.key))
        .map(item => `${item.key}=${item.value}`)
        .join('\n');
    if (catalogCategoriesInput) catalogCategoriesInput.value = textMap.get('catalog_categories') || '';
    if (featuredCategoriesInput) featuredCategoriesInput.value = textMap.get('featured_categories') || '';
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

addProductButton.addEventListener('click', openProductModal);
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

    const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) {
        showToast(data.error || 'Erreur lors de l’ajout');
        return;
    }
    closeProductModal();
    showToast('Produit ajouté');
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

saveSiteTexts.addEventListener('click', async () => {
    const lines = siteTextsInput.value.split('\n').map(line => line.trim()).filter(Boolean);
    const requests = lines.map(line => {
        const [key, value] = line.split('=');
        return fetch('/api/site-texts', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ key:key.trim(), value: (value||'').trim() }) });
    });
    await Promise.all(requests);
    showToast('Textes enregistrés');
});

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
});
