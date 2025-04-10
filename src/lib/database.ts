import { createClient, Client } from '@libsql/client';
import * as resourceMethods from './resourceMethods';
import * as userMethods from './userMethods';
import * as doubtMethods from './doubtMethods';

export class DatabaseManager {
  private db: Client;

  constructor() {
    const isProd = process.env.NODE_ENV === 'production';
    const dbPath = isProd ? 'file:prod.db' : 'file:dev.db';

    this.db = createClient({
      url: dbPath,
    });
    this.initializeSchema();
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
          created_at INTEGER,
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
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS doubts (
          id TEXT PRIMARY KEY,
          author TEXT NOT NULL,
          description TEXT NOT NULL,
          image TEXT,
          created_at INTEGER NOT NULL,
          message_id TEXT NOT NULL,
          channel_id TEXT NOT NULL,
          subject TEXT NOT NULL,
          grade TEXT NOT NULL,
          status TEXT NOT NULL,
          solved_by TEXT,
          solved_at INTEGER,
          solved_message_id TEXT,
          solved_channel_id TEXT
        )
      `);
      await this.db.execute(`CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status)`);
      await this.db.execute(`CREATE INDEX IF NOT EXISTS idx_reviews_resource_id ON reviews(resource_id)`);
      await this.db.execute(`CREATE INDEX IF NOT EXISTS idx_users_supportpoints ON users(supportpoints)`);
      await this.db.execute(`CREATE INDEX IF NOT EXISTS idx_doubts_status ON doubts(status)`);
    } catch (err) {
      console.error('Failed to initialize schema:', err);
    }
  }

  getResource(id: string) { return resourceMethods.getResource(this.db, id); }
  serveResources(tag: string = 'ALL', search: string = '') { return resourceMethods.serveResources(this.db, tag, search); }
  getAverageRating(resourceID: string) { return resourceMethods.getAverageRating(this.db, resourceID); }
  hasRated(resourceID: string, userID: string) { return resourceMethods.hasRated(this.db, resourceID, userID); }
  rateResource(resourceID: string, reviewer: string, rating: number, comment: string) { return resourceMethods.rateResource(this.db, resourceID, reviewer, rating, comment); }
  deleteResource(resourceID: string, staffActionBy: string) { return resourceMethods.deleteResource(this.db, resourceID, staffActionBy); }
  editTitle(resourceID: string, newTitle: string, staffActionBy: string) { return resourceMethods.editTitle(this.db, resourceID, newTitle, staffActionBy); }
  editTag(resourceID: string, newTag: string, staffActionBy: string) { return resourceMethods.editTag(this.db, resourceID, newTag, staffActionBy); }
  editDescription(resourceID: string, newDescription: string, staffActionBy: string) { return resourceMethods.editDescription(this.db, resourceID, newDescription, staffActionBy); }
  editUrl(resourceID: string, newUrl: string, staffActionBy: string) { return resourceMethods.editUrl(this.db, resourceID, newUrl, staffActionBy); }
  editAuthor(resourceID: string, newAuthor: string, staffActionBy: string) { return resourceMethods.editAuthor(this.db, resourceID, newAuthor, staffActionBy); }
  getActiveResourceCountByUser(userID: string) { return resourceMethods.getActiveResourceCountByUser(this.db, userID); }
  getTotalResourceCountByUser(userID: string) { return resourceMethods.getTotalResourceCountByUser(this.db, userID); }
  getAverageRatingByUser(userID: string) { return resourceMethods.getAverageRatingByUser(this.db, userID); }
  getReviewCountByUser(userID: string) { return resourceMethods.getReviewCountByUser(this.db, userID); }
  addTemporaryResource(title: string, tag: string, url: string, description: string, author: string) { return resourceMethods.addTemporaryResource(this.db, title, tag, url, description, author); }
  approveTemporaryResource(resourceID: string, staffActionBy: string) { return resourceMethods.approveTemporaryResource(this.db, resourceID, staffActionBy); }
  declineTemporaryResource(resourceID: string, staffActionBy: string) { return resourceMethods.declineTemporaryResource(this.db, resourceID, staffActionBy); }
  generateResourceID() { return resourceMethods.generateResourceID(this.db); }
  checkDuplicate(field: string, value: string) { return resourceMethods.checkDuplicate(this.db, field, value); }

  initializeUser(userId: string) { return userMethods.initializeUser(this.db, userId); }
  getTopUsers() { return userMethods.getTopUsers(this.db); }
  getSupportPoints(userId: string) { return userMethods.getSupportPoints(this.db, userId); }
  addSupportPoints(userId: string, supportPoints: number) { return userMethods.addSupportPoints(this.db, userId, supportPoints); }
  getLeaderboardPosition(userId: string) { return userMethods.getLeaderboardPosition(this.db, userId); }
  getTotalUsers() { return userMethods.getTotalUsers(this.db); }

  generateDoubtID() { return doubtMethods.generateDoubtID(this.db); }
  addDoubt(doubtId: string, author: string, description: string, messageId: string, channelId: string, subject: string, grade: string, image?: string) { return doubtMethods.addDoubt(this.db, doubtId, author, description, messageId, channelId, subject, grade, image); }
  editDoubtDescription(id: string, newDescription: string) { return doubtMethods.editDoubtDescription(this.db, id, newDescription); }
  deleteDoubt(id: string) { return doubtMethods.deleteDoubt(this.db, id); }
  markDoubtAsSolved(id: string, solvedBy: string, solvedMessageId: string, solvedChannelId: string) { return doubtMethods.markDoubtAsSolved(this.db, id, solvedBy, solvedMessageId, solvedChannelId); }
  lastDoubtAsked(userId: string) { return doubtMethods.lastDoubtAsked(this.db, userId); }
  getDoubtById(id: string) { return doubtMethods.getDoubtById(this.db, id); }
  searchDoubts(subject: string, grade: string, keyword?: string) { return doubtMethods.searchDoubts(this.db, subject, grade, keyword); }
  getDoubtsForArchive(subject: string, grade: string) { return doubtMethods.getDoubtsForArchive(this.db, subject, grade); }
  checkCooldown(userId: string, cooldownMs: number) { return doubtMethods.checkCooldown(this.db, userId, cooldownMs); }
  getUserDoubtCount(userId: string) { return doubtMethods.getUserDoubtCount(this.db, userId); }
  undoSolveDoubt(id: string) { return doubtMethods.undoSolveDoubt(this.db, id); }
}

export const databaseManager = new DatabaseManager();