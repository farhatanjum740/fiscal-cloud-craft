
import { useCallback } from "react";
import type { InvoiceItem } from "@/types";

export const useInvoiceItems = (setInvoice: (setter: (prev: any) => any) => void) => {
  // Add a new item to the invoice
  const addItem = useCallback(() => {
    console.log("Adding new invoice item");
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      productId: "",
      productName: "",
      description: "",
      hsnCode: "",
      quantity: 1,
      price: 0,
      unit: "",
      gstRate: 18,
      discountRate: 0,
    };
    
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  }, [setInvoice]);
  
  // Remove an item from the invoice
  const removeItem = useCallback((id: string) => {
    console.log("Removing invoice item with ID:", id);
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  }, [setInvoice]);
  
  // Update an item in the invoice
  const updateItem = useCallback((id: string, field: keyof InvoiceItem, value: any) => {
    console.log(`Updating item ${id}, field ${String(field)} to:`, value);
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  }, [setInvoice]);
  
  // Handle product selection
  const handleProductSelect = useCallback((id: string, productId: string, products: any[]) => {
    console.log(`Product selection for item ${id}, product ID: ${productId}`);
    const selectedProduct = products.find(p => p.id === productId);
    console.log("Selected product:", selectedProduct);
    
    if (selectedProduct) {
      updateItem(id, "productId", productId);
      updateItem(id, "productName", selectedProduct.name);
      updateItem(id, "price", selectedProduct.price);
      updateItem(id, "hsnCode", selectedProduct.hsn_code);
      updateItem(id, "gstRate", selectedProduct.gst_rate);
      updateItem(id, "unit", selectedProduct.unit);
    }
  }, [updateItem]);

  return {
    addItem,
    removeItem,
    updateItem,
    handleProductSelect
  };
};
