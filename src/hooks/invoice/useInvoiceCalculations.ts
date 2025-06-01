
import { useEffect } from "react";

interface UseInvoiceCalculationsParams {
  invoice: any;
  company: any;
  customers: any[];
  setSubtotal: (value: number) => void;
  setGstDetails: (value: { cgst: number; sgst: number; igst: number }) => void;
  setTotal: (value: number) => void;
}

export const useInvoiceCalculations = ({
  invoice,
  customers,
  company,
  setSubtotal,
  setGstDetails,
  setTotal
}: UseInvoiceCalculationsParams) => {
  // Get customer by ID
  const getCustomerById = (id: string) => {
    console.log("Looking for customer with ID:", id);
    console.log("Available customers:", customers);
    const foundCustomer = customers.find(customer => customer.id === id);
    console.log("Found customer:", foundCustomer);
    return foundCustomer;
  };
  
  // Calculate totals whenever invoice items change or customer changes
  useEffect(() => {
    console.log("Calculating totals...");
    console.log("Current invoice items:", invoice.items);
    console.log("Current customer ID:", invoice.customerId);
    
    // Safety check for invoice.items
    const items = Array.isArray(invoice.items) ? invoice.items : [];
    
    const calcSubtotal = items.reduce((acc: number, item: any) => {
      return acc + (item.price * item.quantity);
    }, 0);
    
    console.log("Calculated subtotal:", calcSubtotal);
    setSubtotal(calcSubtotal);
    
    // Get customer and determine if we should use CGST+SGST or IGST
    const customer = getCustomerById(invoice.customerId);
    console.log("Customer for GST calculation:", customer);
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    items.forEach((item: any) => {
      const gstAmount = (item.price * item.quantity * item.gstRate) / 100;
      
      if (customer && company) {
        console.log("Customer state:", customer.shipping_state);
        console.log("Company state:", company.state);
        // Compare customer's shipping state with company's state
        // If they match, use CGST+SGST, otherwise use IGST
        if (customer.shipping_state === company.state) {
          // Intra-state: Use CGST + SGST
          cgst += gstAmount / 2;
          sgst += gstAmount / 2;
          console.log("Intra-state GST applied");
        } else {
          // Inter-state: Use IGST
          igst += gstAmount;
          console.log("Inter-state GST applied");
        }
      } else {
        // Default to intra-state if customer or company not found
        cgst += gstAmount / 2;
        sgst += gstAmount / 2;
        console.log("Default intra-state GST applied (customer or company missing)");
      }
    });
    
    console.log("GST calculations:", { cgst, sgst, igst });
    setGstDetails({ cgst, sgst, igst });
    
    const finalTotal = calcSubtotal + cgst + sgst + igst;
    console.log("Final total:", finalTotal);
    setTotal(finalTotal);
    
  }, [invoice.items, invoice.customerId, customers, company, setSubtotal, setGstDetails, setTotal]);

  return {
    getCustomerById
  };
};
