import { db } from '../firebase';
import { initializeUser } from './initializeUser';

async function addSupportPoints(userId: string, supportPoints: number): Promise<void> {
    try {
        const userRef = db.collection('user').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            await initializeUser(userId);
        } else {
            const currentPoints = userDoc.data()?.supportpoints ?? 0;
            if (typeof currentPoints !== 'number') {
                return;
            }
            await userRef.update({
                supportpoints: currentPoints + supportPoints
            });
        }
    } catch (error) {
        console.error('Error adding support point:', error);
        throw error;
    }
}

export { addSupportPoints };