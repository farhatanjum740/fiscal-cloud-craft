
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
  Package,
  Plus,
  Search,
  Edit,
  Trash2
} from "lucide-react";

// Mock product data
const mockProducts = [
  { 
    id: "p1", 
    name: "Web Development", 
    price: 5000, 
    hsnCode: "998313", 
    gstRate: 18, 
    unit: "hour", 
    category: "Services" 
  },
  { 
    id: "p2", 
    name: "Mobile App Development", 
    price: 7500, 
    hsnCode: "998314", 
    gstRate: 18, 
    unit: "hour", 
    category: "Services" 
  },
  { 
    id: "p3", 
    name: "Hosting Services", 
    price: 1200, 
    hsnCode: "998315", 
    gstRate: 18, 
    unit: "month", 
    category: "Services" 
  },
  { 
    id: "p4", 
    name: "Domain Registration", 
    price: 800, 
    hsnCode: "998316", 
    gstRate: 18, 
    unit: "year", 
    category: "Services" 
  },
  { 
    id: "p5", 
    name: "SEO Services", 
    price: 3500, 
    hsnCode: "998317", 
    gstRate: 18, 
    unit: "month", 
    category: "Services" 
  },
];

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter products based on search
  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.hsnCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products & Services</h1>
        <Link to="/app/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Manage Products
          </CardTitle>
          <CardDescription>
            View and manage your products and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-6">
            <div className="relative flex-grow">
              <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
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
                  <TableHead>HSN/SAC Code</TableHead>
                  <TableHead>Price (₹)</TableHead>
                  <TableHead>GST Rate (%)</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.hsnCode}</TableCell>
                      <TableCell>{product.price.toLocaleString()}</TableCell>
                      <TableCell>{product.gstRate}%</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Link to={`/app/products/edit/${product.id}`}>
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

export default Products;
