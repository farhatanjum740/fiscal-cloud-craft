
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
  
  // Comprehensive defensive checks for options
  const safeOptions = React.useMemo(() => {
    try {
      // Handle invalid options
      if (options === null || options === undefined) {
        console.log("CommandSelect: options is null or undefined");
        return [];
      }
      
      // Handle non-array options 
      if (!Array.isArray(options)) {
        console.log("CommandSelect: options is not an array", options);
        return [];
      }
      
      // Filter out invalid items
      return options.filter(item => {
        if (!item || typeof item !== 'object') {
          console.log("CommandSelect: Invalid option item", item);
          return false;
        }
        
        if ('value' in item === false || 'label' in item === false) {
          console.log("CommandSelect: Option missing required properties", item);
          return false;
        }
        
        // Add more stringent checks - make sure values are not undefined
        if (item.value === undefined || item.label === undefined) {
          console.log("CommandSelect: Option has undefined value or label", item);
          return false;
        }
        
        return true;
      });
    } catch (error) {
      // Catch any unexpected errors in options processing
      console.error("CommandSelect: Error processing options:", error);
      return [];
    }
  }, [options]);
  
  // Extra safe selected option lookup with try/catch
  const selectedOption = React.useMemo(() => {
    try {
      if (!value || !safeOptions || safeOptions.length === 0) return null;
      return safeOptions.find(option => option.value === value) || null;
    } catch (error) {
      console.error("CommandSelect: Error finding selected option:", error);
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
          <CommandGroup style={{ maxHeight, overflowY: 'auto' }}>
            {safeOptions.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
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
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
