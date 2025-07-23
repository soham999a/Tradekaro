'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface UserData {
  uid: string;
  name: string;
  email: string;
  balance: number;
  createdAt: Date;
  lastLogin: Date;
  onboardingCompleted?: boolean;
  completedAt?: Date;
  experience?: string;
  riskTolerance?: string;
  investmentGoals?: string;
  monthlyIncome?: string;
  preferredSectors?: string[];
  subscriptionTier?: 'free' | 'premium' | 'pro';
  subscriptionExpiry?: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserBalance: (newBalance: number) => Promise<void>;
  updateUserData: (updates: Partial<UserData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // Check if Firebase is configured
    if (!auth) {
      // Demo mode - create a demo user
      const demoUser = {
        uid: 'demo-user-123',
        email: 'demo@tradekaro.com',
        displayName: 'Demo Trader'
      } as User;

      // Check if there's stored demo user data
      const storedData = localStorage.getItem('user_data_demo-user-123');
      let demoUserData;

      if (storedData) {
        try {
          demoUserData = JSON.parse(storedData);
          // Ensure dates are properly converted
          demoUserData.createdAt = new Date(demoUserData.createdAt);
          demoUserData.lastLogin = new Date();
        } catch (error) {
          console.error('Error parsing stored demo data:', error);
          demoUserData = null;
        }
      }

      if (!demoUserData) {
        demoUserData = {
          uid: 'demo-user-123',
          name: 'Demo Trader',
          email: 'demo@tradekaro.com',
          balance: 1000000,
          createdAt: new Date(),
          lastLogin: new Date(),
          onboardingCompleted: false
        };
      }

      setUser(demoUser);
      setUserData(demoUserData);
      setDemoMode(true);
      setLoading(false);

      console.log('🎯 TradeKaro running in DEMO MODE - All features available without Firebase setup!');
      console.log('📝 To enable real user accounts, see FIREBASE_SETUP.md');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await loadUserData(user.uid);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          uid,
          name: data.name,
          email: data.email,
          balance: data.balance,
          createdAt: data.createdAt.toDate(),
          lastLogin: data.lastLogin.toDate(),
          onboardingCompleted: data.onboardingCompleted || false,
          experience: data.experience,
          riskTolerance: data.riskTolerance,
          investmentGoals: data.investmentGoals,
          monthlyIncome: data.monthlyIncome,
          preferredSectors: data.preferredSectors
        });

        // Update last login
        await updateDoc(doc(db, 'users', uid), {
          lastLogin: new Date()
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    }
  };

  const createUserDocument = async (user: User, name: string) => {
    const userRef = doc(db, 'users', user.uid);
    const userData = {
      name,
      email: user.email,
      balance: 1000000, // ₹10 Lakh starting balance
      createdAt: new Date(),
      lastLogin: new Date()
    };

    await setDoc(userRef, userData);
    setUserData({
      uid: user.uid,
      ...userData,
      email: userData.email || user.email || ''
    });
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Check if Firebase is properly configured
      if (!auth.app.options.apiKey || auth.app.options.apiKey.includes('XxXxXx') || auth.app.options.apiKey === 'AIzaSyBvXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX') {
        console.log('Firebase not configured, using demo mode');

        // Demo mode - simulate user creation
        const demoUser = {
          uid: `demo-${Date.now()}`,
          email,
          displayName: name,
          emailVerified: true
        };

        // Store demo user data
        const demoUserData = {
          uid: demoUser.uid,
          name,
          email,
          balance: 500000, // Starting balance of 5 lakhs
          createdAt: new Date(),
          lastLogin: new Date(),
          onboardingCompleted: false
        };

        // Simulate Firebase user
        setUser(demoUser as any);
        setUserData(demoUserData);

        toast.success('Demo account created successfully! Welcome to TradeKaro!');
        return;
      }

      // Real Firebase mode
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      await createUserDocument(result.user, name);
      toast.success('Account created successfully! Welcome to TradeKaro!');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Check if Firebase is properly configured
      if (!auth.app.options.apiKey || auth.app.options.apiKey.includes('XxXxXx') || auth.app.options.apiKey === 'AIzaSyBvXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX') {
        console.log('Firebase not configured, using demo mode');

        // Demo mode - simulate user login
        if (email === 'demo@tradekaro.com' && password === 'demo123') {
          const demoUser = {
            uid: 'demo-user-123',
            email: 'demo@tradekaro.com',
            displayName: 'Demo User',
            emailVerified: true
          };

          const demoUserData = {
            uid: 'demo-user-123',
            name: 'Demo User',
            email: 'demo@tradekaro.com',
            balance: 500000,
            createdAt: new Date(),
            lastLogin: new Date(),
            onboardingCompleted: true // Skip onboarding for demo
          };

          setUser(demoUser as any);
          setUserData(demoUserData);

          toast.success('Welcome to TradeKaro Demo!');
          return;
        } else {
          // For any other email in demo mode, create a new demo account
          const demoUser = {
            uid: `demo-${Date.now()}`,
            email,
            displayName: email.split('@')[0],
            emailVerified: true
          };

          const demoUserData = {
            uid: demoUser.uid,
            name: email.split('@')[0],
            email,
            balance: 500000,
            createdAt: new Date(),
            lastLogin: new Date(),
            onboardingCompleted: false
          };

          setUser(demoUser as any);
          setUserData(demoUserData);

          toast.success('Demo account created! Welcome to TradeKaro!');
          return;
        }
      }

      // Real Firebase mode
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back to TradeKaro!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        await createUserDocument(result.user, result.user.displayName || 'User');
      }
      
      toast.success('Welcome to TradeKaro!');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const updateUserBalance = async (newBalance: number) => {
    if (!user) return;

    try {
      if (demoMode || !db) {
        // Demo mode - update local state
        if (userData) {
          setUserData({ ...userData, balance: newBalance });
        }
        return;
      }

      await updateDoc(doc(db, 'users', user.uid), {
        balance: newBalance
      });

      if (userData) {
        setUserData({ ...userData, balance: newBalance });
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Failed to update balance');
    }
  };

  const updateUserData = (updates: Partial<UserData>) => {
    if (userData) {
      const updatedData = { ...userData, ...updates };
      setUserData(updatedData);

      // In demo mode, also store in localStorage for persistence
      if (demoMode || !db) {
        localStorage.setItem(`user_data_${userData.uid}`, JSON.stringify(updatedData));
      }
    }
  };

  // Alias methods for easier use
  const register = signUp;
  const login = signIn;

  const value: AuthContextType = {
    user,
    userData,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    register,
    login,
    logout,
    updateUserBalance,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
