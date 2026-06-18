"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataLabel } from "@/components/brand/data-label";
import { cn } from "@/lib/utils";
import type { CachedAthlete } from "@/lib/db/local-db";

type AthleteLookupInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  results: CachedAthlete[];
  onSelect: (athlete: CachedAthlete) => void;
  placeholder?: string;
  className?: string;
};

export function AthleteLookupInput({
  value,
  onChange,
  onSubmit,
  results,
  onSelect,
  placeholder = "Scan RFID or search name / student ID...",
  className,
}: AthleteLookupInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const showResults = results.length > 0 && value.length > 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          className="h-12 border-border/80 pl-9 text-base focus-visible:border-primary/35 focus-visible:ring-primary/15"
          placeholder={placeholder}
          value={value}
          autoComplete="off"
          aria-label="Scan RFID or search athlete"
          aria-expanded={showResults}
          aria-haspopup="listbox"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit(value);
            }
          }}
          onBlur={() => {
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
        />
      </div>

      {showResults && (
        <div
          className="lams-soft-card max-h-56 overflow-y-auto rounded-2xl"
          role="listbox"
          aria-label="Athlete search results"
        >
          {results.map((a) => (
            <button
              key={a.id}
              type="button"
              role="option"
              className="w-full border-b border-border/40 px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/50"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(a)}
            >
              <p className="font-medium text-foreground">{a.full_name}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                <DataLabel>{a.student_id}</DataLabel>
                {a.rfid_tag ? (
                  <>
                    {" · "}
                    <DataLabel>{a.rfid_tag}</DataLabel>
                  </>
                ) : null}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
