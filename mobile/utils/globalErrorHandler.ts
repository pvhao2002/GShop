import { Alert } from 'react-native';
import { ApiError } from '../services/apiService';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp: string;
  additionalData?: any;
}

export interface ErrorReport {
  error: Error | ApiError;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  handled: boolean;
}

class GlobalErrorHandler {
  private errorReports: ErrorReport[] = [];
  private maxReports = 100;
  private errorListeners: Array<(report: ErrorReport) => void> = [];

  constructor() {
    this.setupGlobalHandlers();
  }

  private setupGlobalHandlers() {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(
          new Error(`Unhandled Promise Rejection: ${event.reason}`),
          {
            component: 'Global',
            action: 'unhandledrejection',
            timestamp: new Date().toISOString(),
            additionalData: { reason: event.reason },
          },
          'high'
        );
      });
    }

    // Handle global JavaScript errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Call original console.error
      originalConsoleError.apply(console, args);
      
      // Handle as error if it looks like an error
      if (args.length > 0 && (args[0] instanceof Error || typeof args[0] === 'string')) {
        const error = args[0] instanceof Error ? args[0] : new Error(String(args[0]));
        this.handleError(
          error,
          {
            component: 'Console',
            action: 'console.error',
            timestamp: new Date().toISOString(),
            additionalData: { args },
          },
          'medium'
        );
      }
    };
  }

  public handleError(
    error: Error | ApiError,
    context: Partial<ErrorContext> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    showAlert: boolean = true
  ): void {
    const fullContext: ErrorContext = {
      timestamp: new Date().toISOString(),
      ...context,
    };

    const report: ErrorReport = {
      error,
      context: fullContext,
      severity,
      handled: true,
    };

    // Store error report
    this.storeErrorReport(report);

    // Log error
    this.logError(report);

    // Notify listeners
    this.notifyListeners(report);

    // Show user-friendly alert if requested
    if (showAlert) {
      this.showErrorAlert(error, severity);
    }

    // Report to crash analytics (placeholder)
    this.reportToCrashAnalytics(report);
  }

  private storeErrorReport(report: ErrorReport): void {
    this.errorReports.unshift(report);
    
    // Keep only the most recent reports
    if (this.errorReports.length > this.maxReports) {
      this.errorReports = this.errorReports.slice(0, this.maxReports);
    }
  }

  private logError(report: ErrorReport): void {
    const { error, context, severity } = report;
    
    console.group(`🚨 Error [${severity.toUpperCase()}]`);
    console.error('Message:', error.message);
    console.error('Context:', context);
    
    // Check if error is an Error instance (has stack property)
    if (error instanceof Error && error.stack) {
      console.error('Stack:', error.stack);
    }
    
    if ('status' in error && error.status) {
      console.error('HTTP Status:', error.status);
    }
    
    if ('isNetworkError' in error) {
      console.error('Network Error:', error.isNetworkError);
      console.error('Retryable:', error.isRetryable);
    }
    
    console.groupEnd();
  }

  private notifyListeners(report: ErrorReport): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(report);
      } catch (error) {
        console.error('Error in error listener:', error);
      }
    });
  }

  private showErrorAlert(error: Error | ApiError, severity: string): void {
    // Don't show alerts for low severity errors
    if (severity === 'low') {
      return;
    }

    let title = 'Error';
    let message = 'An unexpected error occurred.';

    // Customize message based on error type
    if ('isNetworkError' in error && error.isNetworkError) {
      title = 'Connection Error';
      message = 'Please check your internet connection and try again.';
    } else if ('status' in error) {
      switch (error.status) {
        case 400:
          title = 'Invalid Request';
          message = 'The request was invalid. Please check your input.';
          break;
        case 401:
          title = 'Authentication Required';
          message = 'Please log in to continue.';
          break;
        case 403:
          title = 'Access Denied';
          message = 'You don\'t have permission to perform this action.';
          break;
        case 404:
          title = 'Not Found';
          message = 'The requested resource was not found.';
          break;
        case 429:
          title = 'Too Many Requests';
          message = 'Please wait a moment before trying again.';
          break;
        case 500:
          title = 'Server Error';
          message = 'A server error occurred. Please try again later.';
          break;
        default:
          message = error.message || message;
      }
    } else {
      message = error.message || message;
    }

    // Show alert based on severity
    if (severity === 'critical') {
      Alert.alert(
        title,
        message,
        [
          { text: 'Report Issue', onPress: () => this.showErrorReport() },
          { text: 'OK', style: 'default' },
        ]
      );
    } else {
      Alert.alert(title, message, [{ text: 'OK' }]);
    }
  }

  private reportToCrashAnalytics(report: ErrorReport): void {
    // In a real app, you would send this to a crash reporting service
    // like Sentry, Crashlytics, or Bugsnag
    
    const analyticsData = {
      message: report.error.message,
      stack: report.error instanceof Error ? report.error.stack : undefined,
      context: report.context,
      severity: report.severity,
      timestamp: report.context.timestamp,
      isNetworkError: 'isNetworkError' in report.error ? report.error.isNetworkError : false,
      httpStatus: 'status' in report.error ? report.error.status : undefined,
    };

    // For now, just log it
    console.log('📊 Analytics Report:', analyticsData);
  }

  private showErrorReport(): void {
    const recentErrors = this.errorReports.slice(0, 5);
    const errorSummary = recentErrors.map((report, index) => 
      `${index + 1}. ${report.error.message} (${report.severity})`
    ).join('\n');

    Alert.alert(
      'Recent Errors',
      errorSummary || 'No recent errors',
      [{ text: 'OK' }]
    );
  }

  // Public methods
  public addErrorListener(listener: (report: ErrorReport) => void): () => void {
    this.errorListeners.push(listener);
    
    return () => {
      const index = this.errorListeners.indexOf(listener);
      if (index > -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }

  public getErrorReports(): ErrorReport[] {
    return [...this.errorReports];
  }

  public clearErrorReports(): void {
    this.errorReports = [];
  }

  public getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byComponent: Record<string, number>;
    networkErrors: number;
  } {
    const stats = {
      total: this.errorReports.length,
      bySeverity: {} as Record<string, number>,
      byComponent: {} as Record<string, number>,
      networkErrors: 0,
    };

    this.errorReports.forEach(report => {
      // Count by severity
      stats.bySeverity[report.severity] = (stats.bySeverity[report.severity] || 0) + 1;
      
      // Count by component
      const component = report.context.component || 'Unknown';
      stats.byComponent[component] = (stats.byComponent[component] || 0) + 1;
      
      // Count network errors
      if ('isNetworkError' in report.error && report.error.isNetworkError) {
        stats.networkErrors++;
      }
    });

    return stats;
  }
}

// Export singleton instance
export const globalErrorHandler = new GlobalErrorHandler();

// Convenience functions
export function handleError(
  error: Error | ApiError,
  context?: Partial<ErrorContext>,
  severity?: 'low' | 'medium' | 'high' | 'critical',
  showAlert?: boolean
): void {
  globalErrorHandler.handleError(error, context, severity, showAlert);
}

export function addErrorListener(listener: (report: ErrorReport) => void): () => void {
  return globalErrorHandler.addErrorListener(listener);
}

export function getErrorStats() {
  return globalErrorHandler.getErrorStats();
}