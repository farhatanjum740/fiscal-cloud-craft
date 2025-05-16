
import React from "react";

const LoadingState = () => (
  <div className="flex flex-col space-y-4 items-center justify-center h-64">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    <p className="text-muted-foreground">Loading invoice data...</p>
  </div>
);

export default LoadingState;
