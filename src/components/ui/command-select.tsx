
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
  
  // Debug logging for props
  React.useEffect(() => {
    console.log("CommandSelect - Debug info:");
    console.log("options:", options);
    console.log("options type:", typeof options);
    console.log("options isArray:", Array.isArray(options));
    console.log("value:", value);
  }, [options, value]);
  
  // Ensure options is always a valid array
  const safeOptions = React.useMemo(() => {
    console.log("CommandSelect - Processing safeOptions");
    try {
      // First check if options is defined and is an array
      if (!options) {
        console.log("options is undefined, returning empty array");
        return [];
      }
      
      if (!Array.isArray(options)) {
        console.log("options is not an array, returning empty array");
        return [];
      }
      
      // Then filter out invalid items
      const validOptions = options.filter((option): option is CommandSelectItem => {
        const isValid = 
          option !== null && 
          option !== undefined && 
          typeof option === 'object' && 
          'value' in option &&
          'label' in option &&
          typeof option.value === 'string' && 
          typeof option.label === 'string';
          
        if (!isValid) {
          console.log("Filtered out invalid option:", option);
        }
        
        return isValid;
      });
      
      console.log("Returning valid options:", validOptions);
      return validOptions;
    } catch (err) {
      console.error("Error in safeOptions memo:", err);
      return [];
    }
  }, [options]);
  
  // Find selected option safely
  const selectedOption = React.useMemo(() => {
    try {
      if (!value || typeof value !== 'string') return undefined;
      
      const found = safeOptions.find((option) => option.value === value);
      console.log("Selected option:", found);
      return found;
    } catch (err) {
      console.error("Error in selectedOption memo:", err);
      return undefined;
    }
  }, [safeOptions, value]);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    console.log("CommandSelect - Computing filteredOptions");
    try {
      if (!searchQuery) {
        console.log("No search query, returning all safeOptions");
        return safeOptions;
      }
      
      const normalizedQuery = (searchQuery || "").toLowerCase().trim();
      if (!normalizedQuery) {
        console.log("Normalized query is empty, returning all safeOptions");
        return safeOptions;
      }
      
      const filtered = safeOptions.filter((option) => 
        option.label?.toLowerCase().includes(normalizedQuery)
      );
      
      console.log("Filtered options result:", filtered);
      return filtered;
    } catch (err) {
      console.error("Error filtering options:", err);
      return safeOptions;
    }
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
          onClick={() => console.log("CommandSelect - Trigger clicked")}
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
            onValueChange={(value) => {
              console.log("Search query changed:", value);
              setSearchQuery(value || "");
            }}
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup style={{ maxHeight: maxHeight, overflowY: 'auto' }}>
            {Array.isArray(filteredOptions) && filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <CommandItem
                  key={option.value || `option-${Math.random()}`}
                  value={option.value || ""}
                  onSelect={() => {
                    console.log("Option selected:", option);
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
              ))
            ) : (
              <div className="py-6 text-center text-sm">No options available</div>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
