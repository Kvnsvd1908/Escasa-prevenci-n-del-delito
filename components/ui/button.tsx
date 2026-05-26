import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost" | "destructive" | "success";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const variants: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground shadow-[0_0_22px_rgba(14,165,233,0.22)] hover:bg-primary/90",
  outline: "border border-border bg-secondary/60 text-foreground hover:border-primary/60 hover:bg-accent",
  ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
  destructive: "bg-destructive text-destructive-foreground shadow-[0_0_18px_rgba(239,68,68,0.18)] hover:bg-destructive/90",
  success: "bg-success text-white shadow-[0_0_18px_rgba(34,197,94,0.18)] hover:bg-success/90",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3",
  md: "h-10 px-4",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  )
);
Button.displayName = "Button";
