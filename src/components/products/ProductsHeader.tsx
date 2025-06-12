
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import type { Product, SubscriptionLimits } from '@/types';

interface ProductsHeaderProps {
  limits: SubscriptionLimits | null;
  products: Product[] | undefined;
  isAddButtonDisabled: boolean;
}

const ProductsHeader: React.FC<ProductsHeaderProps> = ({
  limits,
  products,
  isAddButtonDisabled
}) => {
  const getUsageText = () => {
    if (!limits || !products) return '';
    if (limits.products === -1) return 'Unlimited';
    
    const actualCount = products.length || 0;
    return `${actualCount} / ${limits.products}`;
  };

  const getUsageColor = () => {
    if (!limits || limits.products === -1) return 'text-green-600';
    
    const actualCount = products?.length || 0;
    const percentage = actualCount / limits.products * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Products & Services</h1>
        {limits && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">Usage:</span>
            <Badge variant="outline" className={getUsageColor()}>
              {getUsageText()}
            </Badge>
          </div>
        )}
      </div>
      {isAddButtonDisabled ? (
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      ) : (
        <Link to="/app/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </Link>
      )}
    </div>
  );
};

export default ProductsHeader;
