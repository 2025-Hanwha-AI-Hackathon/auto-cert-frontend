"use client";

import * as React from "react";
import { Command } from "cmdk@1.1.1";
import { SearchIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

function Command({
  className,
  ...props
}) {
  return (
    
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
} ) {
  return (
    <Dialog {...props}>
      
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      
        
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}) {
  return (
    
      
      
    </div>
  );
}

function CommandList({
  className,
  ...props
}) {
  return (
    
  );
}

function CommandEmpty({
  ...props
}) {
  return (
    
  );
}

function CommandGroup({
  className,
  ...props
}) {
  return (
    
  );
}

function CommandSeparator({
  className,
  ...props
}) {
  return (
    
  );
}

function CommandItem({
  className,
  ...props
}) {
  return (
    
  );
}

function CommandShortcut({
  className,
  ...props
}) {
  return (
    
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
