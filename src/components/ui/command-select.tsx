
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
  
  // Enhanced safety checks for options with explicit force to array format
  const safeOptions = React.useMemo(() => {
    console.log("Command Select original options:", options);
    
    try {
      // Always ensure we have an array to work with
      if (!options) {
        console.log("CommandSelect: options is null or undefined");
        return [];
      }
      
      // Handle non-array options by forcing array conversion
      if (!Array.isArray(options)) {
        console.log("CommandSelect: options is not an array, type:", typeof options);
        return [];
      }
      
      // Filter out invalid items and ensure each item has valid properties
      const filteredOptions = options.filter(item => {
        if (!item) {
          console.log("CommandSelect: Skipping null or undefined item");
          return false;
        }
        
        if (typeof item !== 'object') {
          console.log("CommandSelect: Item is not an object", item);
          return false;
        }
        
        if (!('value' in item) || !('label' in item)) {
          console.log("CommandSelect: Item missing required properties", item);
          return false;
        }
        
        // Make sure value and label are not undefined
        if (item.value === undefined || item.value === null || item.label === undefined || item.label === null) {
          console.log("CommandSelect: Item has undefined/null value or label", item);
          return false;
        }
        
        // Ensure values are strings (or convertible to strings)
        if (typeof item.value !== 'string') {
          console.log("CommandSelect: Converting non-string value to string:", item.value);
          item.value = String(item.value);
        }
        
        if (typeof item.label !== 'string') {
          console.log("CommandSelect: Converting non-string label to string:", item.label);
          item.label = String(item.label);
        }
        
        return true;
      });
      
      console.log("CommandSelect: Filtered options:", filteredOptions);
      return filteredOptions;
    } catch (error) {
      // Catch any unexpected errors in options processing
      console.error("CommandSelect: Error processing options:", error);
      return [];
    }
  }, [options]);
  
  console.log("Command Select processed options:", safeOptions);
  console.log("Command Select current value:", value);
  
  // Extra safe selected option lookup with try/catch
  const selectedOption = React.useMemo(() => {
    try {
      if (!value || value === "" || !safeOptions || safeOptions.length === 0) {
        return null;
      }
      return safeOptions.find(option => option.value === value) || null;
    } catch (error) {
      console.error("CommandSelect: Error finding selected option:", error);
      return null;
    }
  }, [safeOptions, value]);

  // Log the selected option for debugging
  console.log("CommandSelect selected option:", selectedOption);

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
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup style={{ maxHeight, overflowY: 'auto' }}>
            {safeOptions && safeOptions.length > 0 ? (
              safeOptions.map((option) => (
                <CommandItem
                  key={`option-${option.value || Math.random().toString()}`}
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
              ))
            ) : (
              <div className="py-6 text-center text-sm text-gray-500">
                {emptyMessage}
              </div>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
