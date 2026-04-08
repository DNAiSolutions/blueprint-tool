// Shared form primitives for the Inspector. Small, dense, dark-ui friendly.
// All components are controlled: they emit `onChange` with the new value.

import { cn } from '@/lib/utils';

// ---------- Field wrapper ----------
interface FieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Row({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-2 gap-2', className)}>{children}</div>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wider font-bold text-accent mt-3 mb-1.5 first:mt-0">
      {children}
    </div>
  );
}

// ---------- Color input ----------
interface ColorInputProps {
  value: string;
  onChange: (v: string) => void;
}

export function ColorInput({ value, onChange }: ColorInputProps) {
  // Parse rgba() into a hex fallback for the native color picker; keep full
  // value for the text box so alpha survives.
  const hex = value.startsWith('#') ? value.slice(0, 7) : '#000000';

  return (
    <div className="flex gap-1.5 items-center">
      <div
        className="h-7 w-7 rounded border border-border shrink-0 overflow-hidden relative cursor-pointer"
        style={{ backgroundColor: value }}
      >
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-7 text-[11px] font-mono bg-[hsl(var(--surface-low))] border border-border rounded px-2 focus:border-accent/40 outline-none"
      />
    </div>
  );
}

// ---------- Number input ----------
interface NumberInputProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export function NumberInput({ value, onChange, min, max, step = 1, suffix }: NumberInputProps) {
  return (
    <div className="relative">
      <input
        type="number"
        value={Math.round(value * 100) / 100}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="w-full h-7 text-[11px] font-mono bg-[hsl(var(--surface-low))] border border-border rounded px-2 pr-6 focus:border-accent/40 outline-none"
      />
      {suffix && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

// ---------- Slider (continuous) ----------
interface SliderInputProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function SliderInput({ value, onChange, min = 0, max = 1, step = 0.01 }: SliderInputProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1 bg-border rounded-full appearance-none cursor-pointer accent-[hsl(var(--accent))]"
    />
  );
}

// ---------- Select ----------
interface SelectInputProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}

export function SelectInput<T extends string>({ value, options, onChange }: SelectInputProps<T>) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full h-7 text-[11px] bg-[hsl(var(--surface-low))] border border-border rounded px-2 focus:border-accent/40 outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

// ---------- Textarea ----------
interface TextInputProps {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}

export function TextInput({ value, onChange, rows, placeholder }: TextInputProps) {
  if (rows && rows > 1) {
    return (
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[11px] bg-[hsl(var(--surface-low))] border border-border rounded px-2 py-1.5 focus:border-accent/40 outline-none resize-none"
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-7 text-[11px] bg-[hsl(var(--surface-low))] border border-border rounded px-2 focus:border-accent/40 outline-none"
    />
  );
}

// ---------- Toggle button group ----------
interface ToggleGroupProps<T extends string> {
  value: T;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  onChange: (v: T) => void;
}

export function ToggleButtonGroup<T extends string>({ value, options, onChange }: ToggleGroupProps<T>) {
  return (
    <div className="flex gap-0.5 rounded border border-border p-0.5 bg-[hsl(var(--surface-low))]">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 h-6 flex items-center justify-center text-[11px] rounded transition-colors',
              active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.icon ?? opt.label}
          </button>
        );
      })}
    </div>
  );
}
