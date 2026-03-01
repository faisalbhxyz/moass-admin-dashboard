"use client";

import Link from "next/link";
import { Home } from "lucide-react";

export function TopBar({
  breadcrumbs,
  title,
  description,
  actions,
}: {
  breadcrumbs: { label: string; href?: string }[];
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="px-6 py-4">
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="flex items-center gap-1 text-gray-500 hover:text-gray-900">
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-gray-300">/</span>
              {b.href ? (
                <Link href={b.href} className="text-gray-600 hover:text-gray-900">
                  {b.label}
                </Link>
              ) : (
                <span className="font-medium text-[var(--teal)]">{b.label}</span>
              )}
            </span>
          ))}
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {title && <h1 className="text-xl font-bold tracking-tight text-gray-900">{title}</h1>}
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </header>
  );
}
