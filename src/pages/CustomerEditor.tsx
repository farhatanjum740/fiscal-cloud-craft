import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { SubscriptionProvider } from "@/components/subscription/SubscriptionProvider";
import { useUsageLimits } from "@/hooks/useUsageLimits";

const CustomerEditorContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkCustomerLimit } = useUsageLimits();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    gstin: "",
    category: "",
    billing_address_line1: "",
    billing_address_line2: "",
    billing_city: "",
    billing_state: "",
    billing_pincode: "",
    shipping_address_line1: "",
    shipping_address_line2: "",
    shipping_city: "",
    shipping_state: "",
    shipping_pincode: "",
  });
  const [sameAsShipping, setSameAsShipping] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) {
        setCustomer(data);
      }
    } catch (error: any) {
      console.error("Error fetching customer:", error);
      toast({
        title: "Error",
        description: "Failed to fetch customer data",
        variant: "destructive",
      });
    }
  };

  const handleSameAsShipping = (checked: boolean) => {
    setSameAsShipping(checked);
    if (checked) {
      setCustomer(prev => ({
        ...prev,
        shipping_address_line1: prev.billing_address_line1,
        shipping_address_line2: prev.billing_address_line2,
        shipping_city: prev.billing_city,
        shipping_state: prev.billing_state,
        shipping_pincode: prev.billing_pincode,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check usage limits for new customers only
      if (!id) {
        const canCreate = await checkCustomerLimit();
        if (!canCreate) {
          setLoading(false);
          return; // Toast is shown by checkCustomerLimit
        }
      }

      const customerData = {
        ...customer,
        user_id: user?.id,
      };

      let result;
      if (id) {
        result = await supabase
          .from("customers")
          .update(customerData)
          .eq("id", id);
      } else {
        result = await supabase
          .from("customers")
          .insert([customerData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Customer ${id ? "updated" : "created"} successfully!`,
      });

      navigate("/app/customers");
    } catch (error: any) {
      console.error("Error saving customer:", error);
      toast({
        title: "Error",
        description: `Failed to ${id ? "update" : "create"} customer: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {id ? "Edit Customer" : "Add New Customer"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/customers")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {id ? "Update" : "Create"} Customer
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic customer details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  value={customer.name}
                  onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={customer.phone}
                  onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  value={customer.gstin}
                  onChange={(e) => setCustomer(prev => ({ ...prev, gstin: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={customer.category}
                onChange={(e) => setCustomer(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Retail, Wholesale, Services"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Address</CardTitle>
            <CardDescription>
              Enter the customer's billing address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="billing_address_line1">Address Line 1</Label>
              <Input
                id="billing_address_line1"
                value={customer.billing_address_line1}
                onChange={(e) => setCustomer(prev => ({ ...prev, billing_address_line1: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="billing_address_line2">Address Line 2</Label>
              <Input
                id="billing_address_line2"
                value={customer.billing_address_line2}
                onChange={(e) => setCustomer(prev => ({ ...prev, billing_address_line2: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="billing_city">City</Label>
                <Input
                  id="billing_city"
                  value={customer.billing_city}
                  onChange={(e) => setCustomer(prev => ({ ...prev, billing_city: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="billing_state">State</Label>
                <Input
                  id="billing_state"
                  value={customer.billing_state}
                  onChange={(e) => setCustomer(prev => ({ ...prev, billing_state: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="billing_pincode">Pincode</Label>
                <Input
                  id="billing_pincode"
                  value={customer.billing_pincode}
                  onChange={(e) => setCustomer(prev => ({ ...prev, billing_pincode: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
            <CardDescription>
              Enter the customer's shipping address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sameAsShipping"
                checked={sameAsShipping}
                onCheckedChange={handleSameAsShipping}
              />
              <Label htmlFor="sameAsShipping">Same as billing address</Label>
            </div>
            
            <div>
              <Label htmlFor="shipping_address_line1">Address Line 1</Label>
              <Input
                id="shipping_address_line1"
                value={customer.shipping_address_line1}
                onChange={(e) => setCustomer(prev => ({ ...prev, shipping_address_line1: e.target.value }))}
                disabled={sameAsShipping}
              />
            </div>
            <div>
              <Label htmlFor="shipping_address_line2">Address Line 2</Label>
              <Input
                id="shipping_address_line2"
                value={customer.shipping_address_line2}
                onChange={(e) => setCustomer(prev => ({ ...prev, shipping_address_line2: e.target.value }))}
                disabled={sameAsShipping}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="shipping_city">City</Label>
                <Input
                  id="shipping_city"
                  value={customer.shipping_city}
                  onChange={(e) => setCustomer(prev => ({ ...prev, shipping_city: e.target.value }))}
                  disabled={sameAsShipping}
                />
              </div>
              <div>
                <Label htmlFor="shipping_state">State</Label>
                <Input
                  id="shipping_state"
                  value={customer.shipping_state}
                  onChange={(e) => setCustomer(prev => ({ ...prev, shipping_state: e.target.value }))}
                  disabled={sameAsShipping}
                />
              </div>
              <div>
                <Label htmlFor="shipping_pincode">Pincode</Label>
                <Input
                  id="shipping_pincode"
                  value={customer.shipping_pincode}
                  onChange={(e) => setCustomer(prev => ({ ...prev, shipping_pincode: e.target.value }))}
                  disabled={sameAsShipping}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate("/app/customers")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {id ? "Update" : "Create"} Customer
          </Button>
        </div>
      </form>
    </div>
  );
};

const CustomerEditor = () => {
  return (
    <SubscriptionProvider>
      <CustomerEditorContent />
    </SubscriptionProvider>
  );
};

export default CustomerEditor;
