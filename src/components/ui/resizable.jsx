"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react@0.487.0";
import * from "react-resizable-panels@2.1.7";

import { cn } from "./utils";

function ResizablePanelGroup({
  className,
  ...props
}) {
  return (
    
  );
}

function ResizablePanel({
  ...props
}) {
  return ;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
} ) {
  return (
    div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && (
        
          
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
