
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CreditNoteLoading: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded" />
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-3 w-32 mb-1" />
              <Skeleton className="h-3 w-36 mb-1" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </div>
        
        <Skeleton className="h-px w-full my-6" />
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <Skeleton className="h-5 w-24 mb-3" />
            <Skeleton className="h-4 w-36 mb-2" />
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div>
            <Skeleton className="h-5 w-24 mb-3" />
            <Skeleton className="h-4 w-36 mb-2" />
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        
        <Skeleton className="h-28 w-full mb-6" />
        
        <Skeleton className="h-64 w-full mb-6" />
        
        <div className="flex justify-end mb-6">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between py-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between py-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between py-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
        
        <Skeleton className="h-16 w-full mb-6" />
        
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
};

export default CreditNoteLoading;
