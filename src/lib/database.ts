import { createClient, Client } from '@libsql/client';
import * as resourceMethods from './resourceMethods';
import * as userMethods from './userMethods';

export class DatabaseManager {
    private db: Client;

    constructor() {
        const isProd = process.env.NODE_ENV === 'production';
        const localPath = isProd ? 'file:prod.db' : 'file:dev.db';
        const syncUrl = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;

        this.db = createClient({
            url: localPath,
            ...(syncUrl && authToken ? {
                syncUrl,
                authToken,
                syncInterval: 3 * 1000
            } : {})
        });
        this.initializeSchema();
    }

    async sync() {
        if (this.db.sync) {
            await this.db.sync();
        } else {
            console.error("Sync not supported: missing syncUrl or authToken");
        }
    }
    async initializeSchema() {
        try {
            await this.db.execute(`
                CREATE TABLE IF NOT EXISTS resources (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    tag TEXT NOT NULL,
                    url TEXT NOT NULL,
                    description TEXT,
                    author TEXT NOT NULL,
                    created_at INTEGER NOT NULL,
                    staff_action_at INTEGER,
                    staff_action_by TEXT,
                    status TEXT NOT NULL
                )
            `);
            await this.db.execute(`
                CREATE TABLE IF NOT EXISTS reviews (
                    resource_id TEXT NOT NULL,
                    reviewer TEXT NOT NULL,
                    rating INTEGER NOT NULL,
                    comment TEXT,
                    created_at INTEGER,  -- New column
                    FOREIGN KEY (resource_id) REFERENCES resources(id)
                )
            `);
            await this.db.execute(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    supportpoints INTEGER NOT NULL,
                    last_active INTEGER,
                    bookmark TEXT NOT NULL
                )
            `);
        } catch (err) {
            console.error("Failed to initialize schema:", err);
        }
    }

    getResource(id: string) {
        return resourceMethods.getResource(this.db, id);
    }

    serveResources(tag: string = 'ALL', search: string = '') {
        return resourceMethods.serveResources(this.db, tag, search);
    }

    getAverageRating(resourceID: string) {
        return resourceMethods.getAverageRating(this.db, resourceID);
    }

    hasRated(resourceID: string, userID: string) {
        return resourceMethods.hasRated(this.db, resourceID, userID);
    }

    rateResource(resourceID: string, reviewer: string, rating: number, comment: string) {
        return resourceMethods.rateResource(this.db, resourceID, reviewer, rating, comment);
    }

    deleteResource(resourceID: string, staffActionBy: string) {
        return resourceMethods.deleteResource(this.db, resourceID, staffActionBy);
    }

    editTitle(resourceID: string, newTitle: string, staffActionBy: string) {
        return resourceMethods.editTitle(this.db, resourceID, newTitle, staffActionBy);
    }

    editTag(resourceID: string, newTag: string, staffActionBy: string) {
        return resourceMethods.editTag(this.db, resourceID, newTag, staffActionBy);
    }

    editDescription(resourceID: string, newDescription: string, staffActionBy: string) {
        return resourceMethods.editDescription(this.db, resourceID, newDescription, staffActionBy);
    }

    editUrl(resourceID: string, newUrl: string, staffActionBy: string) {
        return resourceMethods.editUrl(this.db, resourceID, newUrl, staffActionBy);
    }

    editAuthor(resourceID: string, newAuthor: string, staffActionBy: string) {
        return resourceMethods.editAuthor(this.db, resourceID, newAuthor, staffActionBy);
    }

    getActiveResourceCountByUser(userID: string) {
        return resourceMethods.getActiveResourceCountByUser(this.db, userID);
    }

    getTotalResourceCountByUser(userID: string) {
        return resourceMethods.getTotalResourceCountByUser(this.db, userID);
    }

    getAverageRatingByUser(userID: string) {
        return resourceMethods.getAverageRatingByUser(this.db, userID);
    }

    getReviewCountByUser(userID: string) {
        return resourceMethods.getReviewCountByUser(this.db, userID);
    }

    addTemporaryResource(title: string, tag: string, url: string, description: string, author: string) {
        return resourceMethods.addTemporaryResource(this.db, title, tag, url, description, author);
    }

    approveTemporaryResource(resourceID: string, staffActionBy: string) {
        return resourceMethods.approveTemporaryResource(this.db, resourceID, staffActionBy);
    }

    declineTemporaryResource(resourceID: string, staffActionBy: string) {
        return resourceMethods.declineTemporaryResource(this.db, resourceID, staffActionBy);
    }

    generateResourceID() {
        return resourceMethods.generateResourceID(this.db);
    }

    checkDuplicate(field: string, value: string) {
        return resourceMethods.checkDuplicate(this.db, field, value);
    }

    initializeUser(userId: string) {
        return userMethods.initializeUser(this.db, userId);
    }

    getTopUsers() {
        return userMethods.getTopUsers(this.db);
    }

    getSupportPoints(userId: string) {
        return userMethods.getSupportPoints(this.db, userId);
    }

    addSupportPoints(userId: string, supportPoints: number) {
        return userMethods.addSupportPoints(this.db, userId, supportPoints);
    }

    getLeaderboardPosition(userId: string) {
        return userMethods.getLeaderboardPosition(this.db, userId);
    }

    getTotalUsers() {
        return userMethods.getTotalUsers(this.db);
    }
}

export const databaseManager = new DatabaseManager();