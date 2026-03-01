"use client";

import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gray-900 text-white hover:bg-gray-700 transition-colors duration-150",
  secondary:
    "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-150",
  destructive:
    "bg-white border border-red-300 text-red-600 hover:bg-red-50 transition-colors duration-150",
  ghost:
    "text-gray-600 hover:bg-gray-100 transition-colors duration-150",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`rounded-md px-3 py-1.5 text-sm font-medium ${variantClasses[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
