
import { useState } from "react";
import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
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
import { CalendarIcon } from "lucide-react";

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
            value={invoice.financialYear} 
            onValueChange={handleFinancialYearChange}
          >
            <SelectTrigger id="financialYear">
              <SelectValue placeholder="Select financial year" />
            </SelectTrigger>
            <SelectContent>
              {financialYears.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <div className="flex gap-2">
            <Input
              id="invoiceNumber"
              value={invoice.invoiceNumber}
              readOnly={true}
              className="flex-1 bg-gray-50"
            />
            {!isEditing && (
              <Button 
                variant="outline" 
                onClick={generateInvoiceNumber}
                disabled={isGeneratingInvoiceNumber || !invoice.financialYear}
                className="whitespace-nowrap"
              >
                {isGeneratingInvoiceNumber ? "Generating..." : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            )}
          </div>
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
            options={(customers || []).map(customer => ({ 
              value: customer.id, 
              label: customer.name 
            }))}
            value={invoice.customerId}
            onValueChange={(value) => setInvoice(prev => ({ ...prev, customerId: value }))}
            placeholder="Select a customer"
            searchPlaceholder="Search customers..."
            emptyMessage="No customers found."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={invoice.status} onValueChange={(value) => setInvoice(prev => ({ ...prev, status: value }))}>
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
