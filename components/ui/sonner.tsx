"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: "group toast !shadow-lg !border-2 !font-medium",
          description: "!text-white/90 !font-normal",
          actionButton: "!bg-white/20 !text-white",
          cancelButton: "!bg-white/20 !text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
