import { db } from '../firebase';

async function approveTemporaryResource(
    resourceID: string,
    staffActionBy: string
): Promise<boolean> {
    const resource = await db.collection('resource').doc(resourceID).get();
    if (!resource.exists) return false;
    
    const data = resource.data() as { [key: string]: any };
    data.status = 'active';
    data.staffActionAt = Date.now();
    data.staffActionBy = staffActionBy;
    
    await db.collection('resource').doc(resourceID).set(data);
    return true;
}

export { approveTemporaryResource };