import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectOption } from "@/types/questions";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

interface MultiSelectCheckboxProps {
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  allowCustom?: boolean;
  placeholder?: string;
  className?: string;
  maxHeight?: number;
}

export function MultiSelectCheckbox({
  options,
  value,
  onChange,
  allowCustom = false,
  placeholder = "Add custom option...",
  className,
  maxHeight = 300,
}: MultiSelectCheckboxProps) {
  const [customInput, setCustomInput] = React.useState("");
  const [customOptions, setCustomOptions] = React.useState<string[]>([]);

  // Group options by category
  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, SelectOption[]> = {};
    
    options.forEach((option) => {
      const category = option.category || "Other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(option);
    });
    
    return groups;
  }, [options]);

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleAddCustom = () => {
    if (customInput.trim() && !value.includes(customInput.trim())) {
      const customValue = `custom-${customInput.trim().toLowerCase().replace(/\s+/g, '-')}`;
      setCustomOptions([...customOptions, customInput.trim()]);
      onChange([...value, customValue]);
      setCustomInput("");
    }
  };

  const handleRemoveCustom = (customValue: string) => {
    setCustomOptions(customOptions.filter((c) => `custom-${c.toLowerCase().replace(/\s+/g, '-')}` !== customValue));
    onChange(value.filter((v) => v !== customValue));
  };

  const handleSelectAll = () => {
    const allOptionValues = options.map((o) => o.value);
    const allCustomValues = customOptions.map((c) => `custom-${c.toLowerCase().replace(/\s+/g, '-')}`);
    onChange([...allOptionValues, ...allCustomValues]);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const selectedCount = value.length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {selectedCount} selected
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="h-6 px-2 text-xs"
          >
            Select All
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-6 px-2 text-xs"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Options List - Using native scrolling for reliability */}
      <div 
        className="border border-border rounded-lg bg-background/50 overflow-y-auto"
        style={{ maxHeight }}
      >
        <div className="p-3 space-y-4">
          {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {category}
              </h4>
              <div className="space-y-1.5">
                {categoryOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer hover:bg-accent/10",
                      value.includes(option.value) && "bg-accent/20"
                    )}
                    onClick={() => handleToggle(option.value)}
                  >
                    <Checkbox
                      id={option.value}
                      checked={value.includes(option.value)}
                      onCheckedChange={() => handleToggle(option.value)}
                      className="pointer-events-none"
                    />
                    <Label
                      htmlFor={option.value}
                      className="flex-1 text-sm cursor-pointer font-normal"
                    >
                      {option.label}
                    </Label>
                    {option.isPaid && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        PAID
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Custom Options */}
          {customOptions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Custom
              </h4>
              <div className="space-y-1.5">
                {customOptions.map((custom) => {
                  const customValue = `custom-${custom.toLowerCase().replace(/\s+/g, '-')}`;
                  return (
                    <div
                      key={customValue}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-md transition-colors",
                        value.includes(customValue) && "bg-accent/20"
                      )}
                    >
                      <Checkbox
                        id={customValue}
                        checked={value.includes(customValue)}
                        onCheckedChange={() => handleToggle(customValue)}
                      />
                      <Label
                        htmlFor={customValue}
                        className="flex-1 text-sm cursor-pointer font-normal"
                      >
                        {custom}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveCustom(customValue)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Input */}
      {allowCustom && (
        <div className="flex gap-2">
          <Input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 h-9 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustom();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCustom}
            disabled={!customInput.trim()}
            className="h-9"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
