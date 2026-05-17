"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#1e1e2f',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px'
          }
        }}
      />
    </SessionProvider>
  );
}
