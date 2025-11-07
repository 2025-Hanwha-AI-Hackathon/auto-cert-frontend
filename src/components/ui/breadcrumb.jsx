import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { ChevronRight, MoreHorizontal } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Breadcrumb({ ...props }) {
  return ;
}

function BreadcrumbList({ className, ...props }) {
  return (
    
  );
}

function BreadcrumbItem({ className, ...props }) {
  return (
    
  );
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
} ) {
  const Comp = asChild ? Slot : "a";

  return (
    
  );
}

function BreadcrumbPage({ className, ...props }) {
  return (
    
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}) {
  return (
    svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

function BreadcrumbEllipsis({
  className,
  ...props
}) {
  return (
    
      
      More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
