import { apiKey, authDomain, projectId, messagingSenderId, appId } from '../secret/firebase.json'
import { db } from './firebase';
import * as admin from 'firebase-admin';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, onSnapshot, collection } from 'firebase/firestore';
import { filter } from 'fuzzaldrin';

const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    messagingSenderId,
    appId,
};

let clientApp: FirebaseApp;
if (!getApps().length) {
    clientApp = initializeApp(firebaseConfig);
} else {
    clientApp = getApps()[0];
}
const clientDb = getFirestore(clientApp);

export class ResourceCache {
    private resources: { [key: string]: any } = {};

    constructor() {
        this.initializeCache();
    }

    public async initializeCache() {
        try {
            const snapshot = await db.collection('resource').get();
            this.cacheAllResources(snapshot);
            this.setupRealtimeListener();
        } catch (error) {
            console.error('Error initializing cache:', error);
        }
    }

    private cacheAllResources(snapshot: admin.firestore.QuerySnapshot) {
        snapshot.forEach(doc => {
            this.resources[doc.id] = doc.data();
        });
        console.log(`Cached ${Object.keys(this.resources).length} resources locally`);
    }

    private setupRealtimeListener() {
        onSnapshot(collection(clientDb, 'resource'), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const docId = change.doc.id;
                const data = change.doc.data();
                switch (change.type) {
                    case 'added':
                    case 'modified':
                        this.resources[docId] = data;
                        console.log(`Updated cache for resource ${docId}`);
                        break;
                    case 'removed':
                        delete this.resources[docId];
                        console.log(`Removed resource ${docId} from cache`);
                        break;
                }
            });
        }, (error) => console.error('Firestore listener error:', error));
    }

    async getResource(id: string): Promise<any> {
        return this.resources[id] || null;
    }

    async serveResources(tag: string = 'ALL', search: string = ''): Promise<{ name: string, value: string }[]> {
        let resources: { name: string, value: string }[] = [];

        for (const [id, resource] of Object.entries(this.resources)) {
            if (tag === 'ALL' || resource.tag === tag) {
                resources.push({ name: resource.title, value: id });
            }
        }

        if (search) {
            resources = filter(resources, search, { key: 'name' });
        }

        console.log(`serveResources: tag=${tag}, search=${search}, results=${resources.length}`);
        return resources.slice(0, 25);
    }
}

export const cache = new ResourceCache();