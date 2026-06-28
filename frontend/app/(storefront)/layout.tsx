import type { ReactNode } from "react";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {children}
    </div>
  );
}
