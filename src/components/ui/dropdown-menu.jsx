"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-dropdown-menu@2.1.6";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function DropdownMenu({
  ...props
}) {
  return ;
}

function DropdownMenuPortal({
  ...props
}) {
  return (
    
  );
}

function DropdownMenuTrigger({
  ...props
}) {
  return (
    
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}) {
  return (
    <DropdownMenuPrimitive.Portal>
      
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({
  ...props
}) {
  return (
    
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
} ) {
  return (
    
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return (
    
      
        <DropdownMenuPrimitive.ItemIndicator>
          
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}) {
  return (
    
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}) {
  return (
    
      
        <DropdownMenuPrimitive.ItemIndicator>
          
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
} ) {
  return (
    
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}) {
  return (
    
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}) {
  return (
    
  );
}

function DropdownMenuSub({
  ...props
}) {
  return ;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
} ) {
  return (
    
      {children}
      
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}) {
  return (
    
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
