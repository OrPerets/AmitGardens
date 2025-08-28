'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { useEffect, useState } from 'react';

interface ToastItem {
  id: number;
  title: string;
  description?: string;
}

type Listener = (items: ToastItem[]) => void;

let listeners: Listener[] = [];
let queue: ToastItem[] = [];

function notify() {
  for (const listener of listeners) listener([...queue]);
}

function subscribe(listener: Listener) {
  listeners.push(listener);
  listener([...queue]);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function remove(id: number) {
  queue = queue.filter((t) => t.id !== id);
  notify();
}

function add(toast: { title: string; description?: string }) {
  queue = [...queue, { id: Date.now(), ...toast }];
  notify();
}

export function useToast() {
  return add;
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  useEffect(() => subscribe(setToasts), []);
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map((t) => (
        <ToastPrimitive.Root
          key={t.id}
          open
          onOpenChange={(open) => !open && remove(t.id)}
          className="card shadow-md mb-2 px-4 py-3"
        >
          <div className="flex gap-3 items-start">
            <div className="mt-0.5 text-primary" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 15h-2v-6h2Zm0-8h-2V7h2Z"/></svg>
            </div>
            <div className="space-y-1">
              <ToastPrimitive.Title className="text-sm font-medium">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="text-xs text-muted-foreground">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
          </div>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 flex flex-col p-0 gap-2 w-[380px] max-w-[calc(100vw-2rem)] z-50" aria-live="polite" role="status" />
    </ToastPrimitive.Provider>
  );
}
