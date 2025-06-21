
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

interface PermissionGuardProps {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  companyId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resource,
  action,
  companyId,
  children,
  fallback,
  showFallback = true
}) => {
  const { checkPermission } = usePermissions(companyId);
  
  const hasPermission = checkPermission(resource, action);

  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showFallback) {
    return (
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to {action} {resource}. Contact your administrator for access.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default PermissionGuard;
