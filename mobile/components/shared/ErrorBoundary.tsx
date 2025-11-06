import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState(prevState => ({
      error,
      errorInfo,
      retryCount: prevState.retryCount + 1,
    }));
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log error details
    console.error('ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
    });
    
    // Report to crash analytics service (placeholder)
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
        this.resetErrorBoundary();
      }
    }
    
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you would send this to a crash reporting service
    // like Sentry, Crashlytics, or Bugsnag
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
      userAgent: navigator.userAgent,
    };
    
    // For now, just log it
    console.warn('Error report:', errorReport);
  };

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleRetry = () => {
    const { retryCount } = this.state;
    
    // Limit retry attempts
    if (retryCount >= 3) {
      Alert.alert(
        'Multiple Errors',
        'This error has occurred multiple times. Please restart the app or contact support.',
        [
          { text: 'OK', style: 'default' },
          { text: 'Force Retry', onPress: () => this.resetErrorBoundary(), style: 'destructive' },
        ]
      );
      return;
    }
    
    this.resetErrorBoundary();
    
    // Auto-retry after a delay for certain error types
    if (this.isRetryableError(this.state.error)) {
      this.resetTimeoutId = setTimeout(() => {
        this.resetErrorBoundary();
      }, 2000);
    }
  };

  isRetryableError = (error: Error | null): boolean => {
    if (!error) return false;
    
    const retryableErrors = [
      'Network request failed',
      'Request timeout',
      'Connection error',
      'ChunkLoadError',
    ];
    
    return retryableErrors.some(retryableError => 
      error.message.includes(retryableError)
    );
  };

  showErrorDetails = () => {
    const { error, errorInfo } = this.state;
    
    Alert.alert(
      'Error Details',
      `Error: ${error?.message}\n\nStack: ${error?.stack?.substring(0, 200)}...`,
      [{ text: 'OK' }]
    );
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { fallback, showDetails } = this.props;
    
    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning-outline" size={64} color="#D32F2F" />
          </View>
          
          <Text style={styles.title}>Oops! Something went wrong</Text>
          
          <Text style={styles.message}>
            We encountered an unexpected error. Don't worry, this happens sometimes.
          </Text>
          
          {retryCount > 0 && (
            <Text style={styles.retryInfo}>
              Retry attempt: {retryCount}/3
            </Text>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.retryButton]} 
              onPress={this.handleRetry}
              disabled={retryCount >= 3}
            >
              <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}
              </Text>
            </TouchableOpacity>
            
            {showDetails && (
              <TouchableOpacity 
                style={[styles.button, styles.detailsButton]} 
                onPress={this.showErrorDetails}
              >
                <Ionicons name="information-circle-outline" size={20} color="#333333" />
                <Text style={[styles.buttonText, styles.detailsButtonText]}>
                  Show Details
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.helpText}>
            If this problem persists, please contact support or restart the app.
          </Text>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    minHeight: '100%',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  retryInfo: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Inter',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#000000',
  },
  detailsButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Inter',
  },
  detailsButtonText: {
    color: '#333333',
  },
  helpText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter',
  },
});