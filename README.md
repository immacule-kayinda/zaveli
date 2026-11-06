# ZAVÉLYmarket

Boutique en ligne. Le client parcourt la collection, choisit taille et couleur, puis envoie sa commande sur WhatsApp — depuis une pièce ou depuis le panier. Chaque commande est d'abord enregistrée dans le site, avec un numéro (`ZM-XXXXXX`) repris dans le message WhatsApp. Tout se gère depuis `/admin`, sans toucher au code.

## Lancer

```bash
npm install
npm run dev
```

Le site est sur [http://localhost:3000](http://localhost:3000).

## Administration

Un seul compte, défini par des variables d'environnement (jamais préfixées par `NEXT_PUBLIC_`) :

- `ADMIN_USER`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Les trois doivent être présentes, en local dans `.env.local` et sur Vercel pour la production, les aperçus et le développement. La page de connexion est `/admin/connexion`. Sans fichier de catalogue, la boutique affiche le jeu de départ jusqu'au premier enregistrement.

Les photos vont dans Vercel Blob quand `BLOB_READ_WRITE_TOKEN` est défini. Le catalogue y est réécrit sous un nouveau nom à chaque enregistrement, pour que la boutique lise la dernière version et non une copie mise en cache. En local, sans ce jeton, photos et catalogue restent dans `.data/` et `public/uploads/`. Un enregistrement apparaît dans la boutique sans redéployer les pages.

### Ce que l'administration permet

- **Tableau de bord** : commandes à traiter, ventes sur 30 jours, panier moyen, courbe des 14 derniers jours, pièces les plus commandées.
- **Commandes** : liste avec recherche et filtres par statut, détail, avancement (nouvelle, confirmée, payée, en livraison, livrée, annulée) avec historique, mémo interne, message WhatsApp prêt à envoyer à la cliente, saisie manuelle d'une commande reçue par appel, suppression, export CSV.
- **Collection** : ajout, modification, suppression des pièces, et marque « épuisée » (visible mais non commandable).
- **Clientes** : regroupées d'après le téléphone, avec nombre de commandes et montant acheté.
- **Réglages** : numéro WhatsApp, bandeau du haut, information de livraison dans le panier, et pause des commandes.

Les commandes et les réglages sont stockés comme le catalogue : dans Vercel Blob quand `BLOB_READ_WRITE_TOKEN` est défini (dossiers `orders/` et `settings/`), sinon dans `.data/`. Les prix d'une commande sont toujours relus dans le catalogue côté serveur, jamais pris dans le navigateur.

## Numéro WhatsApp

Le numéro utilisé dans les liens `wa.me` se règle depuis `/admin/reglages`. À défaut, il vient de :

- la variable `NEXT_PUBLIC_WHATSAPP_NUMBER` (voir `.env.example`), au format international sans `+` ;
- sinon la valeur de repli dans `lib/shop.ts`.

## Vérifier

```bash
npm test
npm run lint
npm run build
```
