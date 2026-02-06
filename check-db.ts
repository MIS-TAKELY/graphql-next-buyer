import 'dotenv/config'
import { prisma } from './lib/db/prisma'

async function main() {
    console.log('--- Categories ---')
    const categories = await prisma.popularSearchCategory.findMany({
        include: {
            _count: {
                select: { keywords: true }
            }
        }
    })
    console.log(JSON.stringify(categories, null, 2))

    console.log('\n--- Keywords ---')
    const keywords = await prisma.popularSearchKeyword.findMany()
    console.log(JSON.stringify(keywords, null, 2))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
