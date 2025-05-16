
import React, { createContext, useContext, useState } from "react";
import { startOfYear, endOfYear } from "date-fns";

// Financial year utility functions
export const startOfFinancialYear = (date: Date): Date => {
  const year = date.getFullYear();
  const month = date.getMonth();
  // Financial year starts on April 1st in India
  return new Date(month < 3 ? year - 1 : year, 3, 1);
};

export const endOfFinancialYear = (date: Date): Date => {
  const year = date.getFullYear();
  const month = date.getMonth();
  // Financial year ends on March 31st in India
  return new Date(month < 3 ? year : year + 1, 2, 31, 23, 59, 59, 999);
};

type DateRange = {
  from: Date;
  to: Date;
};

interface ReportContextType {
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  timeRange: string;
  setTimeRange: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  refreshTrigger: number;
  refreshReports: () => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfFinancialYear(today),
    to: endOfFinancialYear(today),
  });
  const [timeRange, setTimeRange] = useState<string>("thisFinancialYear");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshReports = () => setRefreshTrigger(prev => prev + 1);

  return (
    <ReportContext.Provider value={{
      dateRange,
      setDateRange,
      timeRange,
      setTimeRange,
      isLoading,
      setIsLoading,
      refreshTrigger,
      refreshReports
    }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReportContext = () => {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReportContext must be used within a ReportProvider');
  }
  return context;
};
