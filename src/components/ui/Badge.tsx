"use client";

const statusStyles: Record<string, string> = {
  accepted: "bg-green-100 text-green-700",
  paid: "bg-green-100 text-green-700",
  delivered: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  awaits_allocation: "bg-orange-100 text-orange-600",
  pending: "bg-orange-100 text-orange-600",
  shipped: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-600",
  rejected: "bg-red-100 text-red-600",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-600",
  default: "bg-gray-100 text-gray-700",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: keyof typeof statusStyles | string;
  className?: string;
}) {
  const style = statusStyles[variant] ?? statusStyles.default;
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${style} ${className}`}
    >
      {children}
    </span>
  );
}
