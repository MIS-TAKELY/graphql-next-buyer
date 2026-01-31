
import { prisma } from './lib/db/prisma';

async function check() {
    const slug = 'canon-eos-r50-mirrorless-camera-body-242mp-aps-c-sensor-or-4k-video';
    const product = await prisma.product.findUnique({
        where: { slug },
        select: { name: true, status: true, isIndexable: true }
    });
    console.log(JSON.stringify(product, null, 2));
    process.exit(0);
}

check();
