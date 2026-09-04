import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-pill border px-6 text-sm font-medium transition-[background,color,border-color,transform] duration-300 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary:
          "border-ink bg-ink text-bone hover:bg-transparent hover:text-ink",
        outline:
          "border-ink bg-transparent text-ink hover:bg-ink hover:text-bone",
        subtle:
          "border-transparent bg-black/[0.055] text-ink hover:bg-black/[0.1]",
        inverse:
          "border-bone bg-bone text-ink hover:bg-transparent hover:text-bone",
        ghost:
          "border-transparent bg-transparent px-2 text-ink hover:bg-black/[0.06]",
      },
      size: {
        default: "h-12 px-6",
        large: "h-14 px-8 text-base",
        compact: "h-10 min-h-10 px-4 text-xs uppercase tracking-[0.06em]",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const styles = cn(buttonVariants({ variant, size }), className);

  if (asChild) {
    return (
      <Slot className={styles} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      className={styles}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
}

export { buttonVariants };
