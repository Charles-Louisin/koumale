import React from "react";

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-md border border-black/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    />
  );
}
