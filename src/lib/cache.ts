import { db } from './firebase';
import * as admin from 'firebase-admin';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, onSnapshot, collection } from 'firebase/firestore';
import { filter } from 'fuzzaldrin';
import { apiKey, authDomain, projectId, messagingSenderId, appId } from '../secret/firebase.json';

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

    async getAverageRating(resourceID: string): Promise<number | string> {
        const resource = this.resources[resourceID];
        if (!resource || !resource.rating || resource.rating.length === 0) return "Unrated";

        const totalRatings = resource.rating.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0);
        const averageRating = totalRatings / resource.rating.length;
        return averageRating;
    }

    async hasRated(resourceID: string, userID: string): Promise<boolean> {
        const resource = this.resources[resourceID];
        if (!resource || !resource.rating) return false;

        return resource.rating.some((review: { reviewer: string }) => review.reviewer === userID);
    }

    async rateResource(resourceID: string, reviewer: string, rating: number, comment: string): Promise<boolean> {
        const resource = this.resources[resourceID];
        if (!resource) return false;

        if (rating < 1) rating = 1;
        if (rating > 5) rating = 5;

        if (!resource.rating) resource.rating = [];

        resource.rating.push({
            reviewer,
            rating,
            comment
        });

        await db.collection('resource').doc(resourceID).set(resource);
        return true;
    }
}

export const cache = new ResourceCache();