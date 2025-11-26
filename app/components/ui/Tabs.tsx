"use client";

import React from "react";

type TabsContextValue = { value: string; setValue: (v: string) => void } | null;
const TabsContext = React.createContext<TabsContextValue>(null);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({ defaultValue, value: controlledValue, onValueChange, className = "", children, ...rest }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;
  
  const setValue = React.useCallback((newValue: string) => {
    if (isControlled) {
      onValueChange?.(newValue);
    } else {
      setInternalValue(newValue);
    }
  }, [isControlled, onValueChange]);

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue }}>
      <div className={className} {...rest}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = "", children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="tablist" className={className} {...rest}>{children}</div>;
}

export function TabsTrigger({ value, className = "", children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) return null;
  const isActive = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx.setValue(value)}
      className={
        "px-3 py-2 text-sm border-b-2 transition-colors " +
        (isActive ? "border-primary text-primary" : "border-transparent text-black/70 hover:text-black") +
        (className ? " " + className : "")
      }
      {...rest}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = "", children, ...rest }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const ctx = React.useContext(TabsContext);
  if (!ctx || ctx.value !== value) return null;
  return <div role="tabpanel" className={className} {...rest}>{children}</div>;
}

 