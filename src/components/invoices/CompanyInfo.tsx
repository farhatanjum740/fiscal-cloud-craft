
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail } from "lucide-react";

interface CompanyInfoProps {
  company: any;
}

const CompanyInfo = ({ company }: CompanyInfoProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>
          Your business details that will appear on the invoice
        </CardDescription>
      </CardHeader>
      <CardContent>
        {company ? (
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-gray-50">
              <h3 className="font-semibold text-lg">{company.name}</h3>
              <p className="text-sm text-gray-600">
                {company.address_line1}<br />
                {company.address_line2 && `${company.address_line2}, `}
                {company.city}, {company.state} - {company.pincode}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                GSTIN: {company.gstin || "Not provided"}
              </p>
              {(company.contact_number || company.email_id) && (
                <div className="mt-2">
                  {company.contact_number && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="h-3 w-3 mr-1" /> {company.contact_number}
                    </p>
                  )}
                  {company.email_id && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <Mail className="h-3 w-3 mr-1" /> {company.email_id}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="text-center">
              <Button variant="link" size="sm" onClick={() => navigate("/app/company-profile")}>
                Edit Company Profile
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40">
            <p className="text-gray-500 mb-4">No company profile found</p>
            <Button onClick={() => navigate("/app/company-profile")}>
              Create Company Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyInfo;
