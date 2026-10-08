declare module "@radix-ui/react-navigation-menu" {
  import type * as React from "react";

  type Primitive<T extends keyof React.JSX.IntrinsicElements> = React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<T> & React.RefAttributes<React.ElementRef<T>>
  > & { displayName?: string };

  export const Root: Primitive<"nav">;
  export const List: Primitive<"ul">;
  export const Trigger: Primitive<"button">;
  export const Content: Primitive<"div">;
  export const Viewport: Primitive<"div">;
  export const Indicator: Primitive<"div">;
  export const Item: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<"li"> & React.RefAttributes<HTMLLIElement>>;
  export const Link: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<"a"> & { asChild?: boolean } & React.RefAttributes<HTMLAnchorElement>>;
}
