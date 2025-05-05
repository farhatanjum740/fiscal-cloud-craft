
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
  searchPlaceholder?: string;
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
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  disabled = false,
  maxHeight = 300,
}: CommandSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Add additional console logging to debug the options
  React.useEffect(() => {
    console.log("CommandSelect options:", options);
    console.log("CommandSelect value:", value);
  }, [options, value]);
  
  // Ensure options is a valid array to prevent the "undefined is not iterable" error
  const safeOptions = React.useMemo(() => {
    // If options is falsy, return empty array
    if (!options) {
      console.log("Options is undefined or null, returning empty array");
      return [];
    }
    
    // Check if options is an array
    if (!Array.isArray(options)) {
      console.log("Options is not an array, returning empty array");
      return [];
    }
    
    // Filter out any invalid options
    return options.filter(option => 
      option && typeof option === "object" && 
      'value' in option && 'label' in option
    );
  }, [options]);
  
  // Find selected option safely
  const selectedOption = React.useMemo(() => {
    if (!value || value === "") return undefined;
    return safeOptions.find(option => option.value === value);
  }, [safeOptions, value]);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return safeOptions;
    
    const normalizedQuery = searchQuery.toLowerCase().trim();
    if (!normalizedQuery) return safeOptions;
    
    return safeOptions.filter((option) => 
      option.label.toLowerCase().includes(normalizedQuery)
    );
  }, [safeOptions, searchQuery]);

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
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ minWidth: "var(--radix-popover-trigger-width)" }}>
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          {filteredOptions.length === 0 ? (
            <CommandEmpty>{emptyMessage}</CommandEmpty>
          ) : (
            <CommandGroup style={{ maxHeight: maxHeight, overflowY: 'auto' }}>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value || `option-${Math.random()}`}
                  value={option.value}
                  onSelect={() => {
                    onValueChange(option.value === value ? "" : option.value);
                    setOpen(false);
                    setSearchQuery("");
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
