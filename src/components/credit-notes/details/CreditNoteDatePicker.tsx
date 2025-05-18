
import React from 'react';
import { DatePicker } from "@/components/ui/date-picker";
import { parse } from 'date-fns';

interface CreditNoteDatePickerProps {
  creditNote?: any;
  setCreditNote?: (creditNote: any) => void;
  loading?: boolean;
  date?: Date;
  onDateChange?: (date: Date) => void;
  financialYear?: string;
}

const CreditNoteDatePicker: React.FC<CreditNoteDatePickerProps> = ({ 
  creditNote, 
  setCreditNote, 
  loading,
  date,
  onDateChange,
  financialYear
}) => {
  // Handle both prop patterns
  const selected = date || (creditNote?.creditNoteDate);
  
  const handleDateChange = (newDate: Date) => {
    if (onDateChange) {
      onDateChange(newDate);
    } else if (setCreditNote) {
      setCreditNote(prev => ({ ...prev, creditNoteDate: newDate }));
    }
  };

  // Calculate date constraints based on financial year
  const getDateConstraints = () => {
    if (!financialYear) return { minDate: undefined, maxDate: undefined };
    
    // Parse financial year (e.g., "2023-2024")
    const years = financialYear.split('-');
    if (years.length !== 2) return { minDate: undefined, maxDate: undefined };
    
    const startYear = parseInt(years[0], 10);
    const endYear = parseInt(years[1], 10);
    
    // Financial year starts on April 1st and ends on March 31st
    const minDate = new Date(startYear, 3, 1); // April 1st of start year
    
    // End date is either March 31st of end year or today, whichever is earlier
    const march31 = new Date(endYear, 2, 31); // March 31st of end year
    const today = new Date();
    
    const maxDate = today < march31 ? today : march31;
    
    return { minDate, maxDate };
  };

  const { minDate, maxDate } = getDateConstraints();

  return (
    <div>
      <DatePicker
        selected={selected}
        onSelect={handleDateChange}
        disabled={loading}
        placeholder="Select date"
        disableFutureDates={true}
        minDate={minDate}
        maxDate={maxDate}
      />
      {financialYear && (
        <p className="text-xs text-muted-foreground mt-1">
          Date must be between {minDate?.toLocaleDateString()} and {maxDate?.toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

export default CreditNoteDatePicker;
