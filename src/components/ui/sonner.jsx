"use client";

import { useTheme } from "next-themes@0.4.6";
import { Toaster, ToasterProps } from "sonner@2.0.3";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    
  );
};

export { Toaster };
