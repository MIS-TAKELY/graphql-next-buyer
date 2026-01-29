import https from 'https';
import http from 'http';

const inputArg = process.argv[2] && process.argv[2].startsWith('http') ? process.argv[2] : undefined;
const BASE_URL = inputArg ? new URL(inputArg).origin : (process.argv[2] || 'http://localhost:3000');
const PRODUCT_SLUG = inputArg ? inputArg.split('/').pop() : 'sony-zve10-mirrorless-vlog-camera-242mp-apsc-sensor-4k';
const PRODUCT_URL = inputArg || `${BASE_URL}/product/${PRODUCT_SLUG}`;

console.log(`\n🚀 Starting SEO Smoke Test on: ${PRODUCT_URL}\n`);

async function fetchPage(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: data, headers: res.headers }));
        }).on('error', reject);
    });
}

async function runTest() {
    try {
        const { statusCode, body } = await fetchPage(PRODUCT_URL);

        const checks = [
            {
                name: 'HTTP Status 200',
                pass: statusCode === 200,
                detail: `Got ${statusCode}`
            },
            {
                name: 'Product Name (H1) exists',
                pass: body.includes('<h1') && body.includes('</h1>'), // Check basic H1 presence first
                detail: 'Checked for <h1 tag'
            },
            {
                name: 'JSON-LD Product Schema',
                pass: body.includes('application/ld+json') && body.includes('"@type":"Product"'),
                detail: 'Found application/ld+json and @type:Product'
            },
            {
                name: 'Price Visibility (HTML or JSON-LD)',
                // Checks for commonly formatted price or price in JSON-LD
                pass: body.includes('price') || body.includes('Price'),
                detail: 'Checked for "price" or "Price" keyword'
            },
            {
                name: 'Server Side Rendering Check',
                // If we see the specific product name in raw HTML, SSR is likely working
                pass: body.includes('Sony') || body.includes('Camera'), // Adjust based on sample product
                detail: 'Checked for "Sony" or "Camera" content'
            }
        ];

        let passedCount = 0;
        checks.forEach(check => {
            if (check.pass) {
                console.log(`✅ ${check.name}`);
                passedCount++;
            } else {
                console.log(`❌ ${check.name}: ${check.detail}`);
            }
        });

        console.log(`\nResults: ${passedCount}/${checks.length} passed.`);

        // Also check robots.txt
        const robotsUrl = `${BASE_URL}/robots.txt`;
        const robots = await fetchPage(robotsUrl);
        console.log(`\n🤖 Robots.txt Status: ${robots.statusCode}`);
        if (robots.body.includes('Sitemap:')) console.log('✅ Sitemap declaration found');
        else console.log('❌ Sitemap declaration missing');

    } catch (error) {
        console.error('❌ Test failed execution:', error.message);
    }
}

runTest();
