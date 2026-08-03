import { initializeApp, getApps, cert, getApp, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Resolver correctamente los saltos de línea (\n) encadenados en la variable de entorno
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: privateKey,
};

// Singleton para el servidor Backend / Rutas API y verificación de Custom Claims de Administrador
function getFirebaseAdmin() {
  if (getApps().length === 0) {
    if (!serviceAccount.projectId || !serviceAccount.privateKey) {
      console.warn('Firebase Admin SDK: Variables de entorno de servidor no encontradas.');
      return null;
    }
    return initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return getApp();
}

const adminApp = getFirebaseAdmin();
const adminAuth = adminApp ? getAuth(adminApp) : null;
const adminDb = adminApp ? getFirestore(adminApp) : null;

export { adminApp, adminAuth, adminDb };
