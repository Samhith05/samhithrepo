// src/components/ErrorBoundary.jsx

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-red-200">
            <div className="bg-red-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h2 className="text-lg font-bold">Something went wrong</h2>
                  <p className="text-red-100 text-sm">Application Error</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mb-4 p-3 bg-gray-50 rounded border">
                  <summary className="cursor-pointer text-sm font-medium text-gray-600">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 overflow-auto">
                    {this.state.error && this.state.error.toString()}
                    <br />
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded transition-colors"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
