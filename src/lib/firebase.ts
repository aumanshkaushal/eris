import * as admin from 'firebase-admin';
import serviceAccount from '../secret/serviceAccountKey.json';
import { ServiceAccount } from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
  });
}

const db: admin.firestore.Firestore = admin.firestore();

export { admin, db };