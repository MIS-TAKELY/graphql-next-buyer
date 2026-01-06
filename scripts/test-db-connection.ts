import { prisma } from '../lib/db/prisma';

async function main() {
    try {
        console.log('Testing database connection...');
        const result = await prisma.$queryRaw`SELECT 1 as connected`;
        console.log('Successfully connected to the database:', result);
        process.exit(0);
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    }
}

main();
