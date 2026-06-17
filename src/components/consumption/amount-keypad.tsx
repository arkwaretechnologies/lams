"use client";

import { Delete, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRESETS = [20, 50, 75, 100, 150, 200] as const;
const KEYPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"] as const;

type AmountKeypadProps = {
  value: string;
  onChange: (value: string) => void;
  maxAmount: number;
  className?: string;
};

function normalizeAmount(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

function isWithinMax(value: string, maxAmount: number): boolean {
  if (!value || value === ".") return true;
  const num = parseFloat(value);
  return !Number.isNaN(num) && num <= maxAmount;
}

export function AmountKeypad({ value, onChange, maxAmount, className }: AmountKeypadProps) {
  function applyValue(next: string) {
    const normalized = normalizeAmount(next);
    if (isWithinMax(normalized, maxAmount)) {
      onChange(normalized);
    }
  }

  function handleDigit(digit: string) {
    if (digit === "." && value.includes(".")) return;
    if (value === "0" && digit !== ".") {
      applyValue(digit);
      return;
    }
    applyValue(value + digit);
  }

  function handleBackspace() {
    onChange(value.slice(0, -1));
  }

  function handleClear() {
    onChange("");
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className="flex h-16 items-center justify-center rounded-lg border-2 border-primary/20 bg-muted/30 px-4 font-display text-3xl font-semibold tabular-nums"
        aria-live="polite"
        aria-label={`Amount: ${value || "0"}`}
      >
        {value ? `₱${value}` : "₱0.00"}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant="outline"
            className="h-11 text-base font-medium transition-colors duration-200"
            onClick={() => onChange(String(preset))}
            disabled={preset > maxAmount}
          >
            {preset}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {KEYPAD_KEYS.map((key) => (
          <Button
            key={key}
            type="button"
            variant="secondary"
            className="h-12 text-lg font-medium transition-colors duration-200"
            onClick={() => handleDigit(key)}
          >
            {key}
          </Button>
        ))}
        <Button
          type="button"
          variant="secondary"
          className="h-12 transition-colors duration-200"
          onClick={handleBackspace}
          aria-label="Backspace"
        >
          <Delete className="size-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 text-sm font-medium transition-colors duration-200"
          onClick={handleClear}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

export type RemarkTemplate = {
  id: string;
  label: string;
  content: string;
  sort_order: number;
};

type RemarksFieldProps = {
  value: string;
  onChange: (value: string) => void;
  templates: RemarkTemplate[];
  canManageTemplates?: boolean;
};

export function RemarksField({
  value,
  onChange,
  templates,
  canManageTemplates,
}: RemarksFieldProps) {
  function applyTemplate(content: string) {
    if (!value.trim()) {
      onChange(content);
      return;
    }
    onChange(`${value.trimEnd()}\n${content}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="consumption-remarks" className="text-sm font-medium">
          Remarks
        </label>
        {canManageTemplates && (
          <a
            href="/remark-templates"
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Manage templates
          </a>
        )}
      </div>

      {templates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <Button
              key={template.id}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 border-accent/30 bg-accent/10 transition-colors duration-200 hover:bg-accent/20"
              onClick={() => applyTemplate(template.content)}
            >
              <CornerDownLeft className="mr-1.5 size-3.5 opacity-60" />
              {template.label}
            </Button>
          ))}
        </div>
      )}

      <textarea
        id="consumption-remarks"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What did the athlete consume?"
        rows={3}
        maxLength={500}
        className="flex min-h-[88px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <p className="text-right text-xs text-muted-foreground">{value.length}/500</p>
    </div>
  );
}
