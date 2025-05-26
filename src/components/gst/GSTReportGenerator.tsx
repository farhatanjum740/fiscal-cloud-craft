
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Download, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/hooks/useCompany';
import { toast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

const GSTReportGenerator = () => {
  const { user } = useAuth();
  const { company } = useCompany(user?.id);
  const [reportType, setReportType] = useState<'gstr1' | 'gstr3b'>('gstr1');
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [loading, setLoading] = useState(false);

  const generateGSTR1Report = async () => {
    if (!user || !company || !fromDate || !toDate) return;

    try {
      setLoading(true);

      // Fetch invoices for the period
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!invoices_customer_id_fkey(name, gstin, billing_state),
          invoice_items!invoices_invoice_id_fkey(*)
        `)
        .eq('company_id', company.id)
        .eq('status', 'paid')
        .gte('invoice_date', format(fromDate, 'yyyy-MM-dd'))
        .lte('invoice_date', format(toDate, 'yyyy-MM-dd'))
        .order('invoice_date');

      if (error) throw error;

      // Process data for GSTR-1 format
      const gstr1Data = invoices?.map(invoice => {
        const customer = invoice.customers;
        const items = invoice.invoice_items || [];
        
        return items.map(item => ({
          'Invoice Number': invoice.invoice_number,
          'Invoice Date': format(new Date(invoice.invoice_date), 'dd/MM/yyyy'),
          'Customer Name': customer?.name || '',
          'Customer GSTIN': customer?.gstin || 'Unregistered',
          'Customer State': customer?.billing_state || '',
          'Product/Service': item.product_name,
          'HSN/SAC': item.hsn_code || '',
          'Quantity': item.quantity,
          'Unit': item.unit,
          'Rate': item.price,
          'Taxable Value': (item.quantity * item.price).toFixed(2),
          'GST Rate': `${item.gst_rate}%`,
          'CGST': customer?.billing_state === company.state ? 
            ((item.quantity * item.price * item.gst_rate) / 200).toFixed(2) : '0.00',
          'SGST': customer?.billing_state === company.state ? 
            ((item.quantity * item.price * item.gst_rate) / 200).toFixed(2) : '0.00',
          'IGST': customer?.billing_state !== company.state ? 
            ((item.quantity * item.price * item.gst_rate) / 100).toFixed(2) : '0.00',
          'Total Invoice Value': invoice.total_amount.toFixed(2)
        }));
      }).flat() || [];

      // Create workbook and download
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(gstr1Data);
      XLSX.utils.book_append_sheet(wb, ws, 'GSTR-1');
      
      const fileName = `GSTR-1_${format(fromDate, 'yyyy-MM')}_to_${format(toDate, 'yyyy-MM')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "GSTR-1 Report Generated",
        description: `Report downloaded as ${fileName}`,
      });

    } catch (error) {
      console.error('Error generating GSTR-1 report:', error);
      toast({
        title: "Error",
        description: "Failed to generate GSTR-1 report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateGSTR3BReport = async () => {
    if (!user || !company || !fromDate || !toDate) return;

    try {
      setLoading(true);

      // Fetch invoices for the period
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!invoices_customer_id_fkey(billing_state, gstin),
          invoice_items!invoices_invoice_id_fkey(*)
        `)
        .eq('company_id', company.id)
        .eq('status', 'paid')
        .gte('invoice_date', format(fromDate, 'yyyy-MM-dd'))
        .lte('invoice_date', 'yyyy-MM-dd'))
        .order('invoice_date');

      if (error) throw error;

      // Calculate GSTR-3B summary
      let totalTaxableValue = 0;
      let totalCGST = 0;
      let totalSGST = 0;
      let totalIGST = 0;
      let interStateSupplies = 0;
      let intraStateSupplies = 0;

      invoices?.forEach(invoice => {
        const customer = invoice.customers;
        const items = invoice.invoice_items || [];
        
        items.forEach(item => {
          const taxableValue = item.quantity * item.price;
          totalTaxableValue += taxableValue;
          
          if (customer?.billing_state === company.state) {
            // Intra-state
            const cgst = (taxableValue * item.gst_rate) / 200;
            const sgst = (taxableValue * item.gst_rate) / 200;
            totalCGST += cgst;
            totalSGST += sgst;
            intraStateSupplies += taxableValue + cgst + sgst;
          } else {
            // Inter-state
            const igst = (taxableValue * item.gst_rate) / 100;
            totalIGST += igst;
            interStateSupplies += taxableValue + igst;
          }
        });
      });

      const gstr3bData = [
        { 'Description': 'Total Taxable Supplies', 'Amount': totalTaxableValue.toFixed(2) },
        { 'Description': 'Total CGST', 'Amount': totalCGST.toFixed(2) },
        { 'Description': 'Total SGST', 'Amount': totalSGST.toFixed(2) },
        { 'Description': 'Total IGST', 'Amount': totalIGST.toFixed(2) },
        { 'Description': 'Inter-State Supplies', 'Amount': interStateSupplies.toFixed(2) },
        { 'Description': 'Intra-State Supplies', 'Amount': intraStateSupplies.toFixed(2) },
        { 'Description': 'Total Tax Liability', 'Amount': (totalCGST + totalSGST + totalIGST).toFixed(2) }
      ];

      // Create workbook and download
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(gstr3bData);
      XLSX.utils.book_append_sheet(wb, ws, 'GSTR-3B Summary');
      
      const fileName = `GSTR-3B_${format(fromDate, 'yyyy-MM')}_to_${format(toDate, 'yyyy-MM')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "GSTR-3B Report Generated",
        description: `Report downloaded as ${fileName}`,
      });

    } catch (error) {
      console.error('Error generating GSTR-3B report:', error);
      toast({
        title: "Error",
        description: "Failed to generate GSTR-3B report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          GST Report Generator
        </CardTitle>
        <CardDescription>
          Generate GSTR-1 and GSTR-3B reports for GST filing compliance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">From Date</label>
            <DatePicker
              selected={fromDate}
              onSelect={setFromDate}
              placeholder="Select start date"
            />
          </div>
          <div>
            <label className="text-sm font-medium">To Date</label>
            <DatePicker
              selected={toDate}
              onSelect={setToDate}
              placeholder="Select end date"
            />
          </div>
        </div>

        <Button
          onClick={handleGenerateReport}
          disabled={!fromDate || !toDate || loading}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Generating...' : `Generate ${reportType.toUpperCase()} Report`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GSTReportGenerator;
