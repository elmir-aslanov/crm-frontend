import { NavLink as RouterNavLink } from "react-router-dom";
import type { NavLinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Props extends NavLinkProps {
  activeClassName?: string;
}

export function NavLink({ className, activeClassName, ...props }: Props) {
  return (
    <RouterNavLink
      {...props}
      className={({ isActive }) =>
        cn(
          typeof className === "string" ? className : "",
          isActive && activeClassName
        )
      }
    />
  );
}
