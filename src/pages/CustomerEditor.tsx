
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Address } from "@/types";

// List of Indian states for the dropdown
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const CustomerEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    gstin: "",
    category: "",
    billingAddress: {
      line1: "",
      line2: "",
      city: "",
      state: "Maharashtra",
      pincode: "",
    } as Address,
    shippingAddress: {
      line1: "",
      line2: "",
      city: "",
      state: "Maharashtra",
      pincode: "",
    } as Address,
    useShippingForBilling: true,
  });
  
  useEffect(() => {
    if (isEditing && id) {
      // In a real app, this would fetch the customer from an API
      // For now, use mock data
      const mockCustomer = {
        name: "ABC Technologies",
        email: "contact@abctech.com",
        phone: "9876543210",
        gstin: "27AAAAA0000A1Z5",
        category: "IT Services",
        billingAddress: {
          line1: "123 Tech Park",
          line2: "Sector 1",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
        },
        shippingAddress: {
          line1: "123 Tech Park",
          line2: "Sector 1",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
        },
        useShippingForBilling: true,
      };
      setCustomer(mockCustomer);
    }
  }, [id, isEditing]);
  
  const handleInputChange = (
    field: string,
    value: string,
    addressType?: 'billingAddress' | 'shippingAddress'
  ) => {
    if (addressType) {
      setCustomer((prev) => ({
        ...prev,
        [addressType]: {
          ...prev[addressType],
          [field]: value,
        },
      }));
      
      // If using same address for shipping and billing
      if (customer.useShippingForBilling && addressType === 'shippingAddress') {
        setCustomer((prev) => ({
          ...prev,
          billingAddress: {
            ...prev.billingAddress,
            [field]: value,
          },
        }));
      }
    } else {
      setCustomer((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };
  
  // Toggle using same address for shipping and billing
  const toggleAddressUse = () => {
    setCustomer((prev) => {
      const newValue = !prev.useShippingForBilling;
      
      if (newValue) {
        // Copy shipping address to billing address
        return {
          ...prev,
          useShippingForBilling: newValue,
          billingAddress: { ...prev.shippingAddress },
        };
      } else {
        return { ...prev, useShippingForBilling: newValue };
      }
    });
  };
  
  const handleSave = () => {
    // Validate the form
    if (!customer.name) {
      toast({
        title: "Error",
        description: "Customer name is required.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would save to the database
    console.log("Saving customer:", customer);
    
    toast({
      title: `Customer ${isEditing ? 'Updated' : 'Created'}`,
      description: `${customer.name} has been ${isEditing ? 'updated' : 'added'} successfully.`,
    });
    
    navigate("/app/customers");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Customer" : "Add New Customer"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/customers")}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Customer
          </Button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the customer's basic details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                placeholder="Enter customer name"
                value={customer.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={customer.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={customer.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN</Label>
              <Input
                id="gstin"
                placeholder="27AAAAA0000A1Z5"
                value={customer.gstin}
                onChange={(e) => handleInputChange("gstin", e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Enter 15-digit GST Identification Number
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Customer Category (Optional)</Label>
              <Input
                id="category"
                placeholder="E.g., Retail, Wholesale, etc."
                value={customer.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>
                Manage shipping and billing addresses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="shipping">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="shipping">Shipping Address</TabsTrigger>
                  <TabsTrigger value="billing" disabled={customer.useShippingForBilling}>
                    Billing Address
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="shipping" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipping-line1">Address Line 1</Label>
                    <Input
                      id="shipping-line1"
                      placeholder="Street address, P.O. box"
                      value={customer.shippingAddress.line1}
                      onChange={(e) => 
                        handleInputChange("line1", e.target.value, "shippingAddress")
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shipping-line2">Address Line 2</Label>
                    <Input
                      id="shipping-line2"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                      value={customer.shippingAddress.line2}
                      onChange={(e) => 
                        handleInputChange("line2", e.target.value, "shippingAddress")
                      }
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shipping-city">City</Label>
                      <Input
                        id="shipping-city"
                        placeholder="City"
                        value={customer.shippingAddress.city}
                        onChange={(e) => 
                          handleInputChange("city", e.target.value, "shippingAddress")
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shipping-pincode">PIN Code</Label>
                      <Input
                        id="shipping-pincode"
                        placeholder="PIN Code"
                        value={customer.shippingAddress.pincode}
                        onChange={(e) => 
                          handleInputChange("pincode", e.target.value, "shippingAddress")
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shipping-state">State</Label>
                    <Select
                      value={customer.shippingAddress.state}
                      onValueChange={(value) => 
                        handleInputChange("state", value, "shippingAddress")
                      }
                    >
                      <SelectTrigger id="shipping-state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="use-same-address"
                      checked={customer.useShippingForBilling}
                      onChange={toggleAddressUse}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="use-same-address" className="text-sm cursor-pointer">
                      Use same address for billing
                    </Label>
                  </div>
                </TabsContent>
                
                <TabsContent value="billing" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="billing-line1">Address Line 1</Label>
                    <Input
                      id="billing-line1"
                      placeholder="Street address, P.O. box"
                      value={customer.billingAddress.line1}
                      onChange={(e) => 
                        handleInputChange("line1", e.target.value, "billingAddress")
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="billing-line2">Address Line 2</Label>
                    <Input
                      id="billing-line2"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                      value={customer.billingAddress.line2}
                      onChange={(e) => 
                        handleInputChange("line2", e.target.value, "billingAddress")
                      }
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billing-city">City</Label>
                      <Input
                        id="billing-city"
                        placeholder="City"
                        value={customer.billingAddress.city}
                        onChange={(e) => 
                          handleInputChange("city", e.target.value, "billingAddress")
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="billing-pincode">PIN Code</Label>
                      <Input
                        id="billing-pincode"
                        placeholder="PIN Code"
                        value={customer.billingAddress.pincode}
                        onChange={(e) => 
                          handleInputChange("pincode", e.target.value, "billingAddress")
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="billing-state">State</Label>
                    <Select
                      value={customer.billingAddress.state}
                      onValueChange={(value) => 
                        handleInputChange("state", value, "billingAddress")
                      }
                    >
                      <SelectTrigger id="billing-state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => navigate("/app/customers")}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Customer
        </Button>
      </div>
    </div>
  );
};

export default CustomerEditor;
