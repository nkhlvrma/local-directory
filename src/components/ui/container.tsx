import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Not a shadcn primitive — a thin wrapper we use to keep max-widths consistent.
export function Container({
  size = "md",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" }) {
  const max =
    size === "sm" ? "max-w-xl" : size === "lg" ? "max-w-5xl" : "max-w-3xl";
  return (
    <div className={cn("mx-auto w-full px-4", max, className)} {...props} />
  );
}
