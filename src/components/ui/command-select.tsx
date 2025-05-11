
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type CommandSelectItem = {
  value: string;
  label: string;
};

interface CommandSelectProps {
  options: CommandSelectItem[] | undefined;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchInputPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  maxHeight?: number;
}

export function CommandSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  searchInputPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  disabled = false,
  maxHeight = 300,
}: CommandSelectProps) {
  const [open, setOpen] = React.useState(false);
  
  // Extra defensive handling of options - with multiple layers of safety checks
  const safeOptions = React.useMemo(() => {
    try {
      // First check if options exists and is an array
      if (!options) return [];
      if (!Array.isArray(options)) return [];
      
      // Filter out invalid options
      return options.filter(option => {
        try {
          return option && 
            typeof option === "object" && 
            'value' in option && 
            'label' in option &&
            typeof option.value === 'string' &&
            typeof option.label === 'string';
        } catch (err) {
          console.error("Error processing individual option:", err);
          return false;
        }
      });
    } catch (error) {
      console.error("Error processing command select options:", error);
      return [];
    }
  }, [options]);
  
  // Find selected option with comprehensive error handling
  const selectedOption = React.useMemo(() => {
    try {
      if (!value) return null;
      if (!safeOptions) return null;
      if (safeOptions.length === 0) return null;
      
      return safeOptions.find(option => {
        try {
          return option.value === value;
        } catch (err) {
          console.error("Error comparing option value:", err);
          return false;
        }
      }) || null;
    } catch (error) {
      console.error("Error finding selected option:", error);
      return null;
    }
  }, [safeOptions, value]);

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
          onClick={() => !open && setOpen(true)}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full p-0" 
        style={{ minWidth: "var(--radix-popover-trigger-width)" }}
        align="start"
        sideOffset={4}
      >
        <Command>
          <CommandInput placeholder={searchInputPlaceholder} />
          {!safeOptions || safeOptions.length === 0 ? (
            <CommandEmpty>{emptyMessage}</CommandEmpty>
          ) : (
            <CommandGroup style={{ maxHeight, overflowY: 'auto' }}>
              {safeOptions.map((option) => (
                <CommandItem
                  key={option.value || `option-${Math.random()}`}
                  value={option.value}
                  onSelect={() => {
                    onValueChange(option.value === value ? "" : option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
