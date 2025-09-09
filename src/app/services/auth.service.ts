import { Injectable } from '@angular/core';
import { Auth, signInWithEmailLink, sendSignInLinkToEmail, signOut, onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, deleteDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ErrorHandlerService } from './error-handler.service';

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  lastLogin?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
      
      // Update lastLogin when user signs in
      if (user) {
        this.updateLastLogin(user.uid);
      }
    });
  }

  async sendMagicLink(email: string, firstName: string, lastName: string): Promise<void> {
    const actionCodeSettings = {
      url: `${window.location.origin}/login`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(this.auth, email, actionCodeSettings);
      
      // Store user data temporarily in localStorage
      localStorage.setItem('emailForSignIn', email);
      localStorage.setItem('firstNameForSignIn', firstName);
      localStorage.setItem('lastNameForSignIn', lastName);
    } catch (error) {
      this.errorHandler.logError(error, 'AuthService.sendMagicLink');
      throw new Error(this.errorHandler.getGenericErrorMessage(error));
    }
  }

  async signInWithMagicLink(url: string): Promise<void> {
    try {
      const email = localStorage.getItem('emailForSignIn');
      const firstName = localStorage.getItem('firstNameForSignIn');
      const lastName = localStorage.getItem('lastNameForSignIn');
      
      // If email is not in localStorage, throw a specific error that can be handled gracefully
      if (!email) {
        const error = new Error('localStorage email not found');
        error.name = 'LocalStorageError';
        throw error;
      }

      const result = await signInWithEmailLink(this.auth, email, url);
      
      if (result.user) {
        // Create or update user document
        await this.createUserDocument(
          result.user, 
          firstName || 'User', 
          lastName || '', 
          email || result.user.email || ''
        );
      }

      // Clean up localStorage
      localStorage.removeItem('emailForSignIn');
      localStorage.removeItem('firstNameForSignIn');
      localStorage.removeItem('lastNameForSignIn');
      
      this.router.navigate(['/']);
    } catch (error) {
      this.errorHandler.logError(error, 'AuthService.signInWithMagicLink');
      throw error; // Re-throw the original error to preserve error type
    }
  }

  private async createUserDocument(user: User, firstName: string, lastName: string, email: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new user document
        const userData: UserData = {
          id: user.uid,
          firstName,
          lastName,
          email,
          createdAt: new Date(),
          lastLogin: new Date()
        };
        await setDoc(userRef, userData);
      } else {
        // Update existing user's lastLogin and other fields if needed
        const existingData = userSnap.data() as UserData;
        const updateData: Partial<UserData> = {
          lastLogin: new Date()
        };
        
        // If name or email changed, update them too
        if (existingData.firstName !== firstName || existingData.lastName !== lastName || existingData.email !== email) {
          updateData.firstName = firstName;
          updateData.lastName = lastName;
          updateData.email = email;
        }
        
        // Ensure createdAt is preserved if it exists, or set it if missing
        if (existingData.createdAt) {
          updateData.createdAt = existingData.createdAt;
        } else {
          updateData.createdAt = new Date();
        }
        
        await setDoc(userRef, updateData, { merge: true });
      }
    } catch (error) {
      this.errorHandler.logError(error, 'AuthService.createUserDocument');
      throw new Error(this.errorHandler.getGenericErrorMessage(error));
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      
      if (result.user) {
        // Extract first and last name from display name
        const displayName = result.user.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        await this.createUserDocument(
          result.user,
          firstName,
          lastName,
          result.user.email || ''
        );
        
        this.router.navigate(['/']);
      }
    } catch (error) {
      this.errorHandler.logError(error, 'AuthService.signInWithGoogle');
      throw new Error(this.errorHandler.getGenericErrorMessage(error));
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      this.errorHandler.logError(error, 'AuthService.signOut');
      throw new Error(this.errorHandler.getGenericErrorMessage(error));
    }
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private async updateLastLogin(userId: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
    } catch (error) {
      this.errorHandler.logError(error, 'AuthService.updateLastLogin');
      // Don't throw error as this is not critical
    }
  }

}
