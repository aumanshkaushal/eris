import { Client } from '@libsql/client';
import { filter } from 'fuzzaldrin';

export async function getResource(db: Client, id: string): Promise<any> {
    const { rows } = await db.execute({ sql: "SELECT * FROM resources WHERE id = ?", args: [id] });
    return rows[0] || null;
}

export async function serveResources(db: Client, tag: string = 'ALL', search: string = ''): Promise<{ name: string, value: string }[]> {
    const query = tag === 'ALL'
        ? "SELECT id, title FROM resources WHERE status = 'active'"
        : "SELECT id, title FROM resources WHERE tag = ? AND status = 'active'";
    const { rows } = await db.execute({ sql: query, args: tag === 'ALL' ? [] : [tag] });
    let resources = rows.map(row => ({ name: row.title as string, value: row.id as string }));
    if (search) {
        resources = filter(resources, search, { key: 'name' });
    }
    console.log(`serveResources: tag=${tag}, search=${search}, results=${resources.length}`);
    return resources.slice(0, 25);
}

export async function getAverageRating(db: Client, resourceID: string): Promise<number | string> {
    const { rows } = await db.execute({
        sql: "SELECT rating FROM reviews WHERE resource_id = ?",
        args: [resourceID]
    });
    if (!rows.length) return "Unrated";
    const totalRatings = rows.reduce((acc, row) => acc + (row.rating as number || 0), 0);
    return totalRatings / rows.length;
}

export async function hasRated(db: Client, resourceID: string, userID: string): Promise<boolean> {
    const { rows } = await db.execute({
        sql: "SELECT 1 FROM reviews WHERE resource_id = ? AND reviewer = ?",
        args: [resourceID, userID]
    });
    return !!rows.length;
}

export async function rateResource(
    db: Client, resourceID: string, reviewer: string, rating: number, comment: string
): Promise<boolean> {
    const resource = await getResource(db, resourceID);
    if (!resource) return false;
    const cappedRating = Math.max(1, Math.min(5, rating));
    const { rowsAffected } = await db.execute({
        sql: "INSERT INTO reviews (resource_id, reviewer, rating, comment) VALUES (?, ?, ?, ?)",
        args: [resourceID, reviewer, cappedRating, comment]
    });
    return rowsAffected > 0;
}

export async function deleteResource(db: Client, resourceID: string, staffActionBy: string): Promise<boolean> {
    const resource = await getResource(db, resourceID);
    if (!resource) return false;
    const { rowsAffected } = await db.execute({
        sql: "UPDATE resources SET status = ?, staff_action_by = ?, staff_action_at = ? WHERE id = ?",
        args: ['deleted', staffActionBy, Math.floor(Date.now() / 1000), resourceID]
    });
    if (rowsAffected > 0) {
        console.log(`Resource ${resourceID} marked as deleted by ${staffActionBy}`);
        return true;
    }
    return false;
}

export async function editTitle(db: Client, resourceID: string, newTitle: string, staffActionBy: string): Promise<boolean> {
    const resource = await getResource(db, resourceID);
    if (!resource) return false;
    const staffActionAt = Math.floor(Date.now() / 1000);
    const { rowsAffected } = await db.execute({
        sql: "UPDATE resources SET title = ?, staff_action_by = ?, staff_action_at = ? WHERE id = ?",
        args: [newTitle, staffActionBy, staffActionAt, resourceID]
    });
    if (rowsAffected > 0) {
        console.log(`Resource ${resourceID} title updated to "${newTitle}" by ${staffActionBy}`);
        return true;
    }
    return false;
}

export async function editTag(db: Client, resourceID: string, newTag: string, staffActionBy: string): Promise<boolean> {
    const resource = await getResource(db, resourceID);
    if (!resource) return false;
    const staffActionAt = Math.floor(Date.now() / 1000);
    const { rowsAffected } = await db.execute({
        sql: "UPDATE resources SET tag = ?, staff_action_by = ?, staff_action_at = ? WHERE id = ?",
        args: [newTag, staffActionBy, staffActionAt, resourceID]
    });
    if (rowsAffected > 0) {
        console.log(`Resource ${resourceID} tag updated to "${newTag}" by ${staffActionBy}`);
        return true;
    }
    return false;
}

export async function editDescription(db: Client, resourceID: string, newDescription: string, staffActionBy: string): Promise<boolean> {
    const resource = await getResource(db, resourceID);
    if (!resource) return false;
    const staffActionAt = Math.floor(Date.now() / 1000);
    const { rowsAffected } = await db.execute({
        sql: "UPDATE resources SET description = ?, staff_action_by = ?, staff_action_at = ? WHERE id = ?",
        args: [newDescription, staffActionBy, staffActionAt, resourceID]
    });
    if (rowsAffected > 0) {
        console.log(`Resource ${resourceID} description updated by ${staffActionBy}`);
        return true;
    }
    return false;
}

export async function editUrl(db: Client, resourceID: string, newUrl: string, staffActionBy: string): Promise<boolean> {
    const resource = await getResource(db, resourceID);
    if (!resource) return false;
    const staffActionAt = Math.floor(Date.now() / 1000);
    const { rowsAffected } = await db.execute({
        sql: "UPDATE resources SET url = ?, staff_action_by = ?, staff_action_at = ? WHERE id = ?",
        args: [newUrl, staffActionBy, staffActionAt, resourceID]
    });
    if (rowsAffected > 0) {
        console.log(`Resource ${resourceID} URL updated to "${newUrl}" by ${staffActionBy}`);
        return true;
    }
    return false;
}

export async function editAuthor(db: Client, resourceID: string, newAuthor: string, staffActionBy: string): Promise<boolean> {
    const resource = await getResource(db, resourceID);
    if (!resource) return false;
    const staffActionAt = Math.floor(Date.now() / 1000);
    const { rowsAffected } = await db.execute({
        sql: "UPDATE resources SET author = ?, staff_action_by = ?, staff_action_at = ? WHERE id = ?",
        args: [newAuthor, staffActionBy, staffActionAt, resourceID]
    });
    if (rowsAffected > 0) {
        console.log(`Resource ${resourceID} author updated to "${newAuthor}" by ${staffActionBy}`);
        return true;
    }
    return false;
}

export async function getActiveResourceCountByUser(db: Client, userID: string): Promise<number> {
    const { rows } = await db.execute({
        sql: "SELECT COUNT(*) as count FROM resources WHERE author = ? AND status = 'active'",
        args: [userID]
    });
    return rows[0].count as number || 0;
}

export async function getTotalResourceCountByUser(db: Client, userID: string): Promise<number> {
    const { rows } = await db.execute({
        sql: "SELECT COUNT(*) as count FROM resources WHERE author = ?",
        args: [userID]
    });
    return rows[0].count as number || 0;
}

export async function getAverageRatingByUser(db: Client, userID: string): Promise<number | null> {
    const { rows } = await db.execute({
        sql: "SELECT r.rating FROM reviews r JOIN resources res ON r.resource_id = res.id WHERE res.author = ?",
        args: [userID]
    });
    if (!rows.length) return null;
    const total = rows.reduce((acc, row) => acc + (row.rating as number || 0), 0);
    return total / rows.length;
}

export async function getReviewCountByUser(db: Client, userID: string): Promise<number> {
    const { rows } = await db.execute({
        sql: "SELECT COUNT(*) as count FROM reviews WHERE reviewer = ?",
        args: [userID]
    });
    return rows[0].count as number || 0;
}

export async function addTemporaryResource(
    db: Client, title: string, tag: string, url: string, description: string, author: string
): Promise<string> {
    try {        
        const resourceID = await generateResourceID(db);
        const createdAt = Math.floor(Date.now() / 1000);
        const desc = description === "" ? null : description;
        await db.execute({
            sql: `INSERT INTO resources (
                id, title, tag, url, description, author, created_at, 
                staff_action_at, staff_action_by, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

            args: [resourceID, title, tag, url, desc, author, createdAt, null, null, 'pending']
        });
        return resourceID
    } catch (err) {
        throw new Error('No rows were affected while adding the resource');
    }
}

export async function approveTemporaryResource(db: Client, resourceID: string, staffActionBy: string): Promise<boolean> {
    const resource = await getResource(db, resourceID);
    if (!resource) return false;
    const { rowsAffected } = await db.execute({
        sql: "UPDATE resources SET status = ?, staff_action_by = ?, staff_action_at = ? WHERE id = ?",
        args: ['active', staffActionBy, Math.floor(Date.now() / 1000), resourceID]
    });
    return rowsAffected > 0;
}

export async function declineTemporaryResource(db: Client, resourceID: string, staffActionBy: string): Promise<boolean> {
    const resource = await getResource(db, resourceID);
    if (!resource) return false;
    const { rowsAffected } = await db.execute({
        sql: "UPDATE resources SET status = ?, staff_action_by = ?, staff_action_at = ? WHERE id = ?",
        args: ['deleted', staffActionBy, Math.floor(Date.now() / 1000), resourceID]
    });
    return rowsAffected > 0;
}

export async function generateResourceID(db: Client): Promise<string> {
    const { rows } = await db.execute("SELECT id FROM resources");
    const existingResourceIds = rows.map(row => row.id as string);
    const upperString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberString = '0123456789';
    let resourceId = '';

    while (!resourceId || existingResourceIds.includes(resourceId)) {
        resourceId = 
            upperString.charAt(Math.floor(Math.random() * upperString.length)) +
            upperString.charAt(Math.floor(Math.random() * upperString.length)) +
            numberString.charAt(Math.floor(Math.random() * numberString.length)) +
            numberString.charAt(Math.floor(Math.random() * numberString.length)) +
            numberString.charAt(Math.floor(Math.random() * numberString.length));
    }
    return resourceId;
}