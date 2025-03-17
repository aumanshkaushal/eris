import { db } from '../firebase';

async function generateResourceID(): Promise<string> {
    const resource = db.collection('resource');
    const existingResourceIds = (await resource.listDocuments()).map(doc => doc.id);
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

export { generateResourceID };