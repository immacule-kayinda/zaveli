import type { CartLine } from "@/lib/cart";
import type { OrderLine, Product } from "@/lib/types";

export function toOrderLine(product: Product, size: string, color: string, quantity: number): OrderLine {
  return {
    name: product.name,
    size,
    color,
    sizeKind: product.sizeKind,
    quantity,
    unitPrice: product.price,
  };
}

export function linesFromCart(lines: CartLine[], catalog: Product[]): OrderLine[] {
  const order: OrderLine[] = [];
  for (const line of lines) {
    const product = catalog.find((item) => item.id === line.productId);
    if (!product) continue;
    order.push(toOrderLine(product, line.size, line.color, line.quantity));
  }
  return order;
}

export function cartTotal(lines: CartLine[], catalog: Product[]): number {
  return linesFromCart(lines, catalog).reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}
