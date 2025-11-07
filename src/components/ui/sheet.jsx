"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-dialog@1.1.6";
import { XIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Sheet({ ...props }) {
  return ;
}

function SheetTrigger({
  ...props
}) {
  return ;
}

function SheetClose({
  ...props
}) {
  return ;
}

function SheetPortal({
  ...props
}) {
  return ;
}

function SheetOverlay({
  className,
  ...props
}) {
  return (
    
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
} ) {
  return (
    <SheetPortal>
      <SheetOverlay />
      
        {children}
        
          
          Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }) {
  return (
    
  );
}

function SheetFooter({ className, ...props }) {
  return (
    
  );
}

function SheetTitle({
  className,
  ...props
}) {
  return (
    
  );
}

function SheetDescription({
  className,
  ...props
}) {
  return (
    
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
