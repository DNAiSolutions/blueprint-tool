import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/* ============================================
   ALIGN Button Variants - Per PRD
   ============================================ */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-button font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        /* Primary CTA - Teal bg, white text */
        default: "bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-level-1",
        
        /* Primary CTA with gradient */
        primary: "gradient-teal text-white hover:opacity-90 hover:shadow-level-1",
        
        /* Secondary - Navy bg, white text */
        secondary: "bg-primary text-primary-foreground hover:bg-primary/90",
        
        /* Danger - Red bg, white text */
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        
        /* Ghost - Transparent, teal border, teal text */
        ghost: "border border-accent text-accent bg-transparent hover:bg-accent/10",
        
        /* Outline - Standard outline */
        outline: "border border-input bg-background hover:bg-secondary hover:text-secondary-foreground",
        
        /* Link style */
        link: "text-accent underline-offset-4 hover:underline",

        /* Subtle ghost without border */
        subtle: "hover:bg-secondary hover:text-secondary-foreground",
      },
      size: {
        /* Default - 8px vertical × 16px horizontal per PRD */
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
