
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Upload, Phone, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompanyWithFallback } from "@/hooks/useCompanyWithFallback";

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

const CompanyProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { company: companyFromHook, loading: companyLoading, error: companyError, refetch } = useCompanyWithFallback(user?.id);
  
  const [company, setCompany] = useState({
    name: "",
    logo: "",
    gstin: "",
    pan: "",
    contact_number: "",
    email_id: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: ""
    },
    registeredAddress: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: ""
    },
    useMainAddress: true,
    bankDetails: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      ifscCode: "",
      branch: ""
    },
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Mutation to create/update company
  const mutation = useMutation({
    mutationFn: async (companyData: any) => {
      if (!user) throw new Error('User not authenticated');
      
      let result;
      
      if (companyFromHook?.id) {
        // Update existing company
        result = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', companyFromHook.id)
          .select()
          .single();
      } else {
        // Create new company
        result = await supabase
          .from('companies')
          .insert(companyData)
          .select()
          .single();
      }
      
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      refetch(); // Refetch company data
      toast({
        title: "Profile Updated",
        description: "Your company profile has been updated successfully.",
      });
      setLoading(false);
    },
    onError: (error: any) => {
      console.error('Error saving company:', error);
      toast({
        title: "Error",
        description: `Failed to save company profile: ${error.message}`,
        variant: "destructive",
      });
      setLoading(false);
    }
  });
  
  // Set company data from hook
  useEffect(() => {
    if (companyFromHook) {
      console.log("Setting company data from hook:", companyFromHook);
      setCompany({
        name: companyFromHook.name || '',
        logo: companyFromHook.logo || '',
        gstin: companyFromHook.gstin || '',
        pan: companyFromHook.pan || '',
        contact_number: companyFromHook.contact_number || '',
        email_id: companyFromHook.email_id || '',
        address: {
          line1: companyFromHook.address_line1 || '',
          line2: companyFromHook.address_line2 || '',
          city: companyFromHook.city || '',
          state: companyFromHook.state || '',
          pincode: companyFromHook.pincode || ''
        },
        registeredAddress: {
          line1: companyFromHook.registered_address_line1 || '',
          line2: companyFromHook.registered_address_line2 || '',
          city: companyFromHook.registered_city || '',
          state: companyFromHook.registered_state || '',
          pincode: companyFromHook.registered_pincode || ''
        },
        useMainAddress: !companyFromHook.registered_address_line1 || 
          (companyFromHook.address_line1 === companyFromHook.registered_address_line1 && 
           companyFromHook.city === companyFromHook.registered_city),
        bankDetails: {
          accountName: companyFromHook.bank_account_name || '',
          accountNumber: companyFromHook.bank_account_number || '',
          bankName: companyFromHook.bank_name || '',
          ifscCode: companyFromHook.bank_ifsc_code || '',
          branch: companyFromHook.bank_branch || ''
        }
      });
    }
  }, [companyFromHook]);
  
  const handleInputChange = (
    field: string,
    value: string,
    section?: 'address' | 'registeredAddress' | 'bankDetails'
  ) => {
    if (section) {
      setCompany((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
      
      // If using same address for registered and operational address
      if (company.useMainAddress && section === 'address') {
        setCompany((prev) => ({
          ...prev,
          registeredAddress: {
            ...prev.registeredAddress,
            [field]: value,
          },
        }));
      }
    } else {
      setCompany((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };
  
  // Toggle using same address for registered and operational
  const toggleAddressUse = () => {
    setCompany((prev) => {
      const newValue = !prev.useMainAddress;
      
      if (newValue) {
        // Copy main address to registered address
        return {
          ...prev,
          useMainAddress: newValue,
          registeredAddress: { ...prev.address },
        };
      } else {
        return { ...prev, useMainAddress: newValue };
      }
    });
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      // In a real app, this would upload to a server and get a URL
      // For the mock, we'll use a local data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCompany((prev) => ({
            ...prev,
            logo: event.target?.result as string
          }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleSave = async () => {
    // Validate the form
    if (!company.name) {
      toast({
        title: "Error",
        description: "Company name is required.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save company profile.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    // Map company data to Supabase format
    const companyData = {
      user_id: user.id,
      name: company.name,
      logo: company.logo,
      gstin: company.gstin || null,
      pan: company.pan || null,
      contact_number: company.contact_number || null,
      email_id: company.email_id || null,
      // Address
      address_line1: company.address.line1 || null,
      address_line2: company.address.line2 || null,
      city: company.address.city || null,
      state: company.address.state || null,
      pincode: company.address.pincode || null,
      // Registered address
      registered_address_line1: company.useMainAddress 
        ? company.address.line1 
        : company.registeredAddress.line1 || null,
      registered_address_line2: company.useMainAddress 
        ? company.address.line2 
        : company.registeredAddress.line2 || null,
      registered_city: company.useMainAddress 
        ? company.address.city 
        : company.registeredAddress.city || null,
      registered_state: company.useMainAddress 
        ? company.address.state 
        : company.registeredAddress.state || null,
      registered_pincode: company.useMainAddress 
        ? company.address.pincode 
        : company.registeredAddress.pincode || null,
      // Bank details
      bank_account_name: company.bankDetails.accountName || null,
      bank_account_number: company.bankDetails.accountNumber || null,
      bank_name: company.bankDetails.bankName || null,
      bank_ifsc_code: company.bankDetails.ifscCode || null,
      bank_branch: company.bankDetails.branch || null,
    };
    
    mutation.mutate(companyData);
  };
  
  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view your company profile.</p>
        </div>
      </div>
    );
  }

  if (companyLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <p>Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (companyError) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading company profile: {companyError.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Building className="h-8 w-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold">Company Profile</h1>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="address">Addresses</TabsTrigger>
          <TabsTrigger value="bank">Bank Details</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company's basic information and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Logo */}
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt="Company Logo"
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <Building className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <Label htmlFor="logo-upload" className="block text-sm font-medium mb-2">
                    Company Logo
                  </Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input
                    id="company-name"
                    value={company.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    value={company.gstin}
                    onChange={(e) => handleInputChange("gstin", e.target.value)}
                    placeholder="GST Registration Number"
                  />
                </div>
                <div>
                  <Label htmlFor="pan">PAN Number</Label>
                  <Input
                    id="pan"
                    value={company.pan}
                    onChange={(e) => handleInputChange("pan", e.target.value)}
                    placeholder="PAN Number"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-number">Contact Number</Label>
                  <div className="flex">
                    <Phone className="h-5 w-5 mt-2.5 mr-2 text-gray-400" />
                    <Input
                      id="contact-number"
                      value={company.contact_number}
                      onChange={(e) => handleInputChange("contact_number", e.target.value)}
                      placeholder="Contact Number"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email-id">Email Address</Label>
                  <div className="flex">
                    <Mail className="h-5 w-5 mt-2.5 mr-2 text-gray-400" />
                    <Input
                      id="email-id"
                      type="email"
                      value={company.email_id}
                      onChange={(e) => handleInputChange("email_id", e.target.value)}
                      placeholder="company@example.com"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address">
          <div className="space-y-6">
            {/* Operational Address */}
            <Card>
              <CardHeader>
                <CardTitle>Operational Address</CardTitle>
                <CardDescription>
                  Address where your business operates from
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address-line1">Address Line 1</Label>
                  <Input
                    id="address-line1"
                    value={company.address.line1}
                    onChange={(e) => handleInputChange("line1", e.target.value, "address")}
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <Label htmlFor="address-line2">Address Line 2</Label>
                  <Input
                    id="address-line2"
                    value={company.address.line2}
                    onChange={(e) => handleInputChange("line2", e.target.value, "address")}
                    placeholder="Apartment, suite, etc."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={company.address.city}
                      onChange={(e) => handleInputChange("city", e.target.value, "address")}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select 
                      value={company.address.state} 
                      onValueChange={(value) => handleInputChange("state", value, "address")}
                    >
                      <SelectTrigger>
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
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={company.address.pincode}
                      onChange={(e) => handleInputChange("pincode", e.target.value, "address")}
                      placeholder="Pincode"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registered Address */}
            <Card>
              <CardHeader>
                <CardTitle>Registered Address</CardTitle>
                <CardDescription>
                  Legal registered address of your company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="same-address"
                    checked={company.useMainAddress}
                    onChange={(e) => toggleAddressUse()}
                    className="rounded"
                  />
                  <Label htmlFor="same-address">Same as operational address</Label>
                </div>
                
                <div>
                  <Label htmlFor="reg-address-line1">Address Line 1</Label>
                  <Input
                    id="reg-address-line1"
                    value={company.registeredAddress.line1}
                    onChange={(e) => handleInputChange("line1", e.target.value, "registeredAddress")}
                    placeholder="Street address"
                    disabled={company.useMainAddress}
                  />
                </div>
                <div>
                  <Label htmlFor="reg-address-line2">Address Line 2</Label>
                  <Input
                    id="reg-address-line2"
                    value={company.registeredAddress.line2}
                    onChange={(e) => handleInputChange("line2", e.target.value, "registeredAddress")}
                    placeholder="Apartment, suite, etc."
                    disabled={company.useMainAddress}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="reg-city">City</Label>
                    <Input
                      id="reg-city"
                      value={company.registeredAddress.city}
                      onChange={(e) => handleInputChange("city", e.target.value, "registeredAddress")}
                      placeholder="City"
                      disabled={company.useMainAddress}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-state">State</Label>
                    <Select 
                      value={company.registeredAddress.state} 
                      onValueChange={(value) => handleInputChange("state", value, "registeredAddress")}
                      disabled={company.useMainAddress}
                    >
                      <SelectTrigger>
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
                  <div>
                    <Label htmlFor="reg-pincode">Pincode</Label>
                    <Input
                      id="reg-pincode"
                      value={company.registeredAddress.pincode}
                      onChange={(e) => handleInputChange("pincode", e.target.value, "registeredAddress")}
                      placeholder="Pincode"
                      disabled={company.useMainAddress}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
              <CardDescription>
                Bank account information for payments and invoicing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="account-name">Account Holder Name</Label>
                  <Input
                    id="account-name"
                    value={company.bankDetails.accountName}
                    onChange={(e) => handleInputChange("accountName", e.target.value, "bankDetails")}
                    placeholder="Account holder name"
                  />
                </div>
                <div>
                  <Label htmlFor="account-number">Account Number</Label>
                  <Input
                    id="account-number"
                    value={company.bankDetails.accountNumber}
                    onChange={(e) => handleInputChange("accountNumber", e.target.value, "bankDetails")}
                    placeholder="Bank account number"
                  />
                </div>
                <div>
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input
                    id="bank-name"
                    value={company.bankDetails.bankName}
                    onChange={(e) => handleInputChange("bankName", e.target.value, "bankDetails")}
                    placeholder="Name of the bank"
                  />
                </div>
                <div>
                  <Label htmlFor="ifsc-code">IFSC Code</Label>
                  <Input
                    id="ifsc-code"
                    value={company.bankDetails.ifscCode}
                    onChange={(e) => handleInputChange("ifscCode", e.target.value, "bankDetails")}
                    placeholder="IFSC code"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    value={company.bankDetails.branch}
                    onChange={(e) => handleInputChange("branch", e.target.value, "bankDetails")}
                    placeholder="Branch name/location"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyProfile;
