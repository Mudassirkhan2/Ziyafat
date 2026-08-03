import type { ReactNode } from "react";
import { Toaster } from "sonner";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-center" />
    </>
  );
}
