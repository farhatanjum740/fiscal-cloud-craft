
import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

interface UseInvoiceItemsParams {
  invoice: any;
  setInvoice: (setter: (prev: any) => any) => void;
  products: any[];
}

export const useInvoiceItems = ({
  invoice,
  setInvoice,
  products,
}: UseInvoiceItemsParams) => {
  const addItem = useCallback(() => {
    const newItem = {
      id: uuidv4(),
      productId: "",
      productName: "",
      description: "",
      hsnCode: "",
      price: 0,
      quantity: 1,
      gstRate: 0,
      unit: "",
    };
    
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  }, [setInvoice]);

  const removeItem = useCallback((itemId: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter((item: any) => item.id !== itemId)
    }));
  }, [setInvoice]);

  const updateItem = useCallback((itemId: string, field: string, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map((item: any) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  }, [setInvoice]);

  const handleProductSelect = useCallback((itemId: string, productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      setInvoice(prev => ({
        ...prev,
        items: prev.items.map((item: any) =>
          item.id === itemId ? {
            ...item,
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            description: selectedProduct.description || "",
            hsnCode: selectedProduct.hsn_code || "",
            price: selectedProduct.price,
            gstRate: selectedProduct.gst_rate,
            unit: selectedProduct.unit || "",
          } : item
        )
      }));
    }
  }, [setInvoice, products]);

  return {
    addItem,
    removeItem,
    updateItem,
    handleProductSelect
  };
};
