import { Pool } from 'pg';

export async function initializeUser(db: Pool, userId: string): Promise<void> {
    await db.query(
        `INSERT INTO users (id, supportpoints, last_active, bookmark, pronouns)
         VALUES ($1, 0, NULL, '{}', NULL)
         ON CONFLICT (id) DO NOTHING`,
        [userId]
    );
}

export async function getTopUsers(db: Pool): Promise<any[]> {
    const { rows } = await db.query(
        `SELECT id, supportpoints
         FROM users
         WHERE supportpoints > 0
         ORDER BY supportpoints DESC
         LIMIT 10`
    );
    return rows;
}

export async function getSupportPoints(db: Pool, userId: string): Promise<number> {
    const { rows } = await db.query(
        `SELECT supportpoints FROM users WHERE id = $1`,
        [userId]
    );
    return rows[0]?.supportpoints || 0;
}

export async function addSupportPoints(db: Pool, userId: string, supportPoints: number): Promise<void> {

    if (!Number.isInteger(supportPoints)) {
        throw new Error(`Support points must be an integer, got: ${supportPoints}`);
    }


    const { rows } = await db.query(
        `SELECT 1 FROM users WHERE id = $1`,
        [userId]
    );
    if (rows.length === 0) {
        await initializeUser(db, userId);
    }

    const result = await db.query(
        `UPDATE users SET supportpoints = supportpoints + $1 WHERE id = $2`,
        [supportPoints, userId]
    );
    if (result.rowCount === 0) {
        throw new Error(`Failed to update support points for user ${userId}`);
    }
}

export async function getLeaderboardPosition(db: Pool, userId: string): Promise<number> {
    const { rows } = await db.query(
        `SELECT rank
         FROM (
             SELECT id, RANK() OVER (ORDER BY supportpoints DESC) as rank
             FROM users
             WHERE supportpoints > 0
         ) ranked
         WHERE id = $1`,
        [userId]
    );
    return rows[0]?.rank || -1;
}

export async function getTotalUsers(db: Pool): Promise<number> {
    const { rows } = await db.query(`SELECT COUNT(*) as count FROM users`);
    return Number(rows[0].count) || 0;
}

export async function setUserPronouns(db: Pool, userId: string, pronouns: string): Promise<void> {
    const result = await db.query(
        `UPDATE users SET pronouns = $1 WHERE id = $2`,
        [pronouns, userId]
    );
    if (result.rowCount === 0) {
        throw new Error(`Failed to update pronouns for user ${userId}`);
    }
}

export async function getUserPronouns(db: Pool, userId: string): Promise<string | null> {
    const { rows } = await db.query(
        `SELECT pronouns FROM users WHERE id = $1`,
        [userId]
    );
    return rows[0]?.pronouns || null;
}

export async function lockStudyMode(db: Pool, userId: string): Promise<void> {
    const result = await db.query(
        `UPDATE users SET locked_studymode = TRUE WHERE id = $1`,
        [userId]
    );
    if (result.rowCount === 0) {
        throw new Error(`Failed to lock study mode for user ${userId}`);
    }
}

export async function unlockStudyMode(db: Pool, userId: string): Promise<void> {
    const result = await db.query(
        `UPDATE users SET locked_studymode = FALSE WHERE id = $1`,
        [userId]
    );
    if (result.rowCount === 0) {
        throw new Error(`Failed to unlock study mode for user ${userId}`);
    }
}

export async function isStudyModeLocked(db: Pool, userId: string): Promise<boolean> {
    const { rows } = await db.query(
        `SELECT locked_studymode FROM users WHERE id = $1`,
        [userId]
    );
    return rows[0]?.locked_studymode || false;
}