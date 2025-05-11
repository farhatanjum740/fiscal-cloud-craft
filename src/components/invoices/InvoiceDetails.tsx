
import React, { useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CommandSelect } from "@/components/ui/command-select";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface InvoiceDetailsProps {
  invoice: any;
  setInvoice: React.Dispatch<React.SetStateAction<any>>;
  financialYears: string[];
  customers: any[];
  isEditing: boolean;
  isGeneratingInvoiceNumber: boolean;
  generateInvoiceNumber: () => void;
  handleFinancialYearChange: (year: string) => void;
}

const InvoiceDetails = ({
  invoice,
  setInvoice,
  financialYears,
  customers,
  isEditing,
  isGeneratingInvoiceNumber,
  generateInvoiceNumber,
  handleFinancialYearChange,
}: InvoiceDetailsProps) => {
  // Auto-generate invoice number when financial year changes or on first load (if not editing)
  useEffect(() => {
    try {
      if (!isEditing && invoice.financialYear && !invoice.invoiceNumber) {
        generateInvoiceNumber();
      }
    } catch (error) {
      console.error("Error in invoice number generation effect:", error);
    }
  }, [invoice.financialYear, isEditing, generateInvoiceNumber]);

  // Ensure customers and financialYears are always arrays with additional error handling
  const safeFinancialYears = React.useMemo(() => {
    try {
      if (!financialYears) return [];
      return Array.isArray(financialYears) ? financialYears : [];
    } catch (error) {
      console.error("Error processing financial years:", error);
      return [];
    }
  }, [financialYears]);
  
  const safeCustomers = React.useMemo(() => {
    try {
      if (!customers) return [];
      return Array.isArray(customers) ? customers : [];
    } catch (error) {
      console.error("Error processing customers:", error);
      return [];
    }
  }, [customers]);
  
  // Convert customers to the format expected by CommandSelect with enhanced error handling
  const customerOptions = React.useMemo(() => {
    try {
      if (!safeCustomers || safeCustomers.length === 0) {
        console.log("No customers available for dropdown");
        return [];
      }
      
      return safeCustomers
        .filter(customer => {
          try {
            return customer && typeof customer === 'object';
          } catch (err) {
            console.error("Error filtering customer:", err);
            return false;
          }
        })
        .map(customer => {
          try {
            return {
              value: customer.id?.toString() || "",
              label: customer.name || "Unknown"
            };
          } catch (err) {
            console.error("Error mapping customer to option:", err);
            return { value: "", label: "Error" };
          }
        })
        .filter(option => {
          try {
            return option.value !== "";
          } catch (err) {
            console.error("Error filtering option:", err);
            return false;
          }
        });
    } catch (error) {
      console.error("Error processing customer options:", error);
      return [];
    }
  }, [safeCustomers]);

  console.log("Customer options for dropdown:", customerOptions);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Details</CardTitle>
        <CardDescription>
          Basic information about the invoice
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="financialYear">Financial Year</Label>
          <Select 
            value={invoice.financialYear || ""} 
            onValueChange={handleFinancialYearChange}
          >
            <SelectTrigger id="financialYear">
              <SelectValue placeholder="Select financial year" />
            </SelectTrigger>
            <SelectContent>
              {safeFinancialYears.length > 0 ? (
                safeFinancialYears.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))
              ) : (
                <div className="px-2 py-4 text-center text-sm">No financial years available</div>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <div className="flex gap-2">
            <Input
              id="invoiceNumber"
              value={invoice.invoiceNumber || ""}
              readOnly={true}
              className="flex-1 bg-gray-50"
            />
          </div>
          {isGeneratingInvoiceNumber && <p className="text-xs text-muted-foreground">Generating invoice number...</p>}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Invoice Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !invoice.invoiceDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {invoice.invoiceDate ? (
                    format(invoice.invoiceDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={invoice.invoiceDate}
                  onSelect={(date) => date && setInvoice(prev => ({ ...prev, invoiceDate: date }))}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !invoice.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {invoice.dueDate ? (
                    format(invoice.dueDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={invoice.dueDate}
                  onSelect={(date) => date && setInvoice(prev => ({ ...prev, dueDate: date }))}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customer">Customer</Label>
          <CommandSelect
            options={customerOptions}
            value={invoice.customerId || ""}
            onValueChange={(value) => {
              setInvoice(prev => ({ ...prev, customerId: value }));
            }}
            placeholder="Select a customer"
            searchInputPlaceholder="Search customers..."
            emptyMessage="No customers found."
          />
          {customerOptions.length === 0 && (
            <p className="text-xs text-amber-500">
              No customers available. Please add customers first.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={invoice.status || ""} onValueChange={(value) => setInvoice(prev => ({ ...prev, status: value }))}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceDetails;
