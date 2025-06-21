
import React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileTableProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface MobileTableCellProps {
  children: React.ReactNode;
  className?: string;
  label?: string; // For mobile card labels
  hideOnMobile?: boolean;
}

interface MobileTableHeadProps {
  children: React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

const MobileTable = React.forwardRef<HTMLTableElement, MobileTableProps>(
  ({ className, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    if (isMobile) {
      return (
        <div className={cn("space-y-3", className)} {...props}>
          {children}
        </div>
      );
    }
    
    return (
      <div className="relative w-full overflow-auto">
        <table
          ref={ref}
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);
MobileTable.displayName = "MobileTable";

const MobileTableHeader = React.forwardRef<HTMLTableSectionElement, MobileTableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    if (isMobile) {
      return null; // Hide headers on mobile
    }
    
    return (
      <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props}>
        {children}
      </thead>
    );
  }
);
MobileTableHeader.displayName = "MobileTableHeader";

const MobileTableBody = React.forwardRef<HTMLTableSectionElement, MobileTableBodyProps>(
  ({ className, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    if (isMobile) {
      return <div className={cn("space-y-3", className)}>{children}</div>;
    }
    
    return (
      <tbody
        ref={ref}
        className={cn("[&_tr:last-child]:border-0", className)}
        {...props}
      >
        {children}
      </tbody>
    );
  }
);
MobileTableBody.displayName = "MobileTableBody";

const MobileTableRow = React.forwardRef<HTMLTableRowElement, MobileTableRowProps>(
  ({ className, children, onClick, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    if (isMobile) {
      return (
        <div
          className={cn(
            "bg-white rounded-lg border p-4 space-y-2 shadow-sm",
            onClick && "cursor-pointer hover:shadow-md transition-shadow",
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
          "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
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
MobileTableRow.displayName = "MobileTableRow";

const MobileTableHead = React.forwardRef<HTMLTableCellElement, MobileTableHeadProps>(
  ({ className, hideOnMobile, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    if (isMobile || hideOnMobile) {
      return null;
    }
    
    return (
      <th
        ref={ref}
        className={cn(
          "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
          className
        )}
        {...props}
      >
        {children}
      </th>
    );
  }
);
MobileTableHead.displayName = "MobileTableHead";

const MobileTableCell = React.forwardRef<HTMLTableCellElement, MobileTableCellProps>(
  ({ className, children, label, hideOnMobile, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    if (hideOnMobile && isMobile) {
      return null;
    }
    
    if (isMobile) {
      return (
        <div className={cn("flex justify-between items-center", className)}>
          {label && <span className="text-sm font-medium text-gray-600">{label}:</span>}
          <div className="text-sm">{children}</div>
        </div>
      );
    }
    
    return (
      <td
        ref={ref}
        className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
        {...props}
      >
        {children}
      </td>
    );
  }
);
MobileTableCell.displayName = "MobileTableCell";

export {
  MobileTable,
  MobileTableHeader,
  MobileTableBody,
  MobileTableRow,
  MobileTableHead,
  MobileTableCell,
};
