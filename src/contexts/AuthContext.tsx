'use client';

import React, { createContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  type User as FirebaseAuthUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase/client';
import type { UserProfile, UserRole } from '../types/user';

export interface RegisterInputData {
  email: string;
  password?: string;
  fullName: string;
  cedula: string;
  faculty: string;
  career: string;
  semester: number;
  phone?: string;
  role?: UserRole;
}

export interface AuthContextType {
  authUser: FirebaseAuthUser | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole; email?: string | null }>;
  register: (data: RegisterInputData) => Promise<{ success: boolean; error?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<FirebaseAuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserProfile = async (uid: string, userEmail?: string | null): Promise<UserProfile | null> => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      const isAdminEmail = userEmail === 'admin@utb.edu.ec' || userEmail?.toLowerCase() === 'admin@utb.edu.ec';

      if (docSnap.exists()) {
        const data = docSnap.data();
        let currentRole = (data.role as UserRole) || 'student';
        
        // Auto-corrección en Firestore para la cuenta oficial del administrador
        if (isAdminEmail && currentRole !== 'admin') {
          currentRole = 'admin';
          await setDoc(docRef, { role: 'admin', email: userEmail }, { merge: true }).catch(() => {});
        }

        return {
          uid,
          email: data.email || userEmail || '',
          fullName: data.fullName || (isAdminEmail ? 'Secretariat UTB — Admin' : 'Estudiante UTB'),
          cedula: data.cedula || '0000000000',
          faculty: data.faculty || 'Universidad Técnica de Babahoyo',
          career: data.career || 'Control del Fondo',
          semester: data.semester ? Number(data.semester) : 10,
          phone: data.phone || '0999999999',
          role: currentRole,
        };
      } else if (isAdminEmail) {
        // Si el admin fue creado en Auth de Firebase pero nunca tuvo documento en Firestore
        const adminProfile: UserProfile = {
          uid,
          email: 'admin@utb.edu.ec',
          fullName: 'Secretariat UTB — Admin',
          cedula: '0000000000',
          faculty: 'Administración Central',
          career: 'Control y Gestión del Fondo',
          semester: 10,
          phone: '0999999999',
          role: 'admin',
        };
        await setDoc(docRef, adminProfile, { merge: true }).catch(() => {});
        return adminProfile;
      }
    } catch (error) {
      console.error('Error obteniendo perfil de Firestore:', error);
    }
    return null;
  };

  const refreshProfile = async () => {
    if (authUser) {
      const userProfile = await fetchUserProfile(authUser.uid, authUser.email);
      setProfile(userProfile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        const userProfile = await fetchUserProfile(user.uid, user.email);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await fetchUserProfile(userCred.user.uid, userCred.user.email || email);
      setProfile(userProfile);
      return { success: true, role: userProfile?.role || 'student', email: userCred.user.email };
    } catch (error: any) {
      console.error('Error en login:', error);
      let msg = 'Credenciales no válidas o usuario no registrado.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        msg = 'Correo o contraseña incorrectos.';
      }
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };


  const register = async (data: RegisterInputData) => {
    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password || 'UTB12345678');
      const uid = cred.user.uid;
      const userDoc: UserProfile = {
        uid,
        email: data.email,
        fullName: data.fullName,
        cedula: data.cedula,
        faculty: data.faculty || 'Universidad Técnica de Babahoyo',
        career: data.career || 'Estudiante',
        semester: data.semester ? Number(data.semester) : 1,
        phone: data.phone || '',
        role: data.role || 'student',
      };
      await setDoc(doc(db, 'users', uid), userDoc);
      setProfile(userDoc);
      return { success: true };
    } catch (error: any) {
      console.error('Error en registro:', error);
      let msg = 'No se pudo crear la cuenta estudiantil.';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'Este correo institucional ya se encuentra registrado en EduCrédito UTB.';
      }
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setAuthUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const role: UserRole | null = profile?.role ?? null;

  return (
    <AuthContext.Provider value={{ authUser, profile, role, loading, logout, refreshProfile, login, register }}>
      {children}
    </AuthContext.Provider>
  );
};
