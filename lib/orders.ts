import { MAX_QUANTITY } from "@/lib/cart";
import { formatPrice } from "@/lib/money";
import type { OrderLine, Product } from "@/lib/types";

export const statuses = ["nouvelle", "confirmee", "payee", "expediee", "livree", "annulee"] as const;
export type OrderStatus = (typeof statuses)[number];

export const statusLabels: Record<OrderStatus, string> = {
  nouvelle: "Nouvelle",
  confirmee: "Confirmée",
  payee: "Payée",
  expediee: "En livraison",
  livree: "Livrée",
  annulee: "Annulée",
};

export function isStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (statuses as readonly string[]).includes(value);
}

/** Étape suivante proposée dans l'administration. */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  const flow: Partial<Record<OrderStatus, OrderStatus>> = {
    nouvelle: "confirmee",
    confirmee: "payee",
    payee: "expediee",
    expediee: "livree",
  };
  return flow[status] ?? null;
}

export type OrderSource = "site" | "manuelle";

export type StoredLine = OrderLine & { productId: string };

export type OrderEvent = { status: OrderStatus; at: number };

export type Order = {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: OrderStatus;
  source: OrderSource;
  buyerName: string;
  phone: string;
  city: string;
  address: string;
  /** Message laissé par la cliente. */
  note: string;
  /** Mémo réservé à l'équipe. */
  internalNote: string;
  lines: StoredLine[];
  total: number;
  history: OrderEvent[];
};

export type OrderInput = {
  lines: { productId: string; size: string; color: string; quantity: number }[];
  buyerName?: string;
  phone?: string;
  city?: string;
  address?: string;
  note?: string;
};

const ID_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const ORDER_ID_PATTERN = /^ZM-[2-9A-HJKMNP-Z]{6}$/;
export const MAX_ORDER_LINES = 20;

export function newOrderId(random: () => number = Math.random): string {
  let suffix = "";
  for (let index = 0; index < 6; index += 1) {
    suffix += ID_ALPHABET[Math.floor(random() * ID_ALPHABET.length)];
  }
  return `ZM-${suffix}`;
}

/** Chiffres seulement, au format international. Un numéro qui commence par 0 est rattaché à la RDC (243). */
export function normalizePhone(input: string, countryCode = "243"): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `${countryCode}${digits.slice(1)}`;
  return digits;
}

export function phoneLooksValid(digits: string): boolean {
  return digits.length >= 8 && digits.length <= 15;
}

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export function buildOrder(
  input: OrderInput,
  catalog: Product[],
  options: { id: string; now: number; source: OrderSource },
): { ok: true; order: Order } | { ok: false; error: string } {
  if (!Array.isArray(input.lines) || input.lines.length === 0) {
    return { ok: false, error: "Ajoutez au moins un article." };
  }
  if (input.lines.length > MAX_ORDER_LINES) {
    return { ok: false, error: "Trop d'articles dans une seule commande." };
  }

  const lines: StoredLine[] = [];
  for (const entry of input.lines) {
    const product = catalog.find((item) => item.id === entry.productId);
    if (!product) return { ok: false, error: "Une pièce de la commande n'existe plus." };
    if (product.soldOut) return { ok: false, error: `${product.name} est épuisée.` };
    if (!product.sizes.includes(entry.size)) {
      return { ok: false, error: `La taille choisie n'existe pas pour ${product.name}.` };
    }
    if (!product.colors.some((color) => color.name === entry.color)) {
      return { ok: false, error: `La couleur choisie n'existe pas pour ${product.name}.` };
    }
    if (!Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > MAX_QUANTITY) {
      return { ok: false, error: `La quantité va de 1 à ${MAX_QUANTITY}.` };
    }
    const existing = lines.find(
      (line) => line.productId === product.id && line.size === entry.size && line.color === entry.color,
    );
    if (existing) {
      existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + entry.quantity);
      continue;
    }
    lines.push({
      productId: product.id,
      name: product.name,
      size: entry.size,
      color: entry.color,
      sizeKind: product.sizeKind,
      quantity: entry.quantity,
      unitPrice: product.price,
    });
  }

  const rawPhone = clean(input.phone, 30);
  const phone = rawPhone ? normalizePhone(rawPhone) : "";
  if (rawPhone && !phoneLooksValid(phone)) {
    return { ok: false, error: "Le numéro de téléphone n'a pas l'air complet." };
  }

  return {
    ok: true,
    order: {
      id: options.id,
      createdAt: options.now,
      updatedAt: options.now,
      status: "nouvelle",
      source: options.source,
      buyerName: clean(input.buyerName, 60),
      phone,
      city: clean(input.city, 80),
      address: clean(input.address, 200),
      note: clean(input.note, 300),
      internalNote: "",
      lines,
      total: lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
      history: [{ status: "nouvelle", at: options.now }],
    },
  };
}

export function changeStatus(order: Order, status: OrderStatus, now: number): Order {
  if (order.status === status) return order;
  return {
    ...order,
    status,
    updatedAt: now,
    history: [...order.history, { status, at: now }].slice(-30),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseOrder(value: unknown): Order | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !ORDER_ID_PATTERN.test(value.id)) return null;
  if (!isStatus(value.status)) return null;
  if (typeof value.createdAt !== "number" || typeof value.updatedAt !== "number") return null;
  if (!Array.isArray(value.lines) || value.lines.length === 0) return null;

  const lines: StoredLine[] = [];
  for (const line of value.lines) {
    if (!isRecord(line)) return null;
    if (
      typeof line.productId !== "string" ||
      typeof line.name !== "string" ||
      typeof line.size !== "string" ||
      typeof line.color !== "string" ||
      typeof line.quantity !== "number" ||
      typeof line.unitPrice !== "number"
    ) {
      return null;
    }
    const sizeKind = line.sizeKind === "shoe" || line.sizeKind === "unique" ? line.sizeKind : "letter";
    lines.push({
      productId: line.productId,
      name: line.name,
      size: line.size,
      color: line.color,
      sizeKind,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    });
  }

  const history: OrderEvent[] = Array.isArray(value.history)
    ? value.history.flatMap((event) =>
        isRecord(event) && isStatus(event.status) && typeof event.at === "number"
          ? [{ status: event.status, at: event.at }]
          : [],
      )
    : [];

  return {
    id: value.id,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    status: value.status,
    source: value.source === "manuelle" ? "manuelle" : "site",
    buyerName: clean(value.buyerName, 60),
    phone: clean(value.phone, 20),
    city: clean(value.city, 80),
    address: clean(value.address, 200),
    note: clean(value.note, 300),
    internalNote: typeof value.internalNote === "string" ? value.internalNote.slice(0, 1000) : "",
    lines,
    total: lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    history,
  };
}

export function sortNewestFirst(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => b.createdAt - a.createdAt);
}

export function filterOrders(orders: Order[], filter: { status?: string; query?: string }): Order[] {
  const query = (filter.query ?? "").trim().toLocaleLowerCase("fr");
  const queryDigits = query.replace(/\D/g, "");
  return orders.filter((order) => {
    if (filter.status && isStatus(filter.status) && order.status !== filter.status) return false;
    if (!query) return true;
    return (
      order.id.toLocaleLowerCase("fr").includes(query) ||
      order.buyerName.toLocaleLowerCase("fr").includes(query) ||
      order.city.toLocaleLowerCase("fr").includes(query) ||
      order.lines.some((line) => line.name.toLocaleLowerCase("fr").includes(query)) ||
      (queryDigits.length >= 4 && order.phone.includes(queryDigits))
    );
  });
}

// --- Statistiques ---------------------------------------------------------

const DAY = 24 * 60 * 60 * 1000;
/** Kinshasa est à UTC+1, toute l'année. */
const LOCAL_OFFSET = 60 * 60 * 1000;

export function dayKey(timestamp: number): string {
  return new Date(timestamp + LOCAL_OFFSET).toISOString().slice(0, 10);
}

export type Stats = {
  orderCount: number;
  toProcess: number;
  inProgress: number;
  today: number;
  last7Days: number;
  revenue: number;
  revenue30Days: number;
  averageBasket: number;
  byStatus: Record<OrderStatus, number>;
  daily: { day: string; count: number; revenue: number }[];
  topProducts: { productId: string; name: string; quantity: number; revenue: number }[];
};

export function computeStats(orders: Order[], now: number, days = 14): Stats {
  const byStatus = Object.fromEntries(statuses.map((status) => [status, 0])) as Record<OrderStatus, number>;
  const daily = new Map<string, { day: string; count: number; revenue: number }>();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = dayKey(now - offset * DAY);
    daily.set(day, { day, count: 0, revenue: 0 });
  }

  const products = new Map<string, { productId: string; name: string; quantity: number; revenue: number }>();
  const today = dayKey(now);
  let revenue = 0;
  let revenue30Days = 0;
  let last7Days = 0;
  let todayCount = 0;
  let counted = 0;

  for (const order of orders) {
    byStatus[order.status] += 1;
    const bucket = daily.get(dayKey(order.createdAt));
    if (bucket) bucket.count += 1;
    if (dayKey(order.createdAt) === today) todayCount += 1;
    if (order.createdAt > now - 7 * DAY) last7Days += 1;
    if (order.status === "annulee") continue;

    counted += 1;
    revenue += order.total;
    if (order.createdAt > now - 30 * DAY) revenue30Days += order.total;
    if (bucket) bucket.revenue += order.total;
    for (const line of order.lines) {
      const entry = products.get(line.productId) ?? { productId: line.productId, name: line.name, quantity: 0, revenue: 0 };
      entry.quantity += line.quantity;
      entry.revenue += line.quantity * line.unitPrice;
      products.set(line.productId, entry);
    }
  }

  return {
    orderCount: orders.length,
    toProcess: byStatus.nouvelle,
    inProgress: byStatus.confirmee + byStatus.payee + byStatus.expediee,
    today: todayCount,
    last7Days,
    revenue,
    revenue30Days,
    averageBasket: counted > 0 ? Math.round(revenue / counted) : 0,
    byStatus,
    daily: [...daily.values()],
    topProducts: [...products.values()].sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue).slice(0, 5),
  };
}

// --- Clientes -------------------------------------------------------------

export type Customer = {
  key: string;
  name: string;
  phone: string;
  city: string;
  orderCount: number;
  spent: number;
  firstOrderAt: number;
  lastOrderAt: number;
};

export function customersFrom(orders: Order[]): Customer[] {
  const customers = new Map<string, Customer>();
  for (const order of sortNewestFirst(orders)) {
    const name = order.buyerName;
    const key = order.phone
      ? `tel:${order.phone}`
      : name
        ? `nom:${name.toLocaleLowerCase("fr")}|${order.city.toLocaleLowerCase("fr")}`
        : "";
    if (!key) continue;
    const spent = order.status === "annulee" ? 0 : order.total;
    const known = customers.get(key);
    if (!known) {
      customers.set(key, {
        key,
        name,
        phone: order.phone,
        city: order.city,
        orderCount: 1,
        spent,
        firstOrderAt: order.createdAt,
        lastOrderAt: order.createdAt,
      });
      continue;
    }
    known.orderCount += 1;
    known.spent += spent;
    known.firstOrderAt = Math.min(known.firstOrderAt, order.createdAt);
    if (!known.name && name) known.name = name;
    if (!known.city && order.city) known.city = order.city;
  }
  return [...customers.values()].sort((a, b) => b.spent - a.spent || b.lastOrderAt - a.lastOrderAt);
}

// --- Messages WhatsApp à la cliente ---------------------------------------

export function customerMessage(order: Order, shopName: string): string {
  const hello = order.buyerName ? `Bonjour ${order.buyerName},` : "Bonjour,";
  const recap = `commande ${order.id} (${formatPrice(order.total)})`;
  switch (order.status) {
    case "nouvelle":
      return `${hello} nous avons bien reçu votre ${recap}. Nous revenons vers vous très vite pour la confirmer. — ${shopName}`;
    case "confirmee":
      return `${hello} votre ${recap} est confirmée. Nous la préparons. — ${shopName}`;
    case "payee":
      return `${hello} nous avons bien reçu le paiement de votre ${recap}. Merci ! — ${shopName}`;
    case "expediee":
      return `${hello} votre ${recap} est en route. Nous vous appelons à l'arrivée du livreur. — ${shopName}`;
    case "livree":
      return `${hello} votre ${recap} a été livrée. Merci pour votre confiance, et à très bientôt ! — ${shopName}`;
    case "annulee":
      return `${hello} votre ${recap} a été annulée. Écrivez-nous si vous souhaitez la reprendre. — ${shopName}`;
  }
}

// --- Export ---------------------------------------------------------------

export function ordersToCsv(orders: Order[]): string {
  const header = ["Numéro", "Date", "Statut", "Origine", "Nom", "Téléphone", "Ville", "Adresse", "Articles", "Total ($)", "Message", "Mémo interne"];
  const rows = sortNewestFirst(orders).map((order) => [
    order.id,
    new Date(order.createdAt + LOCAL_OFFSET).toISOString().slice(0, 16).replace("T", " "),
    statusLabels[order.status],
    order.source === "site" ? "Site" : "Saisie manuelle",
    order.buyerName,
    order.phone,
    order.city,
    order.address,
    order.lines.map((line) => `${line.quantity}x ${line.name} (${line.size}${line.color ? `, ${line.color}` : ""})`).join(" ; "),
    String(order.total),
    order.note,
    order.internalNote,
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n");
}

function csvCell(value: string): string {
  // Un tableur exécute une cellule qui commence par = + - @ : on la neutralise.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[;"\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}
