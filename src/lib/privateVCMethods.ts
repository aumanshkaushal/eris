import { Pool } from 'pg';

export async function setPrivateVC(db: Pool, channelID: string, ownerID: string): Promise<void> {
    await db.query(
        `INSERT INTO privateVC (id, ownerID)
         VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET ownerID = EXCLUDED.ownerID`,
        [channelID, ownerID]
    );
}

export async function isPrivateVC(db: Pool, channelID: string): Promise<boolean> {
    const { rows } = await db.query(
        "SELECT 1 FROM privateVC WHERE id = $1",
        [channelID]
    );
    return rows.length > 0;
}

export async function getPrivateVCOwner(db: Pool, channelID: string): Promise<string | null> {
    const { rows } = await db.query(
        "SELECT ownerID FROM privateVC WHERE id = $1",
        [channelID]
    );
    if (rows.length === 0) {
        return null;
    }
    return rows[0].ownerID;
}


export async function deletePrivateVC(db: Pool, channelID: string): Promise<void> {
    await db.query(
        "DELETE FROM privateVC WHERE id = $1",
        [channelID]
    );
}