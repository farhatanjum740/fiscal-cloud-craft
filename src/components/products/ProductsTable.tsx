
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import type { Product } from '@/types';

interface ProductsTableProps {
  products: Product[] | undefined;
  filteredProducts: Product[];
  isLoading: boolean;
  error: any;
  isDeleting: boolean;
  onDeleteProduct: (id: string) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  filteredProducts,
  isLoading,
  error,
  isDeleting,
  onDeleteProduct
}) => {
  return (
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-32">
                Loading products...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-32 text-red-500">
                Failed to load products. Please refresh the page.
              </TableCell>
            </TableRow>
          ) : filteredProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-32">
                {products?.length === 0 ? "No products found. Create your first product!" : "No products match your search."}
              </TableCell>
            </TableRow>
          ) : (
            filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.hsn_code}</TableCell>
                <TableCell>{product.price.toLocaleString()}</TableCell>
                <TableCell>{product.gst_rate}%</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Link to={`/app/products/edit/${product.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    onClick={() => onDeleteProduct(product.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsTable;
