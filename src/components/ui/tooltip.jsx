"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-tooltip@1.1.8";

import { cn } from "./utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}) {
  return (
    
  );
}

function Tooltip({
  ...props
}) {
  return (
    <TooltipProvider>
      
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}) {
  return ;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}) {
  return (
    <TooltipPrimitive.Portal>
      
        {children}
        
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
