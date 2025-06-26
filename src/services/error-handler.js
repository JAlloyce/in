/**
 * Global Error Handler Service
 * Centralized error handling for the LinkedIn Clone application
 */

export class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  /**
   * Main error handling method
   */
  handleError(error, context = {}) {
    const errorInfo = {
      message: error.message || 'Unknown error occurred',
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context: {
        component: context.component || 'Unknown',
        action: context.action || 'Unknown',
        userId: context.userId || null,
        ...context
      }
    };

    // Log the error
    this.logError(errorInfo);

    // Report to external service (if configured)
    this.reportError(errorInfo);

    // Return user-friendly message
    return this.getDisplayMessage(error, context);
  }

  /**
   * Log error to internal storage
   */
  logError(errorInfo) {
    this.errorLog.push(errorInfo);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Handler');
      console.error('Error:', errorInfo.message);
      console.log('Context:', errorInfo.context);
      console.log('Stack:', errorInfo.stack);
      console.groupEnd();
    }
  }

  /**
   * Get user-friendly error message
   */
  getDisplayMessage(error, context) {
    const type = context.type || this.categorizeError(error);
    
    const errorMessages = {
      authentication: 'Please sign in to continue',
      network: 'Connection error. Please check your internet and try again',
      validation: 'Please check your input and try again',
      permission: 'You don\'t have permission to perform this action',
      database: 'Service temporarily unavailable. Please try again later',
      unknown: 'Something went wrong. Please try again'
    };

    return errorMessages[type] || errorMessages.unknown;
  }

  /**
   * Categorize error type based on error properties
   */
  categorizeError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('auth') || message.includes('login') || message.includes('unauthorized')) {
      return 'authentication';
    }
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network';
    }
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return 'validation';
    }
    if (message.includes('permission') || message.includes('forbidden') || message.includes('access')) {
      return 'permission';
    }
    if (message.includes('database') || message.includes('supabase') || message.includes('sql')) {
      return 'database';
    }
    
    return 'unknown';
  }

  /**
   * Report error to external monitoring service
   */
  reportError(errorInfo) {
    // In a real app, you would send this to a service like Sentry, LogRocket, etc.
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: errorInfo.message,
        fatal: false,
        custom_map: {
          component: errorInfo.context.component,
          action: errorInfo.context.action
        }
      });
    }

    // Example: Send to a logging endpoint
    if (typeof fetch !== 'undefined') {
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorInfo)
      }).catch(() => {
        // Silently fail if logging service is down
      });
    }
  }

  /**
   * Handle async operation with error catching
   */
  async handleAsync(asyncFn, context = {}) {
    try {
      return await asyncFn();
    } catch (error) {
      const message = this.handleError(error, context);
      throw new Error(message);
    }
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit = 10) {
    return this.errorLog.slice(-limit);
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }
}

/**
 * Pre-configured error types for common scenarios
 */
export const ErrorTypes = {
  AUTHENTICATION: 'authentication',
  NETWORK: 'network',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  DATABASE: 'database',
  UNKNOWN: 'unknown'
};

/**
 * Utility functions for common error scenarios
 */
export const ErrorUtils = {
  /**
   * Handle API response errors
   */
  handleApiError(response, context = {}) {
    if (!response.ok) {
      const error = new Error(`API Error: ${response.status} ${response.statusText}`);
      return errorHandler.handleError(error, { ...context, type: ErrorTypes.NETWORK });
    }
    return null;
  },

  /**
   * Handle form validation errors
   */
  handleValidationError(errors, context = {}) {
    const errorMessages = Object.entries(errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join(', ');
    
    const error = new Error(errorMessages);
    return errorHandler.handleError(error, { ...context, type: ErrorTypes.VALIDATION });
  },

  /**
   * Handle Supabase errors
   */
  handleSupabaseError(error, context = {}) {
    if (!error) return null;

    // Map Supabase error codes to user-friendly messages
    const supabaseErrorMap = {
      'PGRST301': 'You don\'t have permission to access this resource',
      'PGRST204': 'The requested resource was not found',
      'PGRST116': 'No data found',
      '23505': 'This item already exists',
      '23503': 'Cannot delete - item is being used elsewhere',
      '42P01': 'Service temporarily unavailable'
    };

    const friendlyMessage = supabaseErrorMap[error.code] || error.message;
    const wrappedError = new Error(friendlyMessage);
    
    return errorHandler.handleError(wrappedError, { 
      ...context, 
      type: ErrorTypes.DATABASE,
      originalCode: error.code,
      originalMessage: error.message
    });
  }
};

// Create and export singleton instance
export const errorHandler = new ErrorHandler();

// Export as default
export default errorHandler; 