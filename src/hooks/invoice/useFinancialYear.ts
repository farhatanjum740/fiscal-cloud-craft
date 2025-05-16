
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

  // Handle financial year change
  const handleFinancialYearChange = (
    year: string,
    invoice: any,
    setInvoice: (setter: (prev: any) => any) => void,
    setGeneratedInvoiceNumber: (value: string | null) => void
  ) => {
    console.log("Financial year changing to:", year);
    setInvoice(prev => ({ ...prev, financialYear: year }));
    
    // Clear invoice number and generated number if changing financial year
    if (year !== invoice.financialYear) {
      console.log("Clearing invoice number due to financial year change");
      setInvoice(prev => ({ ...prev, invoiceNumber: "" }));
      setGeneratedInvoiceNumber(null);
    }
  };

  return {
    getCurrentFinancialYear,
    handleFinancialYearChange
  };
};
