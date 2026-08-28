import { Component } from 'react';
import logo from '../assets/logo.webp';
import './ErrorBoundary.css';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Error silently caught — no console output in production
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/home';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="eb-page">
          <div className="eb-card">
            <img src={logo} alt="KevW Kopitam" className="eb-logo" />

            <div className="eb-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
                <circle cx="12" cy="12" r="11" stroke="var(--primary)" strokeWidth="1.5" strokeOpacity="0.3" />
                <path d="M12 7v5" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1" fill="var(--primary)" />
              </svg>
            </div>

            <h1 className="eb-title">Something went wrong</h1>
            <p className="eb-body">
              An unexpected error occurred. This has been noted and we're working on it.
              Please refresh the page or return to the home screen.
            </p>

            <div className="eb-actions">
              <button className="btn-primary" onClick={this.handleRefresh}>
                Refresh Page
              </button>
              <button className="btn-secondary" onClick={this.handleHome}>
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
