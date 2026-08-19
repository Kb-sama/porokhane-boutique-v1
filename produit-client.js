const cartStorageKey = 'porokhane-panier';
let products = [];
let cart = loadCart();

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(cartStorageKey) || '[]');
        return Array.isArray(saved) ? saved.filter(item => item && item.id && item.nom) : [];
    } catch {
        return [];
    }
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[character]));
}

function formatPrice(product) {
    const price = Number(product.prix || 0);
    const previous = Number(product.prix_avant || 0);
    const priceChange = product.priceChange;
    if (previous > 0 && previous !== price) {
        const percent = priceChange?.changePercent || Math.round(Math.abs(price - previous) / previous * 100);
        const type = priceChange?.changeType || (price < previous ? 'decrease' : 'increase');
        return `<div class="price-stack"><strong class="price-current">${price} FCFA</strong><span class="price-previous">${previous} FCFA</span><small class="price-change ${type}">${type === 'increase' ? '+' : '-'}${percent}%</small></div>`;
    }
    return `<strong class="price-current">${price} FCFA</strong>`;
}

function saveCart() {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const orderSubmit = document.getElementById('order-submit');
    const total = cart.reduce((sum, item) => sum + Number(item.prix || 0) * item.quantite, 0);

    if (cartItems) {
        cartItems.innerHTML = cart.length ? cart.map(item => `
            <div class="cart-item">
                <div><strong>${escapeHtml(item.nom)}</strong><p>${item.quantite} x ${Number(item.prix || 0)} FCFA</p></div>
                <div class="cart-actions">
                    <button type="button" data-cart-action="decrease" data-id="${item.id}">-</button>
                    <button type="button" data-cart-action="increase" data-id="${item.id}">+</button>
                    <button type="button" data-cart-action="remove" data-id="${item.id}">Supprimer</button>
                </div>
            </div>
        `).join('') : '<p class="message-erreur">Votre panier est vide.</p>';
    }
    if (cartTotal) cartTotal.textContent = `Total : ${total} FCFA`;
    if (orderSubmit) orderSubmit.disabled = cart.length === 0;
}

function addToCart(productId) {
    const product = products.find(item => String(item.id) === String(productId));
    if (!product) return;
    const existing = cart.find(item => String(item.id) === String(product.id));
    if (existing) existing.quantite += 1;
    else cart.push({ id: product.id, nom: product.nom, prix: Number(product.prix || 0), quantite: 1 });
    saveCart();
    renderCart();
}

function updateCart(productId, action) {
    const item = cart.find(entry => String(entry.id) === String(productId));
    if (!item) return;
    if (action === 'increase') item.quantite += 1;
    if (action === 'decrease') item.quantite -= 1;
    if (action === 'remove' || item.quantite <= 0) cart = cart.filter(entry => String(entry.id) !== String(productId));
    saveCart();
    renderCart();
}

function renderProducts(list) {
    const container = document.getElementById('liste-produits');
    if (!container) return;
    container.innerHTML = list.length ? list.map(product => `
        <article class="card">
            <div class="image-box"><img src="${escapeHtml(product.image || 'img/logo.jpeg')}" alt="${escapeHtml(product.nom)}"></div>
            <div class="card-content">
                <h3>${escapeHtml(product.nom)}</h3>
                ${formatPrice(product)}
                <p>${escapeHtml(product.description || '')}</p>
                <button class="btn add-to-cart" type="button" data-product-id="${product.id}">Ajouter au panier</button>
            </div>
        </article>
    `).join('') : '<p class="message-erreur">Aucun produit disponible.</p>';
}

function renderFilters() {
    const container = document.getElementById('category-filters');
    if (!container) return;
    const categories = [...new Set(products.map(product => product.categorie).filter(Boolean))];
    container.innerHTML = ['Tous', ...categories].map(category => `<button type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
}

async function loadProducts() {
    const container = document.getElementById('liste-produits');
    try {
        const response = await fetch('/api/public/products');
        if (!response.ok) throw new Error('products request failed');
        products = await response.json();
        renderFilters();
        renderProducts(products);
        renderCart();
    } catch {
        if (container) container.innerHTML = '<p class="message-erreur">Impossible de charger les produits. Rechargez la page.</p>';
    }
}

async function loadPaymentInfo() {
    const container = document.getElementById('payment-info');
    if (!container) return;
    try {
        const response = await fetch('/api/public/payment-instructions');
        if (!response.ok) throw new Error('payment request failed');
        const data = await response.json();
        container.innerHTML = `<strong>Paiement</strong><p>Wave : ${escapeHtml(data.waveNumber)}<br>Orange Money : ${escapeHtml(data.orangeMoneyNumber)}</p><p>${escapeHtml(data.instructions)}</p>`;
    } catch {
        container.textContent = 'Les informations de paiement sont momentanément indisponibles.';
    }
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function submitOrder(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.getElementById('order-message');
    if (!cart.length) {
        message.textContent = 'Votre panier est vide.';
        return;
    }
    const proof = form.waveProof.files[0];
    if (!proof) {
        message.textContent = 'Televersez une preuve de paiement.';
        return;
    }
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.waveProof = await fileToDataUrl(proof);
    payload.items = cart.map(item => ({ nom: item.nom, quantite: item.quantite, prix: item.prix }));
    delete payload.waveProofFile;
    try {
        const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Erreur lors de l envoi de la commande.');
        message.textContent = `Commande ${result.orderNumber} envoyee avec succes.`;
        message.dataset.state = 'success';
        cart = [];
        saveCart();
        renderCart();
        form.reset();
    } catch (error) {
        message.textContent = error.message;
        message.dataset.state = 'error';
    }
}

document.addEventListener('click', event => {
    const productButton = event.target.closest('[data-product-id]');
    if (productButton) addToCart(productButton.dataset.productId);

    const cartButton = event.target.closest('[data-cart-action]');
    if (cartButton) updateCart(cartButton.dataset.id, cartButton.dataset.cartAction);

    const categoryButton = event.target.closest('[data-category]');
    if (categoryButton) {
        const category = categoryButton.dataset.category;
        renderProducts(category === 'Tous' ? products : products.filter(product => product.categorie === category));
    }

    if (event.target.id === 'clear-cart') {
        cart = [];
        saveCart();
        renderCart();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadPaymentInfo();
    renderCart();
    document.getElementById('order-form')?.addEventListener('submit', submitOrder);
});
