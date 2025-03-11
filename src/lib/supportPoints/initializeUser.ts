import { db } from '../firebase';

async function initializeUser(userId: string): Promise<void> {
    try {
        const userRef = db.collection('user').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) return;

            await userRef.set({
                supportpoints: 0,
                lastActive: null,
                bookmark: []
            });
    } catch (error) {
        console.error('Error adding support point:', error);
        throw error;
    }
}

export { initializeUser };