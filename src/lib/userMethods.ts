import { Database } from 'sqlite3';

export async function initializeUser(db: Database, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        db.get("SELECT id FROM users WHERE id = ?", [userId], (err, row) => {
            if (err) return reject(err);
            if (row) return resolve();

            db.run(
                "INSERT INTO users (id, supportpoints, last_active, bookmark) VALUES (?, ?, ?, ?)",
                [userId, 0, null, JSON.stringify([])],
                (err) => {
                    if (err) {
                        console.error('Error initializing user:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    });
}

export async function getTopUsers(db: Database): Promise<string[]> {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT id FROM users ORDER BY supportpoints DESC LIMIT 10",
            [],
            (err, rows: any[]) => {
                if (err) {
                    console.error('Error fetching top users:', err);
                    reject(err);
                } else {
                    resolve(rows.map(row => row.id));
                }
            }
        );
    });
}

export async function getSupportPoints(db: Database, userId: string): Promise<number> {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT supportpoints FROM users WHERE id = ?",
            [userId],
            async (err, row: any) => {
                if (err) return reject(err);
                if (row) return resolve(row.supportpoints || 0);

                try {
                    await initializeUser(db, userId);
                    resolve(0);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}

export async function addSupportPoints(db: Database, userId: string, supportPoints: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT supportpoints FROM users WHERE id = ?",
            [userId],
            async (err, row: any) => {
                if (err) {
                    console.error('Error adding support point:', err);
                    return reject(err);
                }

                if (!row) {
                    try {
                        await initializeUser(db, userId);
                    } catch (error) {
                        return reject(error);
                    }
                }

                const currentPoints = row ? row.supportpoints || 0 : 0;
                db.run(
                    "UPDATE users SET supportpoints = ? WHERE id = ?",
                    [currentPoints + supportPoints, userId],
                    (err) => {
                        if (err) {
                            console.error('Error updating support points:', err);
                            resolve(false);
                        } else {
                            resolve(true);
                        }
                    }
                );
            }
        );
    });
}