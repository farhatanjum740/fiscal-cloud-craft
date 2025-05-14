
import React from 'react';

const CreditNoteLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 border rounded-md bg-gray-50">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
      <p className="text-muted-foreground">Loading credit note...</p>
    </div>
  );
};

export default CreditNoteLoading;
