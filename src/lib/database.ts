import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import * as resourceMethods from './resourceMethods';
import * as userMethods from './userMethods';

export class DatabaseManager {
    private db: Database;

    constructor(env: 'dev' | 'prod' = 'dev') {
        const dbFile = env === 'dev' ? 'dev.db' : 'prod.db';
        this.db = new sqlite3.Database(dbFile, (err) => {
            if (err) console.error('DB Error:', err);
            this.initializeDb();
        });
    }

    private async initializeDb() {
        await new Promise<void>((resolve) => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS resources (
                    id TEXT PRIMARY KEY,
                    title TEXT,
                    author TEXT,
                    status TEXT,
                    rating TEXT,
                    tag TEXT,
                    description TEXT,
                    url TEXT,
                    staff_action_by TEXT,
                    staff_action_at INTEGER,
                    created_at INTEGER,
                    usage TEXT
                )
            `, (err) => {
                if (err) console.error('Error initializing resources table:', err);
                resolve();
            });
        });

        await new Promise<void>((resolve) => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    supportpoints INTEGER DEFAULT 0,
                    last_active INTEGER,
                    bookmark TEXT
                )
            `, (err) => {
                if (err) console.error('Error initializing users table:', err);
                resolve();
            });
        });
    }

    getResource = (id: string) => resourceMethods.getResource(this.db, id);
    serveResources = (tag: string = 'ALL', search: string = '') => resourceMethods.serveResources(this.db, tag, search);
    getAverageRating = (resourceID: string) => resourceMethods.getAverageRating(this.db, resourceID);
    hasRated = (resourceID: string, userID: string) => resourceMethods.hasRated(this.db, resourceID, userID);
    rateResource = (resourceID: string, reviewer: string, rating: number, comment: string) => 
        resourceMethods.rateResource(this.db, resourceID, reviewer, rating, comment);
    deleteResource = (resourceID: string, staffActionBy: string) => 
        resourceMethods.deleteResource(this.db, resourceID, staffActionBy);
    editTitle = (resourceID: string, newTitle: string, staffActionBy: string) => 
        resourceMethods.editTitle(this.db, resourceID, newTitle, staffActionBy);
    editTag = (resourceID: string, newTag: string, staffActionBy: string) => 
        resourceMethods.editTag(this.db, resourceID, newTag, staffActionBy);
    editDescription = (resourceID: string, newDescription: string, staffActionBy: string) => 
        resourceMethods.editDescription(this.db, resourceID, newDescription, staffActionBy);
    editUrl = (resourceID: string, newUrl: string, staffActionBy: string) => 
        resourceMethods.editUrl(this.db, resourceID, newUrl, staffActionBy);
    editAuthor = (resourceID: string, newAuthor: string, staffActionBy: string) => 
        resourceMethods.editAuthor(this.db, resourceID, newAuthor, staffActionBy);
    getActiveResourceCountByUser = (userID: string) => resourceMethods.getActiveResourceCountByUser(this.db, userID);
    getTotalResourceCountByUser = (userID: string) => resourceMethods.getTotalResourceCountByUser(this.db, userID);
    getAverageRatingByUser = (userID: string) => resourceMethods.getAverageRatingByUser(this.db, userID);
    getReviewCountByUser = (userID: string) => resourceMethods.getReviewCountByUser(this.db, userID);
    addTemporaryResource = (title: string, tag: string, url: string, description: string, author: string) => 
        resourceMethods.addTemporaryResource(this.db, title, tag, url, description, author);
    approveTemporaryResource = (resourceID: string, staffActionBy: string) => 
        resourceMethods.approveTemporaryResource(this.db, resourceID, staffActionBy);
    declineTemporaryResource = (resourceID: string, staffActionBy: string) => 
        resourceMethods.declineTemporaryResource(this.db, resourceID, staffActionBy);
    generateResourceID = () => resourceMethods.generateResourceID(this.db);
    initializeUser = (userId: string) => userMethods.initializeUser(this.db, userId);
    getTopUsers = () => userMethods.getTopUsers(this.db);
    getSupportPoints = (userId: string) => userMethods.getSupportPoints(this.db, userId);
    addSupportPoints = (userId: string, supportPoints: number) => userMethods.addSupportPoints(this.db, userId, supportPoints);
    getLeaderboardPosition = (userId: string) => userMethods.getLeaderboardPosition(this.db, userId);
    getTotalUsers = () => userMethods.getTotalUsers(this.db);
}

export const databaseManager = new DatabaseManager(process.env.NODE_ENV === 'production' ? 'prod' : 'dev');