"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-background p-4">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg max-w-md w-full text-center space-y-6">
            <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
              <p className="text-muted-foreground mt-2">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
