
import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Augment jsPDF type for autoTable plugin
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ExportButtonsProps {
  data: any[];
  columns: { header: string; accessorKey: string }[];
  fileName: string;
  tableRef?: React.RefObject<HTMLTableElement>;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ data, columns, fileName, tableRef }) => {
  const exportToExcel = () => {
    try {
      // Format data for Excel export
      const excelData = data.map(item => {
        const row: Record<string, any> = {};
        columns.forEach(column => {
          row[column.header] = item[column.accessorKey];
        });
        return row;
      });
      
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      
      toast({
        title: "Export Successful",
        description: `${fileName} has been exported to Excel.`,
      });
    } catch (error) {
      console.error("Excel export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export to Excel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportToPdf = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text(fileName, 14, 15);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
      
      // Format data for PDF table
      const tableData = data.map(item => {
        return columns.map(column => item[column.accessorKey]);
      });
      
      doc.autoTable({
        head: [columns.map(column => column.header)],
        body: tableData,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202], textColor: 255 },
        styles: { fontSize: 8 },
        margin: { top: 30 }
      });
      
      doc.save(`${fileName}.pdf`);
      
      toast({
        title: "Export Successful",
        description: `${fileName} has been exported to PDF.`,
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export to PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel}>
          Export to Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPdf}>
          Export to PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButtons;
