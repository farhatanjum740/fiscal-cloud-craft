
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionValidation } from '@/hooks/useSubscriptionValidation';
import type { Product } from '@/types';

interface ProductsHeaderProps {
  limits: any;
  products: Product[] | undefined;
  isAddButtonDisabled: boolean;
}

const ProductsHeader: React.FC<ProductsHeaderProps> = ({
  limits,
  products,
  isAddButtonDisabled
}) => {
  const { checkCanPerformAction, getRemainingCount, subscription } = useSubscriptionValidation();
  const [canAdd, setCanAdd] = React.useState(false);

  React.useEffect(() => {
    const checkPermission = async () => {
      const result = await checkCanPerformAction('product');
      setCanAdd(result);
    };
    checkPermission();
  }, [checkCanPerformAction]);

  const remainingProducts = getRemainingCount('product');
  const isUnlimited = limits?.products === -1;
  const planName = subscription?.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : 'Current';

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Products</h1>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your products and services
        </p>
      </div>
      
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        {/* Usage Information */}
        <div className="flex flex-col space-y-1 sm:items-end">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {products?.length || 0} products
            </span>
            {!isUnlimited && (
              <Badge variant="outline" className="text-xs">
                {remainingProducts} remaining
              </Badge>
            )}
            {isUnlimited && (
              <Badge variant="secondary" className="text-xs">
                Unlimited
              </Badge>
            )}
          </div>
          
          {!canAdd && !isUnlimited && (
            <p className="text-xs text-red-600">
              Limit reached for {planName} plan
            </p>
          )}
        </div>

        {/* Add Button */}
        <Link to="/app/products/new">
          <Button 
            disabled={!canAdd}
            className="w-full sm:w-auto"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProductsHeader;
