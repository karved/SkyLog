import { Injectable } from '@angular/core';
import { Auth, signInWithEmailLink, sendSignInLinkToEmail, signOut, onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, deleteDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

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
    private router: Router
  ) {
    onAuthStateChanged(this.auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
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
      console.error('Error sending magic link:', error);
      throw error;
    }
  }

  async signInWithMagicLink(url: string): Promise<void> {
    try {
      console.log('Starting magic link sign-in with URL:', url);
      const email = localStorage.getItem('emailForSignIn');
      const firstName = localStorage.getItem('firstNameForSignIn');
      const lastName = localStorage.getItem('lastNameForSignIn');
      
      console.log('Email from localStorage:', email);
      console.log('First name from localStorage:', firstName);
      console.log('Last name from localStorage:', lastName);
      
      if (!email) {
        throw new Error('Email not found in localStorage');
      }

      const result = await signInWithEmailLink(this.auth, email, url);
      console.log('Magic link sign-in result:', result);
      console.log('User UID:', result.user?.uid);
      console.log('User email:', result.user?.email);
      
      if (result.user) {
        console.log('Creating/updating user document...');
        // Create or update user document
        await this.createUserDocument(
          result.user, 
          firstName || 'User', 
          lastName || '', 
          email || result.user.email || ''
        );
        console.log('User document created/updated successfully');
      } else {
        console.log('No user found, skipping user document creation');
      }

      // Clean up localStorage
      localStorage.removeItem('emailForSignIn');
      localStorage.removeItem('firstNameForSignIn');
      localStorage.removeItem('lastNameForSignIn');
      
      console.log('Navigating to dashboard...');
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error signing in with magic link:', error);
      throw error;
    }
  }

  private async createUserDocument(user: User, firstName: string, lastName: string, email: string): Promise<void> {
    try {
      console.log('Creating/updating user document for:', user.uid, firstName, lastName, email);
      const userRef = doc(this.firestore, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      console.log('User document exists?', userSnap.exists());

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
        console.log('Creating new user document with data:', userData);
        await setDoc(userRef, userData);
        console.log('User document created successfully');
      } else {
        // Update existing user's lastLogin and other fields if needed
        console.log('User document already exists, updating lastLogin');
        const existingData = userSnap.data() as UserData;
        const updateData: Partial<UserData> = {
          lastLogin: new Date()
        };
        
        // If name or email changed, update them too
        if (existingData.firstName !== firstName || existingData.lastName !== lastName || existingData.email !== email) {
          updateData.firstName = firstName;
          updateData.lastName = lastName;
          updateData.email = email;
          console.log('Updating name/email as well');
        }
        
        // Ensure createdAt is preserved if it exists, or set it if missing
        if (existingData.createdAt) {
          updateData.createdAt = existingData.createdAt;
        } else {
          updateData.createdAt = new Date();
          console.log('Setting createdAt for existing user without it');
        }
        
        console.log('Updating user document with data:', updateData);
        await setDoc(userRef, updateData, { merge: true });
        console.log('User document updated successfully');
      }
    } catch (error) {
      console.error('Error creating/updating user document:', error);
      throw error;
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      
      console.log('Google sign-in result:', result);
      console.log('User UID:', result.user?.uid);
      console.log('User display name:', result.user?.displayName);
      console.log('User email:', result.user?.email);
      
      if (result.user) {
        // Extract first and last name from display name
        const displayName = result.user.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        console.log('Creating/updating user document for Google user...');
        await this.createUserDocument(
          result.user,
          firstName,
          lastName,
          result.user.email || ''
        );
        console.log('Google user document created/updated successfully');
        
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
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
      console.log('Last login updated for user:', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw error as this is not critical
    }
  }

}
