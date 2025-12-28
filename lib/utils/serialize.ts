/**
 * Recursively removes __typename from GraphQL response objects
 * This is necessary when passing GraphQL data to Client Components in Next.js
 */
export function stripTypename<T>(obj: T): T {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(stripTypename) as T;
    }

    if (typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
            if (key !== '__typename') {
                newObj[key] = stripTypename((obj as any)[key]);
            }
        }
        return newObj;
    }

    return obj;
}
