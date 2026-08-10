import React from 'react';

interface State {
  hasError: boolean;
  message: string;
}

/** 全局错误边界：任何渲染期异常都不再把整页干掉，而是显示可重试的降级页 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>页面出错了</h2>
          <p>{this.state.message || '发生了一个未知错误'}</p>
          <button onClick={() => this.setState({ hasError: false })}>重试</button>
        </div>
      );
    }
    return this.props.children;
  }
}
