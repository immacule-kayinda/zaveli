import { cn } from "@/lib/cn";
import { statusLabels, type OrderStatus } from "@/lib/orders";

const styles: Record<OrderStatus, string> = {
  nouvelle: "bg-clay text-paper",
  confirmee: "bg-blush text-clay-deep",
  payee: "bg-sand text-cocoa",
  expediee: "bg-sand text-cocoa",
  livree: "border border-line bg-paper text-cocoa",
  annulee: "border border-line bg-paper text-muted line-through",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-block rounded-full px-3 py-1 text-xs tracking-wide whitespace-nowrap", styles[status])}>
      {statusLabels[status]}
    </span>
  );
}
