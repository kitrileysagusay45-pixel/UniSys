import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif',
          background: '#f8fafc', color: '#1e293b', padding: '2rem', textAlign: 'center'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Something went wrong</h2>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>The application encountered an error. Please refresh the page.</p>
          <pre style={{
            background: '#fee2e2', padding: '1rem', borderRadius: '8px',
            fontSize: '0.8rem', maxWidth: '600px', overflowX: 'auto',
            color: '#991b1b', textAlign: 'left'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem', padding: '10px 24px', background: '#3b82f6',
              color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
