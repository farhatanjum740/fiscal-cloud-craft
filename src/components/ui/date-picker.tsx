
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  disableFutureDates?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  selected,
  onSelect,
  className,
  disabled,
  placeholder = "Select date",
  disableFutureDates = true,
  minDate,
  maxDate,
}: DatePickerProps) {
  // Function to determine if a date should be disabled
  const isDateDisabled = (date: Date) => {
    // Check if date is in the future when disableFutureDates is true
    if (disableFutureDates && date > new Date()) {
      return true;
    }
    
    // Check if date is before minDate
    if (minDate && date < minDate) {
      return true;
    }
    
    // Check if date is after maxDate
    if (maxDate && date > maxDate) {
      return true;
    }
    
    return false;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          disabled={isDateDisabled}
          initialFocus
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
