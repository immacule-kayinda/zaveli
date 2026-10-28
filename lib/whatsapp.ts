import { formatPrice } from "@/lib/money";
import { shop } from "@/lib/shop";
import type { OrderDetails, OrderLine } from "@/lib/types";

function variantLabel(line: OrderLine): string {
  const size =
    line.sizeKind === "unique"
      ? "Taille unique"
      : line.sizeKind === "shoe"
        ? `Pointure ${line.size}`
        : `Taille ${line.size}`;

  return line.color ? `${size}, Couleur ${line.color}` : size;
}

export function buildOrderMessage(lines: OrderLine[], details?: OrderDetails): string {
  const articles = lines
    .map((line) => {
      const lineTotal = line.unitPrice * line.quantity;
      return `- ${line.name} (${variantLabel(line)}) x${line.quantity} — ${formatPrice(lineTotal)}`;
    })
    .join("\n");

  const total = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  const parts = [
    "Bonjour ! Je souhaite passer la commande suivante :",
    "",
    "🛍️ ARTICLES :",
    articles,
    "",
    `💰 TOTAL : ${formatPrice(total)}`,
  ];

  const notes: string[] = [];
  const buyerName = details?.buyerName?.trim();
  const city = details?.city?.trim();
  if (buyerName) notes.push(`👤 Prénom : ${buyerName}`);
  if (city) notes.push(`📍 Livraison : ${city}`);
  if (notes.length > 0) parts.push("", notes.join("\n"));

  parts.push("", "Merci de me confirmer la disponibilité et les modalités de livraison.");
  return parts.join("\n");
}

export function buildGreetingMessage(): string {
  return `Bonjour ${shop.name}, j'aimerais des informations avant de commander.`;
}

export function whatsAppUrl(message: string, phone: string = shop.whatsappNumber): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
