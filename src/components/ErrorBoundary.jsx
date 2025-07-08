import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);

    // Log additional debugging info
    console.error('Current URL:', window.location.href);
    console.error('User Agent:', navigator.userAgent);
    console.error('Timestamp:', new Date().toISOString());

    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              
              <div className="space-y-2 mb-4">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                >
                  Refresh Page
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
                >
                  Go to Homepage
                </button>
              </div>

              {/* Error details for debugging */}
              {import.meta.env.DEV && this.state.error && (
                <div className="text-left bg-red-50 border border-red-200 p-3 rounded text-sm mt-4">
                  <h3 className="font-medium text-red-800 mb-2">Error Details (Development Mode)</h3>
                  <div className="space-y-2 text-red-700">
                    <div>
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto max-h-32 whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo && this.state.errorInfo.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto max-h-32 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Always show a "Try Again" button in development */}
              {import.meta.env.DEV && (
                <button
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded mt-2"
                >
                  Try Again (Dev Mode)
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
