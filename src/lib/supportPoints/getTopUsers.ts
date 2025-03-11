import { db } from '../firebase';

async function getTopUsers(): Promise<string[]> {
    try {
        const querySnapshot = await db
            .collection('user')
            .orderBy('supportpoints', 'desc')
            .limit(10)
            .get();

        const topUsers = querySnapshot.docs.map(doc => doc.id);
        return topUsers;
    } catch (error) {
        console.error('Error fetching top users:', error);
        throw error;
    }
}

export { getTopUsers };