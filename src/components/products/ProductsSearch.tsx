
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProductsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const ProductsSearch: React.FC<ProductsSearchProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="flex mb-6">
      <div className="relative flex-grow">
        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ProductsSearch;
