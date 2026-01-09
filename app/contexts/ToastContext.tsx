"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { Toast, ToastType } from "@/app/components/ui/toast";

interface ToastContextType {
  toasts: Toast[];
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (type: ToastType, message: string, duration?: number) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newToast: Toast = { id, type, message, duration };
      console.log('[ToastContext] Adding toast:', newToast);
      setToasts((prev) => {
        const updated = [...prev, newToast];
        console.log('[ToastContext] Updated toasts:', updated);
        return updated;
      });
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => showToast("success", message, duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => showToast("error", message, duration),
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      console.log('[ToastContext.info] Called with message:', message);
      return showToast("info", message, duration);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, success, error, info, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  console.log('[useToast] 🔍 Hook called, context is:', context ? '✅ DEFINED' : '❌ UNDEFINED');
  if (context === undefined) {
    console.warn('[useToast] ⚠️ No ToastProvider found, using fallback local state');
    console.trace('[useToast] Stack trace for fallback usage');
    // Fallback to local state if no provider (for backward compatibility)
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback(
      (type: ToastType, message: string, duration?: number) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newToast: Toast = { id, type, message, duration };
        setToasts((prev) => [...prev, newToast]);
        return id;
      },
      []
    );

    const removeToast = useCallback((id: string) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = useCallback(
      (message: string, duration?: number) => showToast("success", message, duration),
      [showToast]
    );

    const error = useCallback(
      (message: string, duration?: number) => showToast("error", message, duration),
      [showToast]
    );

    const info = useCallback(
      (message: string, duration?: number) => showToast("info", message, duration),
      [showToast]
    );

    return { toasts, success, error, info, removeToast };
  }
  console.log('[useToast] ✅ Using context, toasts count:', context.toasts.length);
  return context;
}
