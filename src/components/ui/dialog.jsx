"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-dialog@1.1.6";
import { XIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Dialog({
  ...props
}) {
  return ;
}

function DialogTrigger({
  ...props
}) {
  return ;
}

function DialogPortal({
  ...props
}) {
  return ;
}

function DialogClose({
  ...props
}) {
  return ;
}

function DialogOverlay({
  className,
  ...props
}) {
  return <react-dialog1.1.6.Portal {...props} />;
}

function DialogContent({
  className,
  children,
  ...props
}) {
  return (
    
      <DialogOverlay />
      
        {children}
        
          <XIcon />
          Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }) {
  return <react-dialog1.1.6.Header {...props} />;
}

function DialogFooter({ className, ...props }) {
  return <react-dialog1.1.6.Header {...props} />;
}

function DialogTitle({
  className,
  ...props
}) {
  return <react-dialog1.1.6.Header {...props} />;
}

function DialogDescription({
  className,
  ...props
}) {
  return <react-dialog1.1.6.Title {...props} />;
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
