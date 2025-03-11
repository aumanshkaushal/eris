import { db } from '../firebase';

async function getSupportPoints(userId: string): Promise<Number> {
    try {
        const userRef = db.collection('user').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            await userRef.set({
                supportpoints: 0,
                lastActive: null,
                bookmark: []
            });
        }

        return userDoc.data()?.supportpoints ?? 0;

    } catch (error) {
        console.error('Error adding support point:', error);
        throw error;
    }
}

export { getSupportPoints };