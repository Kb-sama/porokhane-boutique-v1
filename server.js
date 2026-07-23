const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const localDbPath = path.join(__dirname, 'database', 'boutique.db');
const defaultDbPath = process.env.RENDER
  ? '/var/data/boutique.db'
  : localDbPath;
const dbPath = resolveDatabasePath(process.env.DATABASE_PATH || defaultDbPath, localDbPath);
const sessionSecret = process.env.SESSION_SECRET || 'porokhane-secret';
const defaultAdminEmail = process.env.ADMIN_EMAIL || 'mame79915@gmail.com';
const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'V7!qR2#nL9@xP4$kZ8&mT6';
const waveNumber = process.env.WAVE_NUMBER || '+221771509100';
const orangeMoneyNumber = process.env.ORANGE_MONEY_NUMBER || '+221774137575';
const contactWhatsApp = process.env.CONTACT_WHATSAPP || '+221774137575';
const tiktokUrl = process.env.TIKTOK_URL || 'https://www.tiktok.com/@prokhanesagnsevip?is_from_webapp=1&sender_device=pc';
const instagramUrl = process.env.INSTAGRAM_URL || 'https://www.instagram.com/porokhane_sagnese_vip?igsh=dDR5eWNicXBvd3di';
const orderProofDir = path.join(__dirname, 'uploads', 'orders');
const orderProofRetentionDays = Number(process.env.ORDER_PROOF_RETENTION_DAYS || 30);
const isProduction = process.env.NODE_ENV === 'production';

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.set('trust proxy', 1);
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 8
  }
}));

function resolveDatabasePath(preferredPath, fallbackPath) {
  const candidates = [preferredPath, fallbackPath];

  for (const candidate of candidates) {
    const candidateDir = path.dirname(candidate);
    const resolvedDir = path.resolve(candidateDir);
    const workspaceRoot = path.resolve(__dirname);
    const isWorkspacePath = resolvedDir === workspaceRoot || resolvedDir.startsWith(`${workspaceRoot}${path.sep}`);

    try {
      if (!fs.existsSync(candidateDir)) {
        if (!isWorkspacePath) {
          throw Object.assign(new Error('Database directory is outside the workspace'), { code: 'EACCES' });
        }
        fs.mkdirSync(candidateDir, { recursive: true });
      }

      fs.accessSync(candidateDir, fs.constants.W_OK | fs.constants.X_OK);
      return candidate;
    } catch (error) {
      console.warn(`Database directory ${candidateDir} is not writable (${error.code || error.message}); trying fallback.`);
    }
  }

  throw new Error(`Unable to create a writable database directory for ${preferredPath} or ${fallbackPath}`);
}

app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/accueil.html', (req, res) => res.sendFile(path.join(__dirname, 'accueil.html')));
app.get('/produit.html', (req, res) => res.sendFile(path.join(__dirname, 'produit.html')));
app.get('/contacte.html', (req, res) => res.sendFile(path.join(__dirname, 'contacte.html')));
app.get('/live.html', (req, res) => res.sendFile(path.join(__dirname, 'live.html')));
app.get('/politique-confidentialite.html', (req, res) => res.sendFile(path.join(__dirname, 'politique-confidentialite.html')));
app.get('/style.css', (req, res) => res.sendFile(path.join(__dirname, 'style.css')));
app.get('/script.js', (req, res) => res.sendFile(path.join(__dirname, 'script.js')));
app.get('/live.js', (req, res) => res.sendFile(path.join(__dirname, 'live.js')));
app.get('/admin/admin.css', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'admin.css')));
app.get('/admin/login.js', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'login.js')));
app.get('/admin/dashboard.js', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'dashboard.js')));

const db = new sqlite3.Database(dbPath);

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

function generateOrderNumber() {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PK-${Date.now()}-${random}`;
}

function ensureOrderProofDir() {
  if (!fs.existsSync(orderProofDir)) {
    fs.mkdirSync(orderProofDir, { recursive: true });
  }
}

function saveOrderProof(dataUrl, orderNumber) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) return null;
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1];
  const base64 = match[2];
  const extension = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
  ensureOrderProofDir();
  const fileName = `${orderNumber}-${Date.now()}.${extension}`;
  const relativePath = path.posix.join('uploads', 'orders', fileName);
  const absolutePath = path.join(orderProofDir, fileName);
  fs.writeFileSync(absolutePath, Buffer.from(base64, 'base64'));
  return `/${relativePath}`.replace(/\\/g, '/');
}

function cleanupOldOrderProofs(retentionDays = orderProofRetentionDays) {
  const days = Number.isFinite(retentionDays) ? retentionDays : 30;
  if (days <= 0) return;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  ensureOrderProofDir();
  fs.readdir(orderProofDir, (err, files) => {
    if (err) return;
    files.forEach((file) => {
      const fullPath = path.join(orderProofDir, file);
      fs.stat(fullPath, (statErr, stats) => {
        if (statErr) return;
        if (stats.mtimeMs < cutoff) {
          fs.unlink(fullPath, () => {});
        }
      });
    });
  });
}

function validateProductPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return { valid: false, errors: ['Payload invalide'] };

  const nom = String(payload.nom || '').trim();
  const description = String(payload.description || '').trim();
  const categorie = String(payload.categorie || '').trim();
  const productType = String(payload.productType || 'autre').trim().toLowerCase();
  const image = String(payload.image || '').trim();
  const prix = Number(payload.prix);
  const stock = Number(payload.stock);
  const promotion = Number(payload.promotion || 0);
  const disponible = Number(payload.disponible ?? 1);

  if (!nom) errors.push('Le nom du produit est requis');
  if (!['tissue', 'robe', 'sac', 'chaussure', 'colier', 'autre'].includes(productType)) errors.push('Le type du produit est invalide');
  if (!Number.isFinite(prix) || prix < 0) errors.push('Le prix doit être un nombre positif');
  if (!Number.isFinite(stock) || stock < 0) errors.push('Le stock doit être un nombre positif');
  if (!Number.isFinite(promotion) || promotion < 0) errors.push('La promotion doit être un nombre positif');
  if (![0, 1].includes(disponible)) errors.push('La disponibilité doit être 0 ou 1');

  return {
    valid: errors.length === 0,
    errors,
    cleaned: {
      nom,
      description,
      categorie,
      productType,
      image: image || 'img/logo.jpeg',
      prix: Math.round(prix),
      stock: Math.round(stock),
      promotion: Math.round(promotion),
      disponible: disponible === 1 ? 1 : 0,
    }
  };
}

function computePriceChange(currentPrice, previousPrice) {
  const current = Number(currentPrice);
  const previous = Number(previousPrice);
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0 || current === previous) {
    return null;
  }

  return {
    oldPrice: Math.round(previous),
    currentPrice: Math.round(current),
    changePercent: Math.round((Math.abs(current - previous) / previous) * 100),
    changeType: current < previous ? 'decrease' : 'increase'
  };
}

function normalizeCategoryName(value) {
  return String(value || '').trim();
}

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    description TEXT,
    categorie TEXT,
    product_type TEXT DEFAULT 'autre',
    prix INTEGER,
    prix_avant INTEGER,
    stock INTEGER,
    promotion INTEGER DEFAULT 0,
    image TEXT,
    disponible INTEGER DEFAULT 1
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS product_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    nom TEXT NOT NULL,
    image TEXT,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS product_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    robe_product_id INTEGER NOT NULL,
    tissue_product_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(robe_product_id, tissue_product_id),
    FOREIGN KEY(robe_product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY(tissue_product_id) REFERENCES products(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS site_texts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE,
    value TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER DEFAULT NULL,
    image TEXT DEFAULT '',
    description TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(parent_id) REFERENCES categories(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS whatsapp_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT,
    numero TEXT,
    message TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS custom_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    description TEXT NOT NULL,
    accent TEXT DEFAULT '',
    date TEXT DEFAULT '',
    image TEXT DEFAULT '',
    ordre INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS live_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    statut TEXT,
    titre TEXT,
    plateforme TEXT,
    lien TEXT,
    message TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_commande TEXT UNIQUE,
    client_nom TEXT,
    telephone TEXT,
    adresse TEXT,
    ville TEXT,
    commentaire TEXT,
    statut TEXT DEFAULT 'en_attente',
    montant_total INTEGER DEFAULT 0,
    wave_numero TEXT,
    preuve_paiement TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    nom TEXT,
    quantite INTEGER,
    prix INTEGER,
    total INTEGER,
    FOREIGN KEY(order_id) REFERENCES orders(id)
  )`);

  db.run(`
    INSERT INTO users (email, password, role)
    VALUES (?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      password = excluded.password,
      role = excluded.role
  `, [
    defaultAdminEmail,
    hashPassword(defaultAdminPassword),
    'administrateur'
  ]);
  db.run(`INSERT OR IGNORE INTO live_status (id, statut, titre, plateforme, lien, message)
    VALUES (1, 'off', 'Pas de live pour le moment', 'TikTok', '${tiktokUrl}', 'Notre prochain live commence bientôt.')`);
  db.run(`INSERT OR IGNORE INTO site_texts (key, value) VALUES
    ('hero_title', 'Bienvenue chez Porokhane'),
    ('hero_subtitle', 'Découvrez notre collection'),
    ('button_text', 'Commander maintenant')`);
  db.run(`INSERT OR IGNORE INTO whatsapp_links (label, numero, message) VALUES
    ('Service Client', '${contactWhatsApp}', 'Bonjour je souhaite commander.')`);
  db.run(`ALTER TABLE products ADD COLUMN product_type TEXT DEFAULT 'autre'`, () => {});
  db.run(`ALTER TABLE products ADD COLUMN prix_avant INTEGER`, () => {});
});

function requireLogin(req, res, next) {
  if (req.session && req.session.user) return next();
  if (req.path.endsWith('.html') || req.path === '/admin' || req.path === '/admin/') {
    return res.redirect('/admin/login.html');
  }
  return res.status(401).json({ error: 'Non authentifié' });
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' }
});

app.post('/api/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Identifiants invalides' });
    if (!verifyPassword(password, user.password)) return res.status(401).json({ error: 'Identifiants invalides' });
    req.session.user = { id: user.id, email: user.email, role: user.role };
    req.session.save((saveErr) => {
      if (saveErr) {
        return res.status(500).json({ error: 'Impossible de créer la session' });
      }
      res.json({ success: true });
    });
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/products', requireLogin, (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    db.all('SELECT * FROM product_models', [], (modelErr, models) => {
      if (modelErr) return res.status(500).json({ error: modelErr.message });
      db.all('SELECT * FROM product_relations', [], (relationErr, relations) => {
        if (relationErr) return res.status(500).json({ error: relationErr.message });
        const modelsByProduct = models.reduce((acc, model) => {
          if (!acc[model.product_id]) acc[model.product_id] = [];
          acc[model.product_id].push(model);
          return acc;
        }, {});
        const relationsByRobe = relations.reduce((acc, relation) => {
          if (!acc[relation.robe_product_id]) acc[relation.robe_product_id] = [];
          acc[relation.robe_product_id].push(relation.tissue_product_id);
          return acc;
        }, {});
        res.json(rows.map(product => ({
          ...product,
          models: modelsByProduct[product.id] || [],
          linked_tissues: relationsByRobe[product.id] || []
        })));
      });
    });
  });
});

app.post('/api/products', requireLogin, (req, res) => {
  const validation = validateProductPayload(req.body);
  if (!validation.valid) return res.status(400).json({ error: validation.errors.join(', ') });

  const { nom, description, categorie, productType, prix, stock, promotion, image, disponible } = validation.cleaned;
  db.run(`INSERT INTO products (nom, description, categorie, product_type, prix, prix_avant, stock, promotion, image, disponible)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [nom, description, categorie, productType, prix, null, stock, promotion, image, disponible], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.put('/api/products/:id', requireLogin, (req, res) => {
  const validation = validateProductPayload(req.body);
  if (!validation.valid) return res.status(400).json({ error: validation.errors.join(', ') });

  const { id } = req.params;
  const { nom, description, categorie, productType, prix, stock, promotion, image, disponible } = validation.cleaned;
  db.get('SELECT prix FROM products WHERE id = ?', [id], (selectErr, existing) => {
    if (selectErr) return res.status(500).json({ error: selectErr.message });
    if (!existing) return res.status(404).json({ error: 'Produit introuvable' });

    const priceChange = computePriceChange(prix, existing.prix);
    const previousPrice = priceChange ? existing.prix : null;

    db.run(`UPDATE products SET nom = ?, description = ?, categorie = ?, product_type = ?, prix = ?, prix_avant = ?, stock = ?, promotion = ?, image = ?, disponible = ? WHERE id = ?`,
      [nom, description, categorie, productType, prix, previousPrice, stock, promotion, image, disponible, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes, priceChange });
      });
    });
});

app.delete('/api/products/:id', requireLogin, (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.get('/api/site-texts', requireLogin, (req, res) => {
  db.all('SELECT * FROM site_texts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/site-texts', requireLogin, (req, res) => {
  const { key, value } = req.body;
  db.run('INSERT OR REPLACE INTO site_texts (key, value) VALUES (?, ?)', [key, value], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get('/api/live-status', requireLogin, (req, res) => {
  db.all('SELECT * FROM live_status', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/live-status', requireLogin, (req, res) => {
  const { statut, titre, plateforme, lien, message } = req.body;
  db.run('DELETE FROM live_status', [], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run('INSERT INTO live_status (statut, titre, plateforme, lien, message) VALUES (?, ?, ?, ?, ?)',
      [statut, titre, plateforme, lien, message], function(err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ success: true });
      });
  });
});

app.get('/api/public/products', (req, res) => {
  db.all('SELECT id, nom, categorie, prix, prix_avant, image, stock, disponible, description FROM products WHERE disponible = 1', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map((product) => ({
      ...product,
      priceChange: computePriceChange(product.prix, product.prix_avant)
    })));
  });
});

app.get('/api/public/live', (req, res) => {
  db.get('SELECT * FROM live_status ORDER BY id DESC LIMIT 1', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || {});
  });
});

app.get('/api/public/site-texts', (req, res) => {
  db.all('SELECT key, value FROM site_texts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const payload = rows.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
    res.json(payload);
  });
});

app.get('/api/public/whatsapp', (req, res) => {
  db.all('SELECT label, numero, message FROM whatsapp_links', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/product-models', requireLogin, (req, res) => {
  const productId = Number(req.query.productId);
  const params = Number.isFinite(productId) ? [productId] : [];
  const query = Number.isFinite(productId)
    ? 'SELECT * FROM product_models WHERE product_id = ? ORDER BY id DESC'
    : 'SELECT * FROM product_models ORDER BY id DESC';
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/product-models', requireLogin, (req, res) => {
  const productId = Number(req.body.productId);
  const nom = String(req.body.nom || '').trim();
  const image = String(req.body.image || '').trim();
  const description = String(req.body.description || '').trim();

  if (!Number.isInteger(productId) || productId <= 0) return res.status(400).json({ error: 'Produit invalide' });
  if (!nom) return res.status(400).json({ error: 'Le nom du modèle est requis' });

  db.run('INSERT INTO product_models (product_id, nom, image, description) VALUES (?, ?, ?, ?)',
    [productId, nom, image, description], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

app.delete('/api/product-models/:id', requireLogin, (req, res) => {
  db.run('DELETE FROM product_models WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.get('/api/product-relations', requireLogin, (req, res) => {
  db.all('SELECT * FROM product_relations ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/product-relations', requireLogin, (req, res) => {
  const robeProductId = Number(req.body.robeProductId);
  const tissueProductId = Number(req.body.tissueProductId);
  if (!Number.isInteger(robeProductId) || robeProductId <= 0 || !Number.isInteger(tissueProductId) || tissueProductId <= 0) {
    return res.status(400).json({ error: 'Relation invalide' });
  }
  if (robeProductId === tissueProductId) {
    return res.status(400).json({ error: 'La robe et le tissu doivent être différents' });
  }

  db.run('INSERT OR IGNORE INTO product_relations (robe_product_id, tissue_product_id) VALUES (?, ?)',
    [robeProductId, tissueProductId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, inserted: this.changes });
    });
});

app.delete('/api/product-relations/:id', requireLogin, (req, res) => {
  db.run('DELETE FROM product_relations WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.get('/api/public/events', (req, res) => {
  res.json([
    {
      titre: 'Nouvelle collection',
      date: 'Chaque semaine',
      description: 'Des arrivages sélectionnés de sacs, robes et chaussures sont publiés en priorité sur la page d accueil.',
      accent: 'Collection'
    },
    {
      titre: 'Annonces live',
      date: 'Avant chaque direct',
      description: 'Les prochains lives sont mis en avant pour permettre aux clients de se préparer et poser leurs questions.',
      accent: 'Live'
    },
    {
      titre: 'Offres WhatsApp',
      date: 'Disponible maintenant',
      description: 'Les promotions et la disponibilité des produits sont partagées en un clic vers WhatsApp.',
      accent: 'Promo'
    },
    {
      titre: 'Commandes rapides',
      date: '24h/24',
      description: 'Le panier et les options de paiement sont optimisés pour finaliser une commande sans friction.',
      accent: 'Commande'
    }
  ]);
});

app.get('/api/public/payment-instructions', (req, res) => {
  res.json({
    waveNumber,
    orangeMoneyNumber,
    beneficiaire: 'Diary Diop',
    whatsappNumber: '221774137575',
    instructions: 'Wave et Orange Money acceptent les deux numéros. Prenez une capture d écran de confirmation, puis téléversez-la dans le formulaire de commande.'
  });
});

app.get('/api/categories', requireLogin, (req, res) => {
  db.all('SELECT * FROM categories ORDER BY COALESCE(parent_id, id), parent_id IS NOT NULL, name ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    db.all('SELECT categorie, COUNT(*) AS count FROM products WHERE categorie IS NOT NULL AND categorie != "" GROUP BY categorie', [], (countErr, counts) => {
      if (countErr) return res.status(500).json({ error: countErr.message });
      const countMap = counts.reduce((acc, row) => {
        acc[String(row.categorie).toLowerCase()] = row.count;
        return acc;
      }, {});
      res.json(rows.map((category) => ({
        ...category,
        productCount: countMap[String(category.name).toLowerCase()] || 0
      })));
    });
  });
});

app.get('/api/public/categories', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY COALESCE(parent_id, id), parent_id IS NOT NULL, name ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/categories', requireLogin, (req, res) => {
  const name = normalizeCategoryName(req.body.name);
  const parentId = req.body.parentId === '' || req.body.parentId === null || req.body.parentId === undefined ? null : Number(req.body.parentId);
  const image = String(req.body.image || '').trim();
  const description = String(req.body.description || '').trim();
  if (!name) return res.status(400).json({ error: 'Le nom de la catégorie est requis' });
  if (parentId !== null && (!Number.isInteger(parentId) || parentId <= 0)) return res.status(400).json({ error: 'Catégorie parent invalide' });

  db.run('INSERT INTO categories (name, parent_id, image, description) VALUES (?, ?, ?, ?)', [name, parentId, image, description], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.put('/api/categories/:id', requireLogin, (req, res) => {
  const id = Number(req.params.id);
  const name = normalizeCategoryName(req.body.name);
  const parentId = req.body.parentId === '' || req.body.parentId === null || req.body.parentId === undefined ? null : Number(req.body.parentId);
  const image = String(req.body.image || '').trim();
  const description = String(req.body.description || '').trim();
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Catégorie invalide' });
  if (!name) return res.status(400).json({ error: 'Le nom de la catégorie est requis' });
  if (parentId !== null && (!Number.isInteger(parentId) || parentId <= 0 || parentId === id)) return res.status(400).json({ error: 'Catégorie parent invalide' });

  db.run('UPDATE categories SET name = ?, parent_id = ?, image = ?, description = ? WHERE id = ?', [name, parentId, image, description, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

app.delete('/api/categories/:id', requireLogin, (req, res) => {
  db.run('DELETE FROM categories WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.post('/api/orders', (req, res) => {
  const { clientNom, telephone, adresse, ville, commentaire, items, waveProof } = req.body;
  const normalizedItems = Array.isArray(items)
    ? items.map(item => ({
      nom: String(item.nom || '').trim(),
      quantite: Number(item.quantite || 0),
      prix: Number(item.prix || 0)
    })).filter(item => item.nom && item.quantite > 0 && Number.isFinite(item.prix) && item.prix >= 0)
    : [];

  if (!clientNom || !telephone || !adresse || !ville || !waveProof || typeof waveProof !== 'string' || !waveProof.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Informations incomplètes. Vérifiez le formulaire et la preuve de paiement.' });
  }

  if (normalizedItems.length === 0) {
    return res.status(400).json({ error: 'Ajoutez au moins un produit au panier.' });
  }

  const total = normalizedItems.reduce((sum, item) => sum + item.prix * item.quantite, 0);
  const numeroCommande = generateOrderNumber();
  const proofPath = saveOrderProof(waveProof, numeroCommande);

  if (!proofPath) {
    return res.status(400).json({ error: 'La preuve de paiement doit être une image valide.' });
  }

  db.run(`INSERT INTO orders (numero_commande, client_nom, telephone, adresse, ville, commentaire, statut, montant_total, wave_numero, preuve_paiement)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [numeroCommande, String(clientNom).trim(), String(telephone).trim(), String(adresse).trim(), String(ville).trim(), String(commentaire || '').trim(), 'en_attente', total, waveNumber, proofPath],
  function(err) {
    if (err) return res.status(500).json({ error: err.message });

    const orderId = this.lastID;
    let completed = 0;
    let failed = false;

    normalizedItems.forEach(item => {
      db.run(`INSERT INTO order_items (order_id, nom, quantite, prix, total)
              VALUES (?, ?, ?, ?, ?)`,
      [orderId, item.nom, item.quantite, item.prix, item.prix * item.quantite],
      function(itemErr) {
        if (failed) return;
        if (itemErr) {
          failed = true;
          return res.status(500).json({ error: itemErr.message });
        }
        completed += 1;
        if (completed === normalizedItems.length) {
          res.json({ success: true, orderNumber: numeroCommande, total });
        }
      });
    });
  });
});

app.get('/api/orders', requireLogin, (req, res) => {
  db.all('SELECT * FROM orders ORDER BY id DESC', [], (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    db.all('SELECT * FROM order_items ORDER BY id ASC', [], (itemErr, items) => {
      if (itemErr) return res.status(500).json({ error: itemErr.message });
      const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.order_id]) acc[item.order_id] = [];
        acc[item.order_id].push(item);
        return acc;
      }, {});
      res.json(orders.map(order => ({ ...order, items: groupedItems[order.id] || [] })));
    });
  });
});

app.patch('/api/orders/:id/status', requireLogin, (req, res) => {
  const allowed = ['en_attente', 'a_verifier', 'confirme', 'preparee', 'expediee', 'livree', 'annulee'];
  const { statut } = req.body;
  if (!allowed.includes(statut)) return res.status(400).json({ error: 'Statut invalide.' });

  db.run('UPDATE orders SET statut = ? WHERE id = ?', [statut, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, updated: this.changes });
  });
});

app.post('/api/orders/cleanup', requireLogin, (req, res) => {
  const keepLast = Math.max(0, Number(req.body.keepLast || 0));
  const olderThanDays = Math.max(0, Number(req.body.olderThanDays || 0));

  const deleteByAge = () => {
    if (!olderThanDays) return Promise.resolve({ deletedOrders: 0, deletedItems: 0 });
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString();
    return new Promise((resolve, reject) => {
      db.all('SELECT id FROM orders WHERE created_at < ? ORDER BY id ASC', [cutoff], (err, rows) => {
        if (err) return reject(err);
        const ids = rows.map(row => row.id);
        if (!ids.length) return resolve({ deletedOrders: 0, deletedItems: 0 });
        const placeholders = ids.map(() => '?').join(',');
        db.run(`DELETE FROM order_items WHERE order_id IN (${placeholders})`, ids, function(err2) {
          if (err2) return reject(err2);
          db.run(`DELETE FROM orders WHERE id IN (${placeholders})`, ids, function(err3) {
            if (err3) return reject(err3);
            resolve({ deletedOrders: rows.length, deletedItems: this.changes });
          });
        });
      });
    });
  };

  const deleteByKeepLast = () => {
    if (!keepLast) return Promise.resolve({ deletedOrders: 0, deletedItems: 0 });
    return new Promise((resolve, reject) => {
      db.all('SELECT id FROM orders ORDER BY id DESC LIMIT -1 OFFSET ?', [keepLast], (err, rows) => {
        if (err) return reject(err);
        const ids = rows.map(row => row.id);
        if (!ids.length) return resolve({ deletedOrders: 0, deletedItems: 0 });
        const placeholders = ids.map(() => '?').join(',');
        db.run(`DELETE FROM order_items WHERE order_id IN (${placeholders})`, ids, function(err2) {
          if (err2) return reject(err2);
          db.run(`DELETE FROM orders WHERE id IN (${placeholders})`, ids, function(err3) {
            if (err3) return reject(err3);
            resolve({ deletedOrders: rows.length, deletedItems: this.changes });
          });
        });
      });
    });
  };

  deleteByAge()
    .then(() => deleteByKeepLast())
    .then((result) => res.json({ success: true, ...result }))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.get('/admin/login.html', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'login.html')));
app.get('/admin/dashboard.html', requireLogin, (req, res) => res.sendFile(path.join(__dirname, 'admin', 'dashboard.html')));
app.get('/admin/*', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', req.path.replace('/admin/', '')));
});

if (require.main === module) {
  cleanupOldOrderProofs();
  setInterval(() => cleanupOldOrderProofs(), 1000 * 60 * 60 * 6);
  app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
}

module.exports = { app, db, hashPassword, verifyPassword, validateProductPayload, resolveDatabasePath };
