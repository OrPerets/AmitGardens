'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { createContext, useContext, useState, ReactNode } from 'react';

interface ToastItem {
  id: number;
  title: string;
  description?: string;
}

const ToastContext = createContext<
  (toast: { title: string; description?: string }) => void
>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const add = (toast: { title: string; description?: string }) => {
    setToasts((prev) => [...prev, { id: Date.now(), ...toast }]);
  };
  const remove = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      <ToastContext.Provider value={add}>{children}</ToastContext.Provider>
      {toasts.map((t) => (
        <ToastPrimitive.Root
          key={t.id}
          open
          onOpenChange={(open) => !open && remove(t.id)}
          className="bg-gray-800 text-white rounded-md p-4 mb-2 shadow"
        >
          <ToastPrimitive.Title className="font-medium">
            {t.title}
          </ToastPrimitive.Title>
          {t.description && (
            <ToastPrimitive.Description className="text-sm opacity-80">
              {t.description}
            </ToastPrimitive.Description>
          )}
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-0 left-0 flex flex-col p-4 gap-2 w-96 max-w-[100vw] z-50" />
    </ToastPrimitive.Provider>
  );
}
