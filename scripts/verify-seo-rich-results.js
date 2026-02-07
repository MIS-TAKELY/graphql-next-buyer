import https from 'https';
import http from 'http';

const URL_TO_TEST = process.argv[2] || 'http://localhost:3000/best-phone-under-5000';

async function fetchPage(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        }).on('error', reject);
    });
}

async function verify() {
    console.log(`Verifying: ${URL_TO_TEST}`);
    try {
        const { statusCode, body } = await fetchPage(URL_TO_TEST);

        console.log(`Status: ${statusCode}`);

        const hasBreadcrumb = body.includes('"@type":"BreadcrumbList"');
        const hasItemList = body.includes('"@type":"ItemList"');
        const hasOgImage = body.includes('property="og:image"');

        console.log(`[${hasBreadcrumb ? 'OK' : 'FAIL'}] BreadcrumbList schema`);
        console.log(`[${hasItemList ? 'OK' : 'FAIL'}] ItemList schema`);
        console.log(`[${hasOgImage ? 'OK' : 'FAIL'}] OG Image tags`);

        if (hasBreadcrumb && hasItemList && hasOgImage) {
            console.log("\n✅ SEO Enhancements Verified!");
        } else {
            console.log("\n❌ Some checks failed. Ensure the server is running and the slug exists.");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

verify();
