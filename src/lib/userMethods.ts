import { Client } from '@libsql/client';

export async function initializeUser(db: Client, userId: string): Promise<void> {
    const { rows } = await db.execute({ sql: "SELECT id FROM users WHERE id = ?", args: [userId] });
    if (rows.length) return;

    await db.execute({
        sql: "INSERT INTO users (id, supportpoints, last_active, bookmark) VALUES (?, ?, ?, ?)",
        args: [userId, 0, null, JSON.stringify([])]
    });
}

export async function getTopUsers(db: Client): Promise<string[]> {
    const { rows } = await db.execute({
        sql: "SELECT id FROM users ORDER BY supportpoints DESC LIMIT 10",
        args: []
    });
    return rows.map(row => row.id as string);
}

export async function getSupportPoints(db: Client, userId: string): Promise<number> {
    const { rows } = await db.execute({
        sql: "SELECT supportpoints FROM users WHERE id = ?",
        args: [userId]
    });
    if (!rows.length) {
        await initializeUser(db, userId);
        return 0;
    }
    return rows[0].supportpoints as number || 0;
}

export async function addSupportPoints(db: Client, userId: string, supportPoints: number): Promise<boolean> {
    const { rows } = await db.execute({
        sql: "SELECT supportpoints FROM users WHERE id = ?",
        args: [userId]
    });
    if (!rows.length) await initializeUser(db, userId);
    const currentPoints = rows.length ? (rows[0].supportpoints as number || 0) : 0;
    const { rowsAffected } = await db.execute({
        sql: "UPDATE users SET supportpoints = ? WHERE id = ?",
        args: [currentPoints + supportPoints, userId]
    });
    return rowsAffected > 0;
}

export async function getTotalUsers(db: Client): Promise<number> {
    const { rows } = await db.execute("SELECT COUNT(*) as total FROM users");
    return rows[0].total as number || 0;
}

export async function getLeaderboardPosition(db: Client, userId: string): Promise<number> {
    const { rows: userRows } = await db.execute({
        sql: "SELECT supportpoints FROM users WHERE id = ?",
        args: [userId]
    });
    if (!userRows.length) await initializeUser(db, userId);
    const userPoints = userRows.length ? (userRows[0].supportpoints as number || 0) : 0;
    const { rows: countRows } = await db.execute({
        sql: "SELECT COUNT(*) as higher FROM users WHERE supportpoints > ?",
        args: [userPoints]
    });
    return (countRows[0].higher as number || 0) + 1;
}