import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  
  /**
   * Get a generic error message based on HTTP status code
   */
  getGenericErrorMessage(error: any): string {
    // Handle HTTP errors
    if (error instanceof HttpErrorResponse) {
      return this.getHttpErrorMessage(error.status);
    }
    
    // Handle Firebase Auth errors
    if (error?.code) {
      return this.getFirebaseErrorMessage(error.code);
    }
    
    // Handle generic errors
    if (error?.message) {
      return this.getGenericMessage(error.message);
    }
    
    // Default fallback
    return 'An error occurred. Please try again.';
  }

  /**
   * Get generic error message for HTTP status codes
   */
  private getHttpErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
      case 403:
        return 'Unauthorized. Please sign in again.';
      case 404:
        return 'Error occurred. Please try again.';
      case 422:
        return 'Too many requests. Please wait a moment and try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Server error. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  /**
   * Get generic error message for Firebase Auth error codes
   */
  private getFirebaseErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-email':
      case 'auth/user-disabled':
        return 'Authentication failed. Please check your credentials and try again.';
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please use a different email or sign in.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many requests. Please wait a moment and try again.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please check your information and try again.';
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed. Please contact support.';
      case 'auth/requires-recent-login':
        return 'Please sign in again to complete this action.';
      default:
        return 'Authentication error. Please try again.';
    }
  }

  /**
   * Get generic error message for other types of errors
   */
  private getGenericMessage(message: string): string {
    // If the message contains technical details, return a generic message
    if (message.includes('422') || message.includes('401') || message.includes('403') || message.includes('404')) {
      return 'An error occurred. Please try again.';
    }
    
    // If the message contains HTTP status codes, return generic message
    if (/\d{3}/.test(message)) {
      return 'An error occurred. Please try again.';
    }
    
    // For other messages, return as is but sanitize if needed
    return message;
  }

  /**
   * Log error for debugging purposes without exposing details to user
   */
  logError(error: any, context: string = 'Application'): void {
    // Only log in development mode
    if (!environment.production) {
      console.error(`[${context}] Error occurred:`, error);
    }
  }
}

// Import environment for production check
import { environment } from '../../environment';
