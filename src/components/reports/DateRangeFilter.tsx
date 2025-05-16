
import React, { useEffect } from "react";
import { Calendar } from "lucide-react";
import { format, subDays, subMonths, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useReportContext, startOfFinancialYear, endOfFinancialYear } from "@/contexts/ReportContext";

const DateRangeFilter = () => {
  const { 
    dateRange, 
    setDateRange, 
    timeRange, 
    setTimeRange 
  } = useReportContext();

  // Update date range based on selected time range
  useEffect(() => {
    const today = new Date();
    let from, to;

    switch (timeRange) {
      case "7days":
        from = subDays(today, 7);
        to = today;
        break;
      case "30days":
        from = subDays(today, 30);
        to = today;
        break;
      case "thisWeek":
        from = startOfWeek(today, { weekStartsOn: 1 }); // Monday
        to = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
        break;
      case "thisMonth":
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      case "lastMonth":
        from = startOfMonth(subMonths(today, 1));
        to = endOfMonth(subMonths(today, 1));
        break;
      case "thisYear":
        from = startOfYear(today);
        to = endOfYear(today);
        break;
      case "lastYear":
        from = startOfYear(subYears(today, 1));
        to = endOfYear(subYears(today, 1));
        break;
      case "thisFinancialYear":
        from = startOfFinancialYear(today);
        to = endOfFinancialYear(today);
        break;
      case "lastFinancialYear":
        const lastYear = subYears(today, 1);
        from = startOfFinancialYear(lastYear);
        to = endOfFinancialYear(lastYear);
        break;
      case "custom":
        // Don't change the date range for custom selection
        return;
      default:
        from = startOfFinancialYear(today);
        to = endOfFinancialYear(today);
    }

    setDateRange({ from, to });
  }, [timeRange, setDateRange]);

  // Format the date range for display
  const formatDateRange = () => {
    if (!dateRange.from || !dateRange.to) return "Select date range";
    
    return `${format(dateRange.from, "dd MMM yyyy")} - ${format(dateRange.to, "dd MMM yyyy")}`;
  };

  // Handle custom date selection
  const handleCustomDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    // If 'from' is not set or both are set, reset range and set 'from'
    if (!dateRange.from || (dateRange.from && dateRange.to)) {
      setDateRange({ from: date, to: date });
    } 
    // If 'from' is set but 'to' is not, set 'to'
    else {
      // Ensure 'to' is not before 'from'
      if (date < dateRange.from) {
        setDateRange({ from: date, to: dateRange.from });
      } else {
        setDateRange({ ...dateRange, to: date });
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 md:items-center mb-6">
      <div className="flex-shrink-0">
        <Select value={timeRange} onValueChange={(value) => {
          setTimeRange(value);
          if (value === "custom") return; // Don't reset date range for custom
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="thisWeek">This week</SelectItem>
            <SelectItem value="thisMonth">This month</SelectItem>
            <SelectItem value="lastMonth">Last month</SelectItem>
            <SelectItem value="thisYear">Calendar year</SelectItem>
            <SelectItem value="lastYear">Last calendar year</SelectItem>
            <SelectItem value="thisFinancialYear">This financial year</SelectItem>
            <SelectItem value="lastFinancialYear">Last financial year</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {timeRange === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal md:w-auto">
              <Calendar className="mr-2 h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onSelect={(range) => {
                if (range?.from) setDateRange({ from: range.from, to: range.to || range.from });
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default DateRangeFilter;
