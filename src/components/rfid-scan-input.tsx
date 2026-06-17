"use client";

import { useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RfidScanInputProps {
  onScan: (tagId: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function RfidScanInput({
  onScan,
  disabled,
  className,
  placeholder = "Scan RFID or type tag ID...",
  autoFocus = true,
}: RfidScanInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const bufferRef = useRef("");

  const handleScan = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (trimmed) onScan(trimmed);
    },
    [onScan]
  );

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <Input
      ref={inputRef}
      className={cn("font-mono text-lg", className)}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete="off"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleScan(e.currentTarget.value);
          e.currentTarget.value = "";
          bufferRef.current = "";
        }
      }}
      onBlur={() => {
        if (autoFocus) {
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }}
    />
  );
}
