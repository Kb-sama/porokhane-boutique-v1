# Déploiement rapide

## En local
1. Ouvre un terminal dans ce dossier.
2. Lance :
   ```bash
   npm install
   npm start
   ```
3. Ouvre :
   - `http://localhost:3000`
   - `http://localhost:3000/admin/login.html`

## Sur Render
1. Crée un nouveau service Web.
2. Mets ce dépôt.
3. Commande de build : `npm install`
4. Commande de démarrage : `npm start`
5. Ajoute les variables :
   - `NODE_ENV=production`
   - `SESSION_SECRET=un_texte_secret`
   - `ADMIN_PASSWORD=ton_mot_de_passe`
   - `WAVE_NUMBER=+221...`
   - `DATABASE_PATH=/var/data/boutique.db` si tu montes un disque persistant Render

## Persistance de la base
- En local, SQLite reste dans `database/boutique.db`.
- Sur Render, il faut un disque persistant si tu veux conserver les commandes, produits et comptes admin entre les déploiements.
- Sans disque persistant, la base sera recréée après redéploiement.

## Connexion admin
- Email : `admin@boutique.local`
- Mot de passe : celui de `ADMIN_PASSWORD`

## Pages utiles
- Accueil : `/`
- Produits : `/produit.html`
- Live : `/live.html`
- Contact : `/contacte.html`
- Admin : `/admin/login.html`
