import { Pool } from 'pg';

export async function getResource(db: Pool, id: string): Promise<any> {
    const { rows } = await db.query("SELECT * FROM resources WHERE id = $1", [id]);
    return rows[0] || null;
}

export async function serveResources(db: Pool, tag: string = 'ALL', search: string = ''): Promise<{ name: string, value: string }[]> {
    let query: string;
    let params: any[] = [];
    
    const searchQuery = `
        SELECT
            id,
            title,
            ts_rank_cd(search_vector, to_tsquery('english', $1), 32) AS rank
        FROM resources
        WHERE search_vector @@ to_tsquery('english', $1)
            AND status = 'active'
            ${tag !== 'ALL' ? 'AND tag = $2' : ''}
        ORDER BY rank DESC, created_at DESC
        LIMIT 25;
    `;

    const noSearchQuery = `
        SELECT id, title
        FROM resources
        WHERE status = 'active'
        ${tag !== 'ALL' ? 'AND tag = $1' : ''}
        ORDER BY created_at DESC
        LIMIT 25;
    `;

    if (search) {
        const normalizedQuery = search
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' & ')
            .split(' & ')
            .map(term => `${term}:*`)
            .join(' & ');
        query = searchQuery;
        params = tag !== 'ALL' ? [normalizedQuery, tag] : [normalizedQuery];
    } else {
        query = noSearchQuery;
        params = tag !== 'ALL' ? [tag] : [];
    }

    const { rows } = await db.query(query, params) || { rows: [] };
    const resultResources = rows.map(row => ({ name: row.title, value: row.id }));
    
    console.log(`serveResources: tag=${tag}, search=${search}, results=${resultResources.length}`);
    return resultResources;
}

export async function getAverageRating(db: Pool, resourceID: string): Promise<number | string> {
    const { rows } = await db.query(
        "SELECT rating FROM reviews WHERE resource_id = $1",
        [resourceID]
    );
    if (!rows.length) return "Unrated";
    const totalRatings = rows.reduce((acc: number, row: any) => acc + (row.rating || 0), 0);
    return totalRatings / rows.length;
}

export async function hasRated(db: Pool, resourceID: string, userID: string): Promise<boolean> {
    const { rows } = await db.query(
        "SELECT 1 FROM reviews WHERE resource_id = $1 AND reviewer = $2",
        [resourceID, userID]
    );
    return !!rows.length;
}

export async function rateResource(
    db: Pool, resourceID: string, reviewer: string, rating: number, comment: string
): Promise<boolean> {
    try {
        const resource = await getResource(db, resourceID);
        if (!resource) return false;
        const cappedRating = Math.max(1, Math.min(5, rating));
        const createdAt = Math.floor(Date.now() / 1000);
        await db.query(
            "INSERT INTO reviews (resource_id, reviewer, rating, comment, created_at) VALUES ($1, $2, $3, $4, $5)",
            [resourceID, reviewer, cappedRating, comment, createdAt]
        );
        return true;
    } catch (err) {
        console.error("Error in rateResource:", err);
        throw new Error("Failed to save rating");
    }
}

export async function deleteResource(db: Pool, resourceID: string, staffActionBy: string): Promise<boolean> {
    try {
        const resource = await getResource(db, resourceID);
        if (!resource) return false;
        await db.query(
            "UPDATE resources SET status = $1, staff_action_by = $2, staff_action_at = $3 WHERE id = $4",
            ['deleted', staffActionBy, Math.floor(Date.now() / 1000), resourceID]
        );
        console.log(`Resource ${resourceID} marked as deleted by ${staffActionBy}`);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function editTitle(db: Pool, resourceID: string, newTitle: string, staffActionBy: string): Promise<boolean> {
    try {
        const resource = await getResource(db, resourceID);
        if (!resource) return false;
        const staffActionAt = Math.floor(Date.now() / 1000);
        await db.query(
            "UPDATE resources SET title = $1, staff_action_by = $2, staff_action_at = $3 WHERE id = $4",
            [newTitle, staffActionBy, staffActionAt, resourceID]
        );
        console.log(`Resource ${resourceID} title updated to "${newTitle}" by ${staffActionBy}`);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function editTag(db: Pool, resourceID: string, newTag: string, staffActionBy: string): Promise<boolean> {
    try {
        const resource = await getResource(db, resourceID);
        if (!resource) return false;
        const staffActionAt = Math.floor(Date.now() / 1000);
        await db.query(
            "UPDATE resources SET tag = $1, staff_action_by = $2, staff_action_at = $3 WHERE id = $4",
            [newTag, staffActionBy, staffActionAt, resourceID]
        );
        console.log(`Resource ${resourceID} tag updated to "${newTag}" by ${staffActionBy}`);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function editDescription(db: Pool, resourceID: string, newDescription: string, staffActionBy: string): Promise<boolean> {
    try {
        const resource = await getResource(db, resourceID);
        if (!resource) return false;
        const staffActionAt = Math.floor(Date.now() / 1000);
        const description = newDescription.toLowerCase() === 'none' ? null : newDescription;
        await db.query(
            "UPDATE resources SET description = $1, staff_action_by = $2, staff_action_at = $3 WHERE id = $4",
            [description, staffActionBy, staffActionAt, resourceID]
        );
        console.log(`Resource ${resourceID} description updated by ${staffActionBy}`);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function editUrl(db: Pool, resourceID: string, newUrl: string, staffActionBy: string): Promise<boolean> {
    try {
        const resource = await getResource(db, resourceID);
        if (!resource) return false;
        const staffActionAt = Math.floor(Date.now() / 1000);
        await db.query(
            "UPDATE resources SET url = $1, staff_action_by = $2, staff_action_at = $3 WHERE id = $4",
            [newUrl, staffActionBy, staffActionAt, resourceID]
        );
        console.log(`Resource ${resourceID} URL updated to "${newUrl}" by ${staffActionBy}`);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function editAuthor(db: Pool, resourceID: string, newAuthor: string, staffActionBy: string): Promise<boolean> {
    try {
        const resource = await getResource(db, resourceID);
        if (!resource) return false;
        const staffActionAt = Math.floor(Date.now() / 1000);
        await db.query(
            "UPDATE resources SET author = $1, staff_action_by = $2, staff_action_at = $3 WHERE id = $4",
            [newAuthor, staffActionBy, staffActionAt, resourceID]
        );
        console.log(`Resource ${resourceID} author updated to "${newAuthor}" by ${staffActionBy}`);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function getActiveResourceCountByUser(db: Pool, userID: string): Promise<number> {
    const { rows } = await db.query(
        "SELECT COUNT(*) as count FROM resources WHERE author = $1 AND status = 'active'",
        [userID]
    );
    return rows[0].count || 0;
}

export async function getTotalResourceCountByUser(db: Pool, userID: string): Promise<number> {
    const { rows } = await db.query(
        "SELECT COUNT(*) as count FROM resources WHERE author = $1",
        [userID]
    );
    return rows[0].count || 0;
}

export async function getAverageRatingByUser(db: Pool, userID: string): Promise<number | null> {
    const { rows } = await db.query(
        "SELECT r.rating FROM reviews r JOIN resources res ON r.resource_id = res.id WHERE res.author = $1",
        [userID]
    );
    if (!rows.length) return null;
    const total = rows.reduce((acc: number, row: any) => acc + (row.rating || 0), 0);
    return total / rows.length;
}

export async function getReviewCountByUser(db: Pool, userID: string): Promise<number> {
    const { rows } = await db.query(
        "SELECT COUNT(*) as count FROM reviews WHERE reviewer = $1",
        [userID]
    );
    return rows[0].count || 0;
}

export async function addTemporaryResource(
    db: Pool, title: string, tag: string, url: string, description: string, author: string
): Promise<string> {
    try {        
        const resourceID = await generateResourceID(db);
        const createdAt = Math.floor(Date.now() / 1000);
        const desc = description === "" ? null : description;
        await db.query(
            `INSERT INTO resources (
                id, title, tag, url, description, author, created_at, 
                staff_action_at, staff_action_by, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [resourceID, title, tag, url, desc, author, createdAt, null, null, 'pending']
        );
        return resourceID;
    } catch (err) {
        throw new Error('Failed to add temporary resource');
    }
}

export async function approveTemporaryResource(db: Pool, resourceID: string, staffActionBy: string): Promise<boolean> {
    try {
        const resource = await getResource(db, resourceID);
        if (!resource) return false;
        await db.query(
            "UPDATE resources SET status = $1, staff_action_by = $2, staff_action_at = $3 WHERE id = $4",
            ['active', staffActionBy, Math.floor(Date.now() / 1000), resourceID]
        );
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function declineTemporaryResource(db: Pool, resourceID: string, staffActionBy: string): Promise<boolean> {
    try {
        const resource = await getResource(db, resourceID);
        if (!resource) return false;
        await db.query(
            "UPDATE resources SET status = $1, staff_action_by = $2, staff_action_at = $3 WHERE id = $4",
            ['deleted', staffActionBy, Math.floor(Date.now() / 1000), resourceID]
        );
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function generateResourceID(db: Pool): Promise<string> {
    const { rows } = await db.query("SELECT id FROM resources");
    const existingResourceIds = rows.map(row => row.id);
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

export async function checkDuplicate(
    db: Pool, 
    field: string, 
    value: string
): Promise<string | false> {
    try {
        const allowedFields = ['url', 'title', 'tag', 'author'];
        if (!allowedFields.includes(field)) {
            throw new Error('Invalid field specified for duplicate check');
        }

        const { rows } = await db.query(
            `SELECT id FROM resources WHERE ${field} = $1 AND status = 'active'`,
            [value]
        );

        if (rows.length > 0) {
            return rows[0].id;
        }
        return false;
    } catch (err) {
        console.error(`Error checking duplicate ${field}:`, err);
        return false;
    }
}