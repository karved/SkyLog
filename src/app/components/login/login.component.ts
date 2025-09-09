import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { isSignInWithEmailLink } from '@angular/fire/auth';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { environment } from '../../../environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <!-- Background decorative elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-full blur-3xl"></div>
      </div>
      
      <div class="card max-w-md w-full mx-4 relative z-10 backdrop-blur-sm bg-white/90 border border-white/20 shadow-2xl">
        <div class="text-center mb-6">
          <!-- Logo/Icon -->
          <div class="mb-4">
            <div class="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg float-animation pulse-glow">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </div>
          </div>
          
          <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 via-primary to-secondary bg-clip-text text-transparent mb-2 leading-tight font-montserrat">
            Welcome to SkyLog
          </h1>
          <p class="text-lg text-gray-600 font-medium font-montserrat">Track your flights with ease ✈️</p>
        </div>

        <div *ngIf="!linkSent && !isProcessingMagicLink" class="space-y-4">
          <form (ngSubmit)="sendMagicLink()" #loginForm="ngForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <div class="floating-input-container">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    [(ngModel)]="firstName"
                    (focus)="onInputFocus('firstName')"
                    (blur)="onInputBlur('firstName')"
                    required
                    class="floating-input"
                    placeholder=" "
                  >
                  <label for="firstName" class="floating-label"
                         [class]="focusedField === 'firstName' || firstName ? 'floating-label-focused' : 'floating-label-unfocused'">
                    First Name
                  </label>
                </div>
              </div>

              <div class="form-group">
                <div class="floating-input-container">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    [(ngModel)]="lastName"
                    (focus)="onInputFocus('lastName')"
                    (blur)="onInputBlur('lastName')"
                    required
                    class="floating-input"
                    placeholder=" "
                  >
                  <label for="lastName" class="floating-label"
                         [class]="focusedField === 'lastName' || lastName ? 'floating-label-focused' : 'floating-label-unfocused'">
                    Last Name
                  </label>
                </div>
              </div>
            </div>

            <div class="form-group">
              <div class="floating-input-container">
                <input
                  type="email"
                  id="email"
                  name="email"
                  [(ngModel)]="email"
                  (focus)="onInputFocus('email')"
                  (blur)="onInputBlur('email')"
                  required
                  class="floating-input"
                  placeholder=" "
                >
                <label for="email" class="floating-label"
                       [class]="focusedField === 'email' || email ? 'floating-label-focused' : 'floating-label-unfocused'">
                  Email Address
                </label>
              </div>
            </div>

            <button
              type="submit"
              [disabled]="!loginForm.form.valid || isLoading"
              class="btn-primary w-full"
            >
              <span *ngIf="isLoading" class="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
              <span *ngIf="!isLoading" class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {{ isLoading ? 'Sending...' : 'Send Magic Link' }}
              </span>
            </button>
          </form>

          <!-- Divider -->
          <div class="relative my-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t-2 border-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="px-4 bg-white text-gray-500 text-sm font-medium">Or</span>
            </div>
          </div>

          <!-- Google Sign-In Button -->
          <button
            (click)="signInWithGoogle()"
            [disabled]="isLoading"
            class="btn-outline w-full flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div *ngIf="linkSent" class="text-center space-y-4">
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-lg">
            <div class="flex items-center justify-center mb-3">
              <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-xl font-bold text-green-800 mb-2">Magic link sent! ✨</h3>
            <p class="text-green-700 text-base mb-3">
              Check your email and click the link to sign in.
            </p>
            <div class="email-info">
              <div class="space-y-2">
                <p class="text-green-600 text-sm">
                  <strong class="text-green-800">Don't see the email?</strong> Check your spam folder.
                </p>
                <div class="space-y-1">
                  <p class="text-green-800 font-semibold text-sm">From: {{ senderName }}</p>
                  <p class="text-green-600 text-sm">{{ senderEmail }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <button
            (click)="resetForm()"
            class="text-primary hover:text-blue-600 text-base font-bold hover:underline transition-colors duration-200"
          >
            Send to a different email
          </button>
        </div>

        <div *ngIf="isProcessingMagicLink" class="text-center space-y-4">
          <div class="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
          </div>
          <h3 class="text-xl font-bold text-gray-800">Signing you in...</h3>
          <p class="text-gray-600 text-base">Please wait while we authenticate you</p>
        </div>

        <div *ngIf="error" class="mt-4 bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4 shadow-lg">
          <div class="flex items-center mb-2">
            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-2">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h4 class="text-base font-bold text-red-800">Error</h4>
          </div>
          <p class="text-red-700 text-sm">{{ error }}</p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  firstName = '';
  lastName = '';
  email = '';
  linkSent = false;
  isLoading = false;
  isProcessingMagicLink = false;
  error = '';
  focusedField = '';
  
  // Email configuration
  senderName = environment.email.senderName;
  senderEmail = environment.email.senderEmail;
  supportEmail = environment.email.supportEmail;

  constructor(
    private authService: AuthService,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    // Check for session storage message
    const magicLinkError = sessionStorage.getItem('magicLinkError');
    if (magicLinkError) {
      this.error = magicLinkError;
      sessionStorage.removeItem('magicLinkError');
    }

    // Check if this is a magic link callback
    if (isSignInWithEmailLink(this.authService['auth'], window.location.href)) {
      this.isProcessingMagicLink = true;
      this.handleMagicLinkSignIn();
      return; // Don't proceed with other checks
    }

    // Check if we're in the middle of processing a magic link (page refresh case)
    const isProcessingMagicLink = sessionStorage.getItem('isProcessingMagicLink');
    if (isProcessingMagicLink === 'true') {
      this.isProcessingMagicLink = true;
      // Try to complete the magic link sign in
      this.handleMagicLinkSignIn();
      return;
    }

    // Redirect if already authenticated
    this.authService.currentUser$.subscribe(user => {
      if (user && !this.isProcessingMagicLink) {
        this.router.navigate(['/']);
      }
    });
  }

  async sendMagicLink() {
    if (!this.firstName.trim() || !this.lastName.trim() || !this.email.trim()) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      await this.authService.sendMagicLink(this.email.trim(), this.firstName.trim(), this.lastName.trim());
      this.linkSent = true;
    } catch (error: any) {
      this.errorHandler.logError(error, 'LoginComponent.sendMagicLink');
      this.error = this.errorHandler.getGenericErrorMessage(error);
    } finally {
      this.isLoading = false;
    }
  }

  async signInWithGoogle() {
    this.isLoading = true;
    this.error = '';

    try {
      await this.authService.signInWithGoogle();
    } catch (error: any) {
      this.errorHandler.logError(error, 'LoginComponent.signInWithGoogle');
      this.error = this.errorHandler.getGenericErrorMessage(error);
    } finally {
      this.isLoading = false;
    }
  }

  async handleMagicLinkSignIn() {
    try {
      // Set flag to indicate we're processing a magic link
      sessionStorage.setItem('isProcessingMagicLink', 'true');
      
      await this.authService.signInWithMagicLink(window.location.href);
      
      // Clear the processing flag
      sessionStorage.removeItem('isProcessingMagicLink');
      
      // Clear the URL to prevent re-processing
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Redirect to dashboard
      this.router.navigate(['/']);
    } catch (error: any) {
      this.errorHandler.logError(error, 'LoginComponent.handleMagicLinkSignIn');
      
      // Clear the processing flag
      sessionStorage.removeItem('isProcessingMagicLink');
      
      // Check if it's a localStorage error and handle gracefully
      if (error.name === 'LocalStorageError' || (error.message && error.message.includes('localStorage'))) {
        this.error = 'Please request a new magic link. Your previous session has expired.';
      } else {
        this.error = this.errorHandler.getGenericErrorMessage(error);
      }
      
      this.isProcessingMagicLink = false;
    }
  }

  resetForm() {
    this.linkSent = false;
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.error = '';
    this.focusedField = '';
    // Clear any session storage flags and errors
    sessionStorage.removeItem('magicLinkError');
    sessionStorage.removeItem('isProcessingMagicLink');
  }

  onInputFocus(fieldName: string) {
    this.focusedField = fieldName;
  }

  onInputBlur(fieldName: string) {
    this.focusedField = '';
  }
}
