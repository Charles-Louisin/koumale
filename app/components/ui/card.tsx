import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Card({ className = "", ...props }: CardProps) {
  return <div className={["rounded-lg border border-black/20 bg-white", className].join(" ")} {...props} />;
}

export function CardHeader({ className = "", ...props }: CardProps) {
  return <div className={["p-4", className].join(" ")} {...props} />;
}

export function CardTitle({ className = "", ...props }: CardProps) {
  return <h3 className={["text-lg font-semibold", className].join(" ")} {...props} />;
}

export function CardDescription({ className = "", ...props }: CardProps) {
  return <p className={["text-sm text-black/60", className].join(" ")} {...props} />;
}

export function CardContent({ className = "", ...props }: CardProps) {
  return <div className={["p-4", className].join(" ")} {...props} />;
}

export function CardFooter({ className = "", ...props }: CardProps) {
  return <div className={["p-4", className].join(" ")} {...props} />;
}


