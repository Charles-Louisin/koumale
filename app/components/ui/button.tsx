import React from "react";

export function Button({ 
  variant = "default", 
  size = "md", 
  className = "", 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "icon";
}) {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
  
  const variantClasses = {
    default: "bg-primary text-white hover:opacity-90",
    outline: "border border-black/20 bg-white text-black hover:bg-black/10",
    ghost: "bg-transparent text-black hover:bg-black/10",
  };
  
  const sizeClasses = {
    sm: "h-9 px-3",
    md: "h-10 px-4",
    icon: "h-10 w-10 p-0",
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
