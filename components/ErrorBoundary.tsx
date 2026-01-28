import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md text-center shadow-2xl border-4 border-red-200">
            {/* Error Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-rose-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white mb-6 mx-auto animate-pulse">
              <i className="fas fa-exclamation-triangle text-5xl text-white"></i>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-black text-slate-800 mb-3 bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              Oops! Something Went Wrong
            </h2>

            {/* Error Message */}
            <div className="mb-6 space-y-2">
              <p className="text-slate-600 font-bold text-lg">
                The app encountered an unexpected error.
              </p>
              <p className="text-slate-500 text-sm font-medium">
                Don't worry, your progress is safe! Try reloading the app.
              </p>
              
              {/* Show error details in development */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 text-left bg-slate-100 rounded-lg p-3 text-xs">
                  <summary className="cursor-pointer font-bold text-slate-700 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-red-600 overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-black text-lg shadow-lg shadow-blue-200 hover:shadow-xl transition-all"
              >
                <i className="fas fa-redo mr-2"></i>
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="w-full bg-gradient-to-r from-slate-500 to-gray-600 text-white py-3 px-6 rounded-xl font-black text-lg shadow-lg shadow-slate-200 hover:shadow-xl transition-all"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Reload App
              </button>
            </div>

            {/* Help Text */}
            <p className="text-slate-400 text-xs mt-6">
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
