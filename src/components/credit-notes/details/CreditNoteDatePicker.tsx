import React from 'react';
import { DatePicker } from "@/components/ui/date-picker";

interface CreditNoteDatePickerProps {
  creditNote: any;
  setCreditNote: (creditNote: any) => void;
  loading: boolean;
}

const CreditNoteDatePicker: React.FC<CreditNoteDatePickerProps> = ({ creditNote, setCreditNote, loading }) => {
  return (
    <div>
      <DatePicker
        selected={creditNote?.creditNoteDate}
        onSelect={date => setCreditNote(prev => ({ ...prev, creditNoteDate: date }))}
        disabled={loading}
        placeholder="Select date"
        disableFutureDates={true}
      />
    </div>
  );
};

export default CreditNoteDatePicker;
