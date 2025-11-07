"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-context-menu@2.2.6";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function ContextMenu({
  ...props
}) {
  return ;
}

function ContextMenuTrigger({
  ...props
}) {
  return (
    
  );
}

function ContextMenuGroup({
  ...props
}) {
  return (
    
  );
}

function ContextMenuPortal({
  ...props
}) {
  return (
    
  );
}

function ContextMenuSub({
  ...props
}) {
  return ;
}

function ContextMenuRadioGroup({
  ...props
}) {
  return (
    
  );
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
} ) {
  return (
    
      {children}
      
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({
  className,
  ...props
}) {
  return (
    
  );
}

function ContextMenuContent({
  className,
  ...props
}) {
  return (
    <ContextMenuPrimitive.Portal>
      
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
} ) {
  return (
    
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return (
    
      
        <ContextMenuPrimitive.ItemIndicator>
          
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}) {
  return (
    
      
        <ContextMenuPrimitive.ItemIndicator>
          
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({
  className,
  inset,
  ...props
} ) {
  return (
    
  );
}

function ContextMenuSeparator({
  className,
  ...props
}) {
  return (
    
  );
}

function ContextMenuShortcut({
  className,
  ...props
}) {
  return (
    
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
