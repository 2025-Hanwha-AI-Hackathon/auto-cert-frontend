"use client";

import * as React from "react";
import { Drawer } from "vaul@1.1.2";

import { cn } from "./utils";

function Drawer({
  ...props
}) {
  return ;
}

function DrawerTrigger({
  ...props
}) {
  return ;
}

function DrawerPortal({
  ...props
}) {
  return ;
}

function DrawerClose({
  ...props
}) {
  return ;
}

function DrawerOverlay({
  className,
  ...props
}) {
  return (
    
  );
}

function DrawerContent({
  className,
  children,
  ...props
}) {
  return (
    
      <DrawerOverlay />
      
        
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }) {
  return (
    
  );
}

function DrawerFooter({ className, ...props }) {
  return (
    
  );
}

function DrawerTitle({
  className,
  ...props
}) {
  return (
    
  );
}

function DrawerDescription({
  className,
  ...props
}) {
  return (
    
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
