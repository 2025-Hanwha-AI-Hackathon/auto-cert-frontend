"use client";

import * as React from "react";

import { cn } from "./utils";

function Table({ className, ...props }) {
  return (
    
      
    </div>
  );
}

function TableHeader({ className, ...props }) {
  return (
    
  );
}

function TableBody({ className, ...props }) {
  return (
    
  );
}

function TableFooter({ className, ...props }) {
  return (
    tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }) {
  return (
    
  );
}

function TableHead({ className, ...props }) {
  return (
    [role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }) {
  return (
    [role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}) {
  return (
    
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
