import { Component, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="max-w-md p-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-warning/10 p-3">
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Something went wrong</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We're sorry for the inconvenience. Please try refreshing the page.
                </p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
