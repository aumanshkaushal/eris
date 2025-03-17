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
            if ((tag === 'ALL' || resource.tag === tag) && resource.status === 'active') {
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
        return totalRatings / resource.rating.length;
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
        resource.rating.push({ reviewer, rating, comment });
        await db.collection('resource').doc(resourceID).set(resource);
        return true;
    }

    async deleteResource(resourceID: string, staffActionBy: string): Promise<boolean> {
        const resource = this.resources[resourceID];
        if (!resource) return false;
        resource.status = 'deleted';
        resource.staffActionBy = staffActionBy;
        resource.staffActionAt = admin.firestore.FieldValue.serverTimestamp();
        try {
            await db.collection('resource').doc(resourceID).set(resource);
            console.log(`Resource ${resourceID} marked as deleted by ${staffActionBy}`);
            return true;
        } catch (error) {
            console.error(`Error deleting resource ${resourceID}:`, error);
            return false;
        }
    }

    async editTitle(resourceID: string, newTitle: string, staffActionBy: string): Promise<boolean> {
        const resource = this.resources[resourceID];
        if (!resource) return false;
        resource.title = newTitle;
        resource.staffActionBy = staffActionBy;
        resource.staffActionAt = admin.firestore.FieldValue.serverTimestamp();
        try {
            await db.collection('resource').doc(resourceID).set(resource);
            console.log(`Resource ${resourceID} title updated to "${newTitle}" by ${staffActionBy}`);
            return true;
        } catch (error) {
            console.error(`Error updating title for resource ${resourceID}:`, error);
            return false;
        }
    }

    async editTag(resourceID: string, newTag: string, staffActionBy: string): Promise<boolean> {
        const resource = this.resources[resourceID];
        if (!resource) return false;
        resource.tag = newTag;
        resource.staffActionBy = staffActionBy;
        resource.staffActionAt = admin.firestore.FieldValue.serverTimestamp();
        try {
            await db.collection('resource').doc(resourceID).set(resource);
            console.log(`Resource ${resourceID} tag updated to "${newTag}" by ${staffActionBy}`);
            return true;
        } catch (error) {
            console.error(`Error updating tag for resource ${resourceID}:`, error);
            return false;
        }
    }

    async editDescription(resourceID: string, newDescription: string, staffActionBy: string): Promise<boolean> {
        const resource = this.resources[resourceID];
        if (!resource) return false;
        resource.description = newDescription;
        resource.staffActionBy = staffActionBy;
        resource.staffActionAt = admin.firestore.FieldValue.serverTimestamp();
        try {
            await db.collection('resource').doc(resourceID).set(resource);
            console.log(`Resource ${resourceID} description updated by ${staffActionBy}`);
            return true;
        } catch (error) {
            console.error(`Error updating description for resource ${resourceID}:`, error);
            return false;
        }
    }

    async editUrl(resourceID: string, newUrl: string, staffActionBy: string): Promise<boolean> {
        const resource = this.resources[resourceID];
        if (!resource) return false;
        resource.url = newUrl;
        resource.staffActionBy = staffActionBy;
        resource.staffActionAt = admin.firestore.FieldValue.serverTimestamp();
        try {
            await db.collection('resource').doc(resourceID).set(resource);
            console.log(`Resource ${resourceID} URL updated to "${newUrl}" by ${staffActionBy}`);
            return true;
        } catch (error) {
            console.error(`Error updating URL for resource ${resourceID}:`, error);
            return false;
        }
    }

    async editAuthor(resourceID: string, newAuthor: string, staffActionBy: string): Promise<boolean> {
        const resource = this.resources[resourceID];
        if (!resource) return false;
        resource.author = newAuthor;
        resource.staffActionBy = staffActionBy;
        resource.staffActionAt = admin.firestore.FieldValue.serverTimestamp();
        try {
            await db.collection('resource').doc(resourceID).set(resource);
            console.log(`Resource ${resourceID} author updated to "${newAuthor}" by ${staffActionBy}`);
            return true;
        } catch (error) {
            console.error(`Error updating author for resource ${resourceID}:`, error);
            return false;
        }
    }
}

export const cache = new ResourceCache();