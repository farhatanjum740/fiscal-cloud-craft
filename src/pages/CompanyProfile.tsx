
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
import { Building, Upload, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Company, Address, BankDetails } from "@/types";

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
    } as Address,
    registeredAddress: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: ""
    } as Address,
    useMainAddress: true,
    bankDetails: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      ifscCode: "",
      branch: ""
    } as BankDetails,
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Fetch company data
  const { data: companyData, isLoading } = useQuery({
    queryKey: ['company'],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        // If no company found, return null rather than throwing an error
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(error.message);
      }
      
      return data;
    },
    enabled: !!user,
  });
  
  // Mutation to create/update company
  const mutation = useMutation({
    mutationFn: async (companyData: any) => {
      if (!user) throw new Error('User not authenticated');
      
      // Check if company exists
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      let result;
      
      if (existingCompany) {
        // Update existing company
        result = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', existingCompany.id)
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
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast({
        title: "Profile Updated",
        description: "Your company profile has been updated successfully.",
      });
      setLoading(false);
    },
    onError: (error) => {
      console.error('Error saving company:', error);
      toast({
        title: "Error",
        description: "Failed to save company profile. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  });
  
  // Set company data from API
  useEffect(() => {
    if (companyData) {
      setCompany({
        name: companyData.name || '',
        logo: companyData.logo || '',
        gstin: companyData.gstin || '',
        pan: companyData.pan || '',
        contact_number: companyData.contact_number || '',
        email_id: companyData.email_id || '',
        address: {
          line1: companyData.address_line1 || '',
          line2: companyData.address_line2 || '',
          city: companyData.city || '',
          state: companyData.state || '',
          pincode: companyData.pincode || ''
        },
        registeredAddress: {
          line1: companyData.registered_address_line1 || '',
          line2: companyData.registered_address_line2 || '',
          city: companyData.registered_city || '',
          state: companyData.registered_state || '',
          pincode: companyData.registered_pincode || ''
        },
        useMainAddress: !companyData.registered_address_line1 || 
          (companyData.address_line1 === companyData.registered_address_line1 && 
           companyData.city === companyData.registered_city),
        bankDetails: {
          accountName: companyData.bank_account_name || '',
          accountNumber: companyData.bank_account_number || '',
          bankName: companyData.bank_name || '',
          ifscCode: companyData.bank_ifsc_code || '',
          branch: companyData.bank_branch || ''
        }
      });
    }
  }, [companyData]);
  
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
    
    // Call mutation to save data
    mutation.mutate(companyData);
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <Building className="h-8 w-8 mr-2" />
          Company Profile
        </h1>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Company Logo</CardTitle>
            <CardDescription>
              Upload your business logo
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-md overflow-hidden border flex items-center justify-center mb-4">
              {company.logo ? (
                <img 
                  src={company.logo} 
                  alt="Company Logo" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                  <Building className="h-12 w-12 mb-2" />
                  <span>No Logo</span>
                </div>
              )}
            </div>
            
            <Label htmlFor="logo-upload" className="cursor-pointer">
              <div className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md">
                <Upload className="h-4 w-4" />
                <span>Upload Logo</span>
              </div>
              <Input 
                id="logo-upload" 
                type="file"
                accept="image/*" 
                className="hidden" 
                onChange={handleLogoChange} 
              />
            </Label>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              Recommended: 400x400 pixels, PNG or JPEG
            </p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Your company's basic details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                placeholder="Enter your company name"
                value={company.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN *</Label>
                <Input
                  id="gstin"
                  placeholder="E.g., 27AAAAA0000A1Z5"
                  value={company.gstin}
                  onChange={(e) => handleInputChange("gstin", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pan">PAN</Label>
                <Input
                  id="pan"
                  placeholder="E.g., AAAAA0000A"
                  value={company.pan}
                  onChange={(e) => handleInputChange("pan", e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-number">
                  <span className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" /> Contact Number
                  </span>
                </Label>
                <Input
                  id="contact-number"
                  placeholder="E.g., +91 9876543210"
                  value={company.contact_number}
                  onChange={(e) => handleInputChange("contact_number", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">
                  <span className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" /> Email Address
                  </span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="E.g., contact@company.com"
                  value={company.email_id}
                  onChange={(e) => handleInputChange("email_id", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
          <CardDescription>
            Manage your business addresses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="address">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="address">Main Address</TabsTrigger>
              <TabsTrigger value="registered" disabled={company.useMainAddress}>
                Registered Address
              </TabsTrigger>
            </TabsList>
            <TabsContent value="address" className="space-y-4 pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address-line1">Address Line 1</Label>
                  <Input
                    id="address-line1"
                    placeholder="Street address, P.O. box"
                    value={company.address.line1}
                    onChange={(e) => 
                      handleInputChange("line1", e.target.value, "address")
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address-line2">Address Line 2</Label>
                  <Input
                    id="address-line2"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    value={company.address.line2}
                    onChange={(e) => 
                      handleInputChange("line2", e.target.value, "address")
                    }
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address-city">City</Label>
                  <Input
                    id="address-city"
                    placeholder="City"
                    value={company.address.city}
                    onChange={(e) => 
                      handleInputChange("city", e.target.value, "address")
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address-state">State</Label>
                  <Select
                    value={company.address.state}
                    onValueChange={(value) => 
                      handleInputChange("state", value, "address")
                    }
                  >
                    <SelectTrigger id="address-state">
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
                
                <div className="space-y-2">
                  <Label htmlFor="address-pincode">PIN Code</Label>
                  <Input
                    id="address-pincode"
                    placeholder="PIN Code"
                    value={company.address.pincode}
                    onChange={(e) => 
                      handleInputChange("pincode", e.target.value, "address")
                    }
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="use-same-address"
                  checked={company.useMainAddress}
                  onChange={toggleAddressUse}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="use-same-address" className="text-sm cursor-pointer">
                  Use same address for registered office
                </Label>
              </div>
            </TabsContent>
            
            <TabsContent value="registered" className="space-y-4 pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registered-line1">Address Line 1</Label>
                  <Input
                    id="registered-line1"
                    placeholder="Street address, P.O. box"
                    value={company.registeredAddress.line1}
                    onChange={(e) => 
                      handleInputChange("line1", e.target.value, "registeredAddress")
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registered-line2">Address Line 2</Label>
                  <Input
                    id="registered-line2"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    value={company.registeredAddress.line2}
                    onChange={(e) => 
                      handleInputChange("line2", e.target.value, "registeredAddress")
                    }
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registered-city">City</Label>
                  <Input
                    id="registered-city"
                    placeholder="City"
                    value={company.registeredAddress.city}
                    onChange={(e) => 
                      handleInputChange("city", e.target.value, "registeredAddress")
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registered-state">State</Label>
                  <Select
                    value={company.registeredAddress.state}
                    onValueChange={(value) => 
                      handleInputChange("state", value, "registeredAddress")
                    }
                  >
                    <SelectTrigger id="registered-state">
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
                
                <div className="space-y-2">
                  <Label htmlFor="registered-pincode">PIN Code</Label>
                  <Input
                    id="registered-pincode"
                    placeholder="PIN Code"
                    value={company.registeredAddress.pincode}
                    onChange={(e) => 
                      handleInputChange("pincode", e.target.value, "registeredAddress")
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
          <CardDescription>
            Your bank account information for invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input
                id="bank-name"
                placeholder="Enter bank name"
                value={company.bankDetails.bankName}
                onChange={(e) => 
                  handleInputChange("bankName", e.target.value, "bankDetails")
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                placeholder="Enter branch name"
                value={company.bankDetails.branch}
                onChange={(e) => 
                  handleInputChange("branch", e.target.value, "bankDetails")
                }
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account-name">Account Name</Label>
              <Input
                id="account-name"
                placeholder="Enter account holder name"
                value={company.bankDetails.accountName}
                onChange={(e) => 
                  handleInputChange("accountName", e.target.value, "bankDetails")
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                placeholder="Enter account number"
                value={company.bankDetails.accountNumber}
                onChange={(e) => 
                  handleInputChange("accountNumber", e.target.value, "bankDetails")
                }
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ifsc">IFSC Code</Label>
            <Input
              id="ifsc"
              placeholder="Enter IFSC code"
              value={company.bankDetails.ifscCode}
              onChange={(e) => 
                handleInputChange("ifscCode", e.target.value, "bankDetails")
              }
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default CompanyProfile;
