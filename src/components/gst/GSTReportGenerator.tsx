
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Download, FileText, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/hooks/useCompany';
import * as XLSX from 'xlsx';

const GSTReportGenerator = () => {
  const { user } = useAuth();
  const { company } = useCompany(user?.id);
  const [reportType, setReportType] = useState<'gstr1' | 'gstr3b'>('gstr1');
  const [period, setPeriod] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateGSTR1Report = async () => {
    if (!company || !startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please select company and date range",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Fetch invoices for the period
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items(*),
          customers(*)
        `)
        .eq('company_id', company.id)
        .gte('invoice_date', startDate.toISOString().split('T')[0])
        .lte('invoice_date', endDate.toISOString().split('T')[0])
        .eq('status', 'paid');

      if (error) {
        throw error;
      }

      // Process data for GSTR-1 format
      const gstr1Data = invoices?.map(invoice => ({
        'Invoice Number': invoice.invoice_number,
        'Invoice Date': new Date(invoice.invoice_date).toLocaleDateString('en-IN'),
        'Customer Name': invoice.customers?.name || '',
        'Customer GSTIN': invoice.customers?.gstin || '',
        'Place of Supply': invoice.customers?.billing_state || '',
        'Taxable Value': invoice.subtotal,
        'CGST Amount': invoice.cgst || 0,
        'SGST Amount': invoice.sgst || 0,
        'IGST Amount': invoice.igst || 0,
        'Total Tax': (invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0),
        'Total Amount': invoice.total_amount
      })) || [];

      // Create Excel file
      const worksheet = XLSX.utils.json_to_sheet(gstr1Data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'GSTR1');
      
      const fileName = `GSTR1_${startDate.toISOString().slice(0, 7)}_${endDate.toISOString().slice(0, 7)}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Report Generated",
        description: "GSTR-1 report has been downloaded successfully"
      });

    } catch (error) {
      console.error('Error generating GSTR-1:', error);
      toast({
        title: "Error",
        description: "Failed to generate GSTR-1 report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateGSTR3BReport = async () => {
    if (!company || !startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please select company and date range",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Fetch data for GSTR-3B calculation
      const { data: invoices, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', company.id)
        .gte('invoice_date', startDate.toISOString().split('T')[0])
        .lte('invoice_date', endDate.toISOString().split('T')[0])
        .eq('status', 'paid');

      if (invoiceError) {
        throw invoiceError;
      }

      // Calculate GSTR-3B summary
      const totalTaxableValue = invoices?.reduce((sum, inv) => sum + (inv.subtotal || 0), 0) || 0;
      const totalCGST = invoices?.reduce((sum, inv) => sum + (inv.cgst || 0), 0) || 0;
      const totalSGST = invoices?.reduce((sum, inv) => sum + (inv.sgst || 0), 0) || 0;
      const totalIGST = invoices?.reduce((sum, inv) => sum + (inv.igst || 0), 0) || 0;

      const gstr3bData = [
        { 'Description': 'Outward Taxable Supplies', 'Taxable Value': totalTaxableValue, 'CGST': totalCGST, 'SGST': totalSGST, 'IGST': totalIGST },
        { 'Description': 'Outward Taxable Supplies (Zero Rated)', 'Taxable Value': 0, 'CGST': 0, 'SGST': 0, 'IGST': 0 },
        { 'Description': 'Other Outward Supplies', 'Taxable Value': 0, 'CGST': 0, 'SGST': 0, 'IGST': 0 },
        { 'Description': 'Inward Supplies (Reverse Charge)', 'Taxable Value': 0, 'CGST': 0, 'SGST': 0, 'IGST': 0 },
        { 'Description': 'Net Tax Liability', 'Taxable Value': '', 'CGST': totalCGST, 'SGST': totalSGST, 'IGST': totalIGST }
      ];

      // Create Excel file
      const worksheet = XLSX.utils.json_to_sheet(gstr3bData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'GSTR3B');
      
      const fileName = `GSTR3B_${startDate.toISOString().slice(0, 7)}_${endDate.toISOString().slice(0, 7)}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Report Generated",
        description: "GSTR-3B report has been downloaded successfully"
      });

    } catch (error) {
      console.error('Error generating GSTR-3B:', error);
      toast({
        title: "Error",
        description: "Failed to generate GSTR-3B report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateReport = () => {
    if (reportType === 'gstr1') {
      generateGSTR1Report();
    } else {
      generateGSTR3BReport();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            GST Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={(value: 'gstr1' | 'gstr3b') => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gstr1">GSTR-1 (Outward Supplies)</SelectItem>
                  <SelectItem value="gstr3b">GSTR-3B (Summary Return)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Month</SelectItem>
                  <SelectItem value="previous">Previous Month</SelectItem>
                  <SelectItem value="quarterly">Current Quarter</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <DatePicker
                selected={startDate}
                onSelect={setStartDate}
                placeholder="Select start date"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <DatePicker
                selected={endDate}
                onSelect={setEndDate}
                placeholder="Select end date"
              />
            </div>
          </div>

          <Button 
            onClick={handleGenerateReport}
            disabled={isGenerating || !startDate || !endDate}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : `Generate ${reportType.toUpperCase()} Report`}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>GSTR-1:</strong> Returns for outward supplies of goods and/or services. Contains details of all sales, including taxable supplies, zero-rated supplies, and exempt supplies.
            </div>
            <div>
              <strong>GSTR-3B:</strong> Monthly summary return that includes details of outward supplies, input tax credit claimed, and tax payable.
            </div>
            <div className="bg-blue-50 p-3 rounded-md">
              <strong>Note:</strong> Reports are generated based on invoices marked as 'paid' status. Ensure all relevant invoices are properly marked before generating reports.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GSTReportGenerator;
