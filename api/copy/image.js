// Vercel Serverless Function (Node.js)
// Proxy for CopyManga Images (Bypass Referer Check)

export default async function handler(req, res) {
    // CORS headers
    const allowedOrigins = ['https://ninihaobcx.vercel.app', 'http://localhost:5173'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*'); 
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    const { url } = req.query;
    
    if (!url) {
        res.status(400).send("Missing URL");
        return;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.2025copy.com/', // Fake Referer
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        });

        if (!response.ok) {
            throw new Error(`Image Fetch Error: ${response.status}`);
        }

        // Pipe the image content
        const contentType = response.headers.get('content-type');
        res.setHeader('Content-Type', contentType);
        // Cache for 1 day
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
        
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));

    } catch (error) {
        console.error("Image Proxy Error:", error);
        res.status(500).send("Image Load Failed");
    }
}