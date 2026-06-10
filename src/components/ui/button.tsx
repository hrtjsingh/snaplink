import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--snap-bg)]",
  {
    variants: {
      variant: {
        default:
          "border-0 text-white shadow-lg bg-gradient-to-br from-cyan-500 via-violet-500 to-rose-500 hover:shadow-cyan-500/30 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        glass:
          "border border-white/15 bg-white/5 text-white backdrop-blur-sm hover:border-cyan-500/40 hover:bg-white/10 hover:scale-[1.02]",
        outline:
          "border border-white/15 bg-transparent text-white hover:bg-white/10 hover:border-white/25",
        secondary:
          "border border-white/10 bg-white/10 text-white hover:bg-white/15",
        ghost:
          "border-0 bg-transparent text-zinc-400 hover:text-white hover:bg-white/10",
        destructive:
          "border-0 bg-red-600 text-white hover:bg-red-700",
        link:
          "border-0 bg-transparent text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-8 rounded-lg px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 px-8 text-base has-[>svg]:px-6",
        icon: "size-10 shrink-0 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
