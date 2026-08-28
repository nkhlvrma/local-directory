import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Not a shadcn primitive — a thin wrapper we use to keep widths consistent.
// "sm" (forms) stays a fixed narrow column for readability. "md"/"lg" scale
// with the viewport (75%/85%) from tablet width up, with a generous cap so
// lines don't get absurdly long on ultra-wide monitors. Mobile always gets
// full width + padding regardless of size.
export function Container({
  size = "md",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" }) {
  if (size === "sm") {
    return (
      <div
        className={cn("mx-auto w-full max-w-xl px-4", className)}
        {...props}
      />
    );
  }

  const width = size === "lg" ? "md:w-[85%]" : "md:w-[75%]";
  const cap = size === "lg" ? "max-w-[1800px]" : "max-w-[1600px]";

  return (
    <div
      className={cn("mx-auto w-full px-4 md:px-0", width, cap, className)}
      {...props}
    />
  );
}
