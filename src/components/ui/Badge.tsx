import { cn } from "@/lib/utils";

type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

interface BadgeProps {
  status: OrderStatus;
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 text-[10px] tracking-wide uppercase rounded",
        statusStyles[status],
        className
      )}
    >
      {label}
    </span>
  );
}

interface GenericBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: GenericBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 text-[10px] tracking-wide uppercase rounded bg-gray-100 text-gray-800",
        className
      )}
    >
      {children}
    </span>
  );
}
