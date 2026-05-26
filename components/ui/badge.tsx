import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "danger" | "outline";

const variants: Record<Variant, string> = {
  default: "border border-primary/30 bg-primary/10 text-primary",
  success: "border border-success/30 bg-success/10 text-success",
  warning: "border border-warning/35 bg-warning/10 text-warning",
  danger: "border border-destructive/35 bg-destructive/10 text-destructive",
  outline: "border border-border bg-secondary/40 text-muted-foreground",
};

export function Badge({
  variant = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
