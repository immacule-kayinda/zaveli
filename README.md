# Zaveli

Boutique en ligne. Le client parcourt la collection, choisit taille et couleur, puis envoie sa commande sur WhatsApp — depuis une pièce ou depuis le panier. La collection se modifie depuis `/admin`, sans toucher au code.

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

## Numéro WhatsApp

Le numéro utilisé dans les liens `wa.me` se règle de deux façons :

- la variable `NEXT_PUBLIC_WHATSAPP_NUMBER` (voir `.env.example`), au format international sans `+` ;
- sinon la valeur de repli dans `lib/shop.ts`.

## Vérifier

```bash
npm test
npm run lint
npm run build
```
