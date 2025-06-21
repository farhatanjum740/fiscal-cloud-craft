
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  MobileTable,
  MobileTableBody,
  MobileTableCell,
  MobileTableHead,
  MobileTableHeader,
  MobileTableRow,
} from '@/components/ui/mobile-table';
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
      <MobileTable>
        <MobileTableHeader>
          <MobileTableRow>
            <MobileTableHead>Name</MobileTableHead>
            <MobileTableHead>HSN/SAC Code</MobileTableHead>
            <MobileTableHead>Price (₹)</MobileTableHead>
            <MobileTableHead>GST Rate (%)</MobileTableHead>
            <MobileTableHead hideOnMobile>Unit</MobileTableHead>
            <MobileTableHead hideOnMobile>Category</MobileTableHead>
            <MobileTableHead className="text-right">Actions</MobileTableHead>
          </MobileTableRow>
        </MobileTableHeader>
        <MobileTableBody>
          {isLoading ? (
            <MobileTableRow>
              <MobileTableCell className="text-center h-32 col-span-full">
                Loading products...
              </MobileTableCell>
            </MobileTableRow>
          ) : error ? (
            <MobileTableRow>
              <MobileTableCell className="text-center h-32 text-red-500 col-span-full">
                Failed to load products. Please refresh the page.
              </MobileTableCell>
            </MobileTableRow>
          ) : filteredProducts.length === 0 ? (
            <MobileTableRow>
              <MobileTableCell className="text-center h-32 col-span-full">
                {products?.length === 0 ? "No products found. Create your first product!" : "No products match your search."}
              </MobileTableCell>
            </MobileTableRow>
          ) : (
            filteredProducts.map((product) => (
              <MobileTableRow key={product.id}>
                <MobileTableCell label="Name" className="font-medium">
                  {product.name}
                </MobileTableCell>
                <MobileTableCell label="HSN/SAC">
                  {product.hsn_code}
                </MobileTableCell>
                <MobileTableCell label="Price">
                  ₹{product.price.toLocaleString()}
                </MobileTableCell>
                <MobileTableCell label="GST Rate">
                  {product.gst_rate}%
                </MobileTableCell>
                <MobileTableCell label="Unit" hideOnMobile>
                  {product.unit}
                </MobileTableCell>
                <MobileTableCell label="Category" hideOnMobile>
                  {product.category}
                </MobileTableCell>
                <MobileTableCell label="Actions" className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Link to={`/app/products/edit/${product.id}`}>
                      <Button variant="ghost" size="sm" className="h-touch w-touch p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-touch w-touch p-0 text-red-500 hover:text-red-600"
                      onClick={() => onDeleteProduct(product.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </MobileTableCell>
              </MobileTableRow>
            ))
          )}
        </MobileTableBody>
      </MobileTable>
    </div>
  );
};

export default ProductsTable;
