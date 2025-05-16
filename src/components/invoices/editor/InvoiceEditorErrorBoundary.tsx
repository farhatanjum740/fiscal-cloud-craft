
import React, { ErrorInfo } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class InvoiceEditorErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("InvoiceEditor Error Boundary caught an error:", error);
    console.error("Component Stack:", errorInfo.componentStack);
    
    // Log specific error details to help with debugging
    if (error.message.includes("undefined is not iterable")) {
      console.error("Iteration Error Details:");
      console.error("This is likely caused by trying to iterate over undefined data");
      console.error("Check if data arrays are properly initialized and loaded before rendering");
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h2>
          <p className="mb-4 text-red-600">{this.state.error?.message || "An unknown error occurred"}</p>
          <pre className="bg-gray-800 text-white p-4 rounded text-sm overflow-auto max-h-60">
            {this.state.error?.stack}
          </pre>
          <div className="mt-4 space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Reload the page
            </Button>
            <Button
              variant="default"
              className="w-full"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try to recover
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default InvoiceEditorErrorBoundary;
