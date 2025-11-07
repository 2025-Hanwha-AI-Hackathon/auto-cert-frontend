"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-menubar@1.1.6";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Menubar({
  className,
  ...props
}) {
  return (
    
  );
}

function MenubarMenu({
  ...props
}) {
  return ;
}

function MenubarGroup({
  ...props
}) {
  return ;
}

function MenubarPortal({
  ...props
}) {
  return ;
}

function MenubarRadioGroup({
  ...props
}) {
  return (
    
  );
}

function MenubarTrigger({
  className,
  ...props
}) {
  return (
    
  );
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}) {
  return (
    <MenubarPortal>
      
    </MenubarPortal>
  );
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
} ) {
  return (
    
  );
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return (
    
      
        <MenubarPrimitive.ItemIndicator>
          
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

function MenubarRadioItem({
  className,
  children,
  ...props
}) {
  return (
    
      
        <MenubarPrimitive.ItemIndicator>
          
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

function MenubarLabel({
  className,
  inset,
  ...props
} ) {
  return (
    
  );
}

function MenubarSeparator({
  className,
  ...props
}) {
  return (
    
  );
}

function MenubarShortcut({
  className,
  ...props
}) {
  return (
    
  );
}

function MenubarSub({
  ...props
}) {
  return ;
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
} ) {
  return (
    
      {children}
      
    </MenubarPrimitive.SubTrigger>
  );
}

function MenubarSubContent({
  className,
  ...props
}) {
  return (
    
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
