import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { toast } from 'sonner';
import { getErrorMessage, logError } from '@/utils/errorHandling';

export type UserRole = 'patient' | 'provider' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  roles: UserRole[];
  phone?: string;
  address?: string;
  date_of_birth?: string;
  verification_status?: 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { full_name?: string; avatar_url?: string; phone?: string; address?: string; date_of_birth?: string }) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile and roles from Firestore
  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      // Fetch profile
      const profileRef = doc(db, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        // Create profile if it doesn't exist
        await setDoc(profileRef, {
          id: userId,
          email: userEmail,
          full_name: null,
          avatar_url: null,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
        
        setProfile({
          id: userId,
          email: userEmail,
          full_name: null,
          avatar_url: null,
          roles: []
        });
        return;
      }

      const profileData = profileSnap.data();

      // Fetch roles
      const rolesQuery = query(
        collection(db, 'user_roles'),
        where('user_id', '==', userId)
      );
      const rolesSnap = await getDocs(rolesQuery);
      const roles = rolesSnap.docs.map(doc => doc.data().role as UserRole);

      setProfile({
        id: profileData.id,
        email: userEmail,
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        roles,
        phone: profileData.phone,
        address: profileData.address,
        date_of_birth: profileData.date_of_birth,
        verification_status: profileData.verification_status,
      });
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch profile when user signs in
        setTimeout(() => {
          fetchUserProfile(firebaseUser.uid, firebaseUser.email || '');
        }, 0);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Connexion réussie!');
    } catch (error: any) {
      logError(error, 'login');
      const message = getErrorMessage(error, 'fr');
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await firebaseUpdateProfile(newUser, {
        displayName: fullName
      });

      // Create Firestore profile
      await setDoc(doc(db, 'profiles', newUser.uid), {
        id: newUser.uid,
        email: newUser.email,
        full_name: fullName,
        avatar_url: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      // Assign default 'patient' role
      await setDoc(doc(db, 'user_roles', `${newUser.uid}_patient`), {
        user_id: newUser.uid,
        role: 'patient',
        created_at: serverTimestamp()
      });

      toast.success('Compte créé avec succès!');
    } catch (error: any) {
      logError(error, 'signup');
      const message = getErrorMessage(error, 'fr');
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if profile exists, create if not
      const profileRef = doc(db, 'profiles', result.user.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          id: result.user.uid,
          email: result.user.email,
          full_name: result.user.displayName,
          avatar_url: result.user.photoURL,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });

        // Assign default 'patient' role
        await setDoc(doc(db, 'user_roles', `${result.user.uid}_patient`), {
          user_id: result.user.uid,
          role: 'patient',
          created_at: serverTimestamp()
        });
      }

      toast.success('Connexion réussie!');
    } catch (error: any) {
      logError(error, 'loginWithGoogle');
      const message = getErrorMessage(error, 'fr');
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      logError(error, 'logout');
      const message = getErrorMessage(error, 'fr');
      toast.error(message);
      throw error;
    }
  };

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string; phone?: string; address?: string; date_of_birth?: string }) => {
    if (!user) return;

    try {
      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, {
        ...updates,
        updated_at: serverTimestamp()
      });

      // Update Firebase Auth profile if display name changed
      if (updates.full_name) {
        await firebaseUpdateProfile(user, {
          displayName: updates.full_name
        });
      }

      // Refresh profile
      if (user.email) {
        await fetchUserProfile(user.uid, user.email);
      }
      
      toast.success('Profil mis à jour');
    } catch (error) {
      logError(error, 'updateProfile');
      const message = getErrorMessage(error, 'fr');
      toast.error(message);
      throw error;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return profile?.roles.includes(role) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session: user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
