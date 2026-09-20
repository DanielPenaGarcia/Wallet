import type { ButtonVariant } from "$lib/components/ui/button";
import { tv, type VariantProps } from "tailwind-variants";

export const actionButtonStyles = tv({
  variants: {
    intent: {
      primary:
        "border-primary/20 bg-primary text-on-primary hover:bg-primary-hover aria-expanded:bg-primary/20 aria-expanded:text-primary focus-visible:border-primary/40 focus-visible:ring-primary/20",
      secondary:
        "border-secondary/20 bg-secondary text-on-secondary hover:bg-secondary-hover aria-expanded:bg-secondary/20 aria-expanded:text-secondary focus-visible:border-secondary/40 focus-visible:ring-secondary/20",
      danger:
        "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 aria-expanded:bg-destructive/20 aria-expanded:text-destructive focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
    },
  },
  defaultVariants: {
    intent: "primary",
  },
});

export type ActionButtonIntent = NonNullable<
  VariantProps<typeof actionButtonStyles>["intent"]
>;

export const actionButtonIntentVariants: Record<
  ActionButtonIntent,
  ButtonVariant
> = {
  primary: "default",
  secondary: "outline",
  danger: "destructive",
};
