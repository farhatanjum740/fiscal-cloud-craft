
import React from 'react';
import { DatePicker } from "@/components/ui/date-picker";

interface CreditNoteDatePickerProps {
  creditNote?: any;
  setCreditNote?: (creditNote: any) => void;
  loading?: boolean;
  date?: Date;
  onDateChange?: (date: Date) => void;
}

const CreditNoteDatePicker: React.FC<CreditNoteDatePickerProps> = ({ 
  creditNote, 
  setCreditNote, 
  loading,
  date,
  onDateChange
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

  return (
    <div>
      <DatePicker
        selected={selected}
        onSelect={handleDateChange}
        disabled={loading}
        placeholder="Select date"
        disableFutureDates={true}
      />
    </div>
  );
};

export default CreditNoteDatePicker;
