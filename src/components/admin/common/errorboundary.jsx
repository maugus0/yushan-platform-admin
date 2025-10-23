import React from 'react';
import { Result, Button, Typography, Card, Space, Collapse } from 'antd';
import {
  ExclamationCircleOutlined,
  ReloadOutlined,
  HomeOutlined,
  BugOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and potentially to error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log the error to an error reporting service here
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleGoHome = () => {
    if (this.props.onGoHome) {
      this.props.onGoHome();
    } else {
      window.location.href = '/admin/dashboard';
    }
  };

  toggleDetails = () => {
    this.setState({ showDetails: !this.state.showDetails });
  };

  render() {
    if (this.state.hasError) {
      const {
        title = 'Something went wrong',
        subTitle = 'An unexpected error occurred. Please try again.',
        showHomeButton = true,
        showRetryButton = true,
        showErrorDetails = true,
        style = {},
        className = '',
      } = this.props;

      return (
        <div
          style={{
            padding: '50px 20px',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...style,
          }}
          className={className}
        >
          <Card style={{ maxWidth: '600px', width: '100%' }}>
            <Result
              status="error"
              icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              title={title}
              subTitle={subTitle}
              extra={
                <Space direction="vertical" align="center">
                  <Space>
                    {showRetryButton && (
                      <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={this.handleRetry}
                      >
                        Try Again
                      </Button>
                    )}
                    {showHomeButton && (
                      <Button
                        icon={<HomeOutlined />}
                        onClick={this.handleGoHome}
                      >
                        Go Home
                      </Button>
                    )}
                  </Space>

                  {showErrorDetails && this.state.error && (
                    <Button
                      type="link"
                      icon={<BugOutlined />}
                      onClick={this.toggleDetails}
                      style={{ padding: 0 }}
                    >
                      {this.state.showDetails ? 'Hide' : 'Show'} Error Details
                    </Button>
                  )}
                </Space>
              }
            />

            {this.state.showDetails && this.state.error && (
              <Collapse ghost>
                <Panel header="Error Details" key="error">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Error Message:</Text>
                      <Paragraph
                        code
                        copyable
                        style={{
                          background: '#f5f5f5',
                          padding: '8px',
                          marginTop: '4px',
                          fontSize: '12px',
                        }}
                      >
                        {this.state.error.toString()}
                      </Paragraph>
                    </div>

                    {this.state.errorInfo && (
                      <div>
                        <Text strong>Stack Trace:</Text>
                        <Paragraph
                          code
                          copyable
                          style={{
                            background: '#f5f5f5',
                            padding: '8px',
                            marginTop: '4px',
                            fontSize: '11px',
                            maxHeight: '200px',
                            overflow: 'auto',
                          }}
                        >
                          {this.state.errorInfo.componentStack}
                        </Paragraph>
                      </div>
                    )}
                  </Space>
                </Panel>
              </Collapse>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for functional components
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

export default ErrorBoundary;
