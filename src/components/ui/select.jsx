"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-select@2.1.6";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react@0.487.0";

import { cn } from "./utils";

function Select({
  ...props
}) {
  return ;
}

function SelectGroup({
  ...props
}) {
  return ;
}

function SelectValue({
  ...props
}) {
  return ;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
} ) {
  return (
    
      {children}
      <SelectPrimitive.Icon asChild>
        
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}) {
  return (
    <SelectPrimitive.Portal>
      
        <SelectScrollUpButton />
        
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}) {
  return (
    
  );
}

function SelectItem({
  className,
  children,
  ...props
}) {
  return (
    
      
        <SelectPrimitive.ItemIndicator>
          
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}) {
  return (
    
  );
}

function SelectScrollUpButton({
  className,
  ...props
}) {
  return (
    
      
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}) {
  return (
    
      
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
