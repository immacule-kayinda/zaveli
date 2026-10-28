/** Affiche un montant entier comme dans les messages de commande : 25$, 1 200$. */
export function formatPrice(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
  return `${sign}${grouped}$`;
}
