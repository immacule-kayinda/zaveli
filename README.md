# Zaveli

Boutique en ligne, phase 1. Le client parcourt la collection, choisit taille et couleur, puis envoie sa commande sur WhatsApp — depuis une pièce ou depuis le panier.

## Lancer

```bash
npm install
npm run dev
```

Le site est sur [http://localhost:3000](http://localhost:3000).

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
