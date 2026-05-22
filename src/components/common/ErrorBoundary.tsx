import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-lg font-semibold text-red-700">예상치 못한 오류가 발생했습니다.</p>
              <p className="mt-1 text-sm text-red-600">{this.state.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-sm font-medium text-red-600 underline"
              >
                페이지 새로고침
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
