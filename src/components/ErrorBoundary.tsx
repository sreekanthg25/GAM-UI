import React from 'react';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<State> {
  state: State = {
    hasError: false,
  };
  static getDerivedStateFromError(): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return <p>Found error while loading</p>;
    }
    return this.props.children;
  }
}
