
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users,
  Plus,
  Search,
  Edit,
  Trash2
} from "lucide-react";

// Mock customer data
const mockCustomers = [
  { 
    id: "c1", 
    name: "ABC Technologies", 
    email: "contact@abctech.com", 
    phone: "9876543210", 
    gstin: "27AAAAA0000A1Z5", 
    city: "Mumbai",
    state: "Maharashtra" 
  },
  { 
    id: "c2", 
    name: "XYZ Corp", 
    email: "info@xyzcorp.com", 
    phone: "9876543211", 
    gstin: "07BBBBB0000B1Z5", 
    city: "New Delhi",
    state: "Delhi" 
  },
  { 
    id: "c3", 
    name: "Global Solutions", 
    email: "contact@globalsolutions.com", 
    phone: "9876543212", 
    gstin: "29CCCCC0000C1Z5", 
    city: "Bangalore",
    state: "Karnataka" 
  },
  { 
    id: "c4", 
    name: "Local Systems", 
    email: "info@localsystems.com", 
    phone: "9876543213", 
    gstin: "33DDDDD0000D1Z5", 
    city: "Chennai",
    state: "Tamil Nadu" 
  },
  { 
    id: "c5", 
    name: "Tech Giants", 
    email: "contact@techgiants.com", 
    phone: "9876543214", 
    gstin: "24EEEEE0000E1Z5", 
    city: "Ahmedabad",
    state: "Gujarat" 
  },
];

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter customers based on search
  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.gstin.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Link to="/app/customers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Customer
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Manage Customers
          </CardTitle>
          <CardDescription>
            View and manage your customer database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-6">
            <div className="relative flex-grow">
              <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32">
                      No customers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.gstin}</TableCell>
                      <TableCell>{customer.city}, {customer.state}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Link to={`/app/customers/edit/${customer.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
