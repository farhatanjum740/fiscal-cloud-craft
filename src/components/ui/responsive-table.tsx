
import React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface ResponsiveTableCellProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
  hideOnMobile?: boolean;
  mobileFullWidth?: boolean;
}

interface ResponsiveTableHeadProps {
  children: React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

const ResponsiveTable = React.forwardRef<HTMLTableElement, ResponsiveTableProps>(
  ({ className, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    if (isMobile) {
      return (
        <div className={cn("space-y-3 w-full", className)} {...props}>
          {children}
        </div>
      );
    }
    
    return (
      <div className="relative w-full overflow-auto">
        <table
          ref={ref}
          className={cn("w-full caption-bottom text-sm border-collapse", className)}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);
ResponsiveTable.displayName = "ResponsiveTable";

const ResponsiveTableHeader = React.forwardRef<HTMLTableSectionElement, ResponsiveTableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    if (isMobile) {
      return null;
    }
    
    return (
      <thead ref={ref} className={cn("border-b", className)} {...props}>
        {children}
      </thead>
    );
  }
);
ResponsiveTableHeader.displayName = "ResponsiveTableHeader";

const ResponsiveTableBody = React.forwardRef<HTMLTableSectionElement, ResponsiveTableBodyProps>(
  ({ className, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    if (isMobile) {
      return <div className={cn("space-y-3 w-full", className)}>{children}</div>;
    }
    
    return (
      <tbody ref={ref} className={className} {...props}>
        {children}
      </tbody>
    );
  }
);
ResponsiveTableBody.displayName = "ResponsiveTableBody";

const ResponsiveTableRow = React.forwardRef<HTMLTableRowElement, ResponsiveTableRowProps>(
  ({ className, children, onClick, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    if (isMobile) {
      return (
        <div
          className={cn(
            "bg-white rounded-lg border p-4 shadow-sm w-full",
            "space-y-3",
            onClick && "cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]",
            className
          )}
          onClick={onClick}
          {...props}
        >
          {children}
        </div>
      );
    }
    
    return (
      <tr
        ref={ref}
        className={cn(
          "border-b transition-colors hover:bg-muted/50",
          onClick && "cursor-pointer",
          className
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </tr>
    );
  }
);
ResponsiveTableRow.displayName = "ResponsiveTableRow";

const ResponsiveTableHead = React.forwardRef<HTMLTableCellElement, ResponsiveTableHeadProps>(
  ({ className, hideOnMobile, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    if (isMobile || hideOnMobile) {
      return null;
    }
    
    return (
      <th
        ref={ref}
        className={cn(
          "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
          "whitespace-nowrap",
          className
        )}
        {...props}
      >
        {children}
      </th>
    );
  }
);
ResponsiveTableHead.displayName = "ResponsiveTableHead";

const ResponsiveTableCell = React.forwardRef<HTMLTableCellElement, ResponsiveTableCellProps>(
  ({ className, children, label, hideOnMobile, mobileFullWidth, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    if (hideOnMobile && isMobile) {
      return null;
    }
    
    if (isMobile) {
      return (
        <div className={cn(
          "flex items-center min-h-[2rem]",
          mobileFullWidth ? "flex-col items-start space-y-1" : "justify-between",
          className
        )}>
          {label && (
            <span className="text-sm font-medium text-muted-foreground flex-shrink-0">
              {label}:
            </span>
          )}
          <div className={cn(
            "text-sm font-medium",
            mobileFullWidth ? "w-full" : "text-right flex-shrink-0"
          )}>
            {children}
          </div>
        </div>
      );
    }
    
    return (
      <td
        ref={ref}
        className={cn("p-4 align-middle", className)}
        {...props}
      >
        {children}
      </td>
    );
  }
);
ResponsiveTableCell.displayName = "ResponsiveTableCell";

export {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableHead,
  ResponsiveTableCell,
};
