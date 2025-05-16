
import { useEffect } from "react";

export const useFinancialYear = (
  setFinancialYears: (years: string[]) => void,
  setInvoice: (setter: (prev: any) => any) => void
) => {
  // Get current financial year
  const getCurrentFinancialYear = (date: Date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    
    if (month >= 3) { // April to March
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  };

  // Generate list of financial years (current ± 5 years)
  useEffect(() => {
    console.log("Generating financial years list...");
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const startYear = currentMonth >= 3 ? currentYear - 5 : currentYear - 6;
    const endYear = currentMonth >= 3 ? currentYear + 1 : currentYear;
    
    const years: string[] = [];
    for (let i = startYear; i <= endYear; i++) {
      years.push(`${i}-${i + 1}`);
    }
    
    console.log("Generated financial years:", years);
    setFinancialYears(years.reverse());
    
    // Set default financial year
    const defaultFinancialYear = getCurrentFinancialYear(currentDate);
    console.log("Default financial year:", defaultFinancialYear);
    setInvoice(prev => ({ ...prev, financialYear: defaultFinancialYear }));
  }, [setFinancialYears, setInvoice]);

  // Determine financial year from a date
  const getFinancialYearFromDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Financial year runs from April 1 to March 31
    // If date is Jan-Mar, financial year is previous year to current year
    // If date is Apr-Dec, financial year is current year to next year
    if (month < 3) { // Jan, Feb, Mar
      return `${year-1}-${year}`;
    } else { // Apr to Dec
      return `${year}-${year+1}`;
    }
  };

  // Update financial year when invoice date changes
  const updateFinancialYearFromDate = (
    date: Date,
    setInvoice: (setter: (prev: any) => any) => void,
    setGeneratedInvoiceNumber: (value: string | null) => void
  ) => {
    const newFinancialYear = getFinancialYearFromDate(date);
    console.log(`Date ${date.toISOString()} corresponds to financial year ${newFinancialYear}`);
    
    setInvoice(prev => {
      // Only reset invoice number if financial year is changing
      if (prev.financialYear !== newFinancialYear) {
        console.log(`Financial year changing from ${prev.financialYear} to ${newFinancialYear}`);
        setGeneratedInvoiceNumber(null);
        return { 
          ...prev, 
          financialYear: newFinancialYear,
          invoiceNumber: "" 
        };
      }
      return { ...prev, financialYear: newFinancialYear };
    });
  };

  return {
    getCurrentFinancialYear,
    getFinancialYearFromDate,
    updateFinancialYearFromDate
  };
};
