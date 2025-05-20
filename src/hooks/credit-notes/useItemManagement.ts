
import { useState } from "react";
import { CreditNoteData, CreditNoteItem } from "./types";
import { toast } from "@/hooks/use-toast";

export const useItemManagement = (
  creditNote: CreditNoteData,
  setCreditNote: (value: React.SetStateAction<CreditNoteData>) => void,
  invoiceItems: any[]
) => {
  const [selectedItems, setSelectedItems] = useState<{[key: string]: boolean}>({});
  const [showQuantityError, setShowQuantityError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Toggle item selection with improved error handling
  const toggleItemSelection = (itemId: string) => {
    try {
      if (!itemId) {
        console.log("Invalid item ID for selection toggle");
        return;
      }
      
      setSelectedItems(prev => ({
        ...prev,
        [itemId]: !prev[itemId]
      }));
    } catch (error) {
      console.error("Error toggling item selection:", error);
    }
  };
  
  // Add selected items to credit note with improved error handling
  const addSelectedItems = () => {
    try {
      if (!Array.isArray(invoiceItems)) {
        console.log("Invoice items is not an array");
        return;
      }
      
      // Create a set of invoice item IDs that are already in the credit note
      const existingItemIds = new Set(
        (Array.isArray(creditNote.items) ? creditNote.items : [])
          .map(item => item.invoiceItemId)
          .filter(id => id)
      );
      
      // Only add items that are not already in the credit note
      const itemsToAdd = invoiceItems
        .filter(item => selectedItems[item.id] && !existingItemIds.has(item.id))
        .map(item => ({
          id: `temp-${Date.now()}-${item.id}`,
          invoiceItemId: item.id,
          productId: item.product_id || "",
          productName: item.product_name || item.productName || "Unknown Product", 
          hsnCode: item.hsn_code || item.hsnCode || "", 
          quantity: item.availableQuantity || 0, 
          price: item.price || 0,
          unit: item.unit || "",
          gstRate: item.gst_rate || item.gstRate || 0,
          maxQuantity: item.availableQuantity || 0
        }));
        
      if (itemsToAdd.length === 0) {
        // If no new items to add, check if we tried to add duplicate items
        const duplicateItems = invoiceItems.filter(
          item => selectedItems[item.id] && existingItemIds.has(item.id)
        );
        
        if (duplicateItems.length > 0) {
          toast({
            title: "Items Already Added",
            description: "The selected items are already in the credit note.",
            variant: "default", // Changed from "warning" to "default"
          });
        }
        
        console.log("No new items to add");
        return;
      }
      
      setCreditNote(prev => ({
        ...prev,
        items: [...(Array.isArray(prev.items) ? prev.items : []), ...itemsToAdd]
      }));
      
      // Clear selections
      setSelectedItems({});
      
      toast({
        title: "Items Added",
        description: `Added ${itemsToAdd.length} item(s) to the credit note.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error adding selected items:", error);
      toast({
        title: "Error",
        description: "Failed to add selected items. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Remove an item from the credit note with improved error handling
  const removeItem = (id: string) => {
    try {
      if (!id) {
        console.log("Invalid item ID for removal");
        return;
      }
      
      setCreditNote(prev => {
        if (!Array.isArray(prev.items)) {
          return { ...prev, items: [] };
        }
        
        return {
          ...prev,
          items: prev.items.filter(item => item.id !== id)
        };
      });
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };
  
  // Update an item in the credit note with improved error handling
  const updateItem = (id: string, field: keyof CreditNoteItem, value: any) => {
    try {
      if (!id) {
        console.log("Invalid item ID for update");
        return;
      }
      
      setCreditNote(prev => {
        if (!Array.isArray(prev.items)) {
          return { ...prev, items: [] };
        }
        
        return {
          ...prev,
          items: prev.items.map(item => {
            if (item.id === id) {
              // For quantity, check if it exceeds maximum
              if (field === "quantity") {
                const maxQty = (item as any).maxQuantity;
                if (maxQty !== undefined && Number(value) > maxQty) {
                  setErrorMessage(`Maximum available quantity is ${maxQty}`);
                  setShowQuantityError(true);
                  return item;
                }
              }
              return { ...item, [field]: value };
            }
            return item;
          })
        };
      });
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  return {
    selectedItems,
    showQuantityError,
    setShowQuantityError,
    errorMessage,
    toggleItemSelection,
    addSelectedItems,
    removeItem,
    updateItem
  };
};
