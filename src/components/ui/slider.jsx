"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-slider@1.2.3";

import { cn } from "./utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    
      
        
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
