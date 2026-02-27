// Vercel Serverless Function (Node.js)
// Proxy for Hitokoto API with Fallback and Caching

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const API_URL = "https://v1.hitokoto.cn";
    const FALLBACK_HITOKOTO = {
        hitokoto: "生命不息，折腾不止。",
        from: "佚名",
        from_who: "未知"
    };

    try {
        // Fetch from Hitokoto with 3s timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(API_URL, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Upstream API Error: ${response.status}`);
        }

        const data = await response.json();

        // Cache for 60 seconds (s-maxage=60 for CDN, max-age=60 for browser)
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        res.status(200).json(data);

    } catch (error) {
        console.error("Hitokoto Proxy Error:", error);
        // Fallback response
        res.status(200).json(FALLBACK_HITOKOTO);
    }
}