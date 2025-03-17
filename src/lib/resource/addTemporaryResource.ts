import { db } from '../firebase';
import { generateResourceID } from './generateResourceID';

async function addTemporaryResource(
    title: string,
    tag: string,
    url: string,
    description: string,
    author: string
): Promise<string> {
    const resourceID = await generateResourceID();

    const createdAt = Date.now();
    const resource = db.collection('resource').doc(resourceID);
    const desc = description === "" ? null : description;
    await resource.set({
        title,
        tag,
        url,
        description: desc,
        author,
        createdAt,
        staffActionAt: null,
        staffActionBy: null,
        usage: [],
        rating: [],
        status: 'pending'
    });

    return resourceID;
}

export { addTemporaryResource };