// Vercel Serverless Function (Node.js)
// Proxy for Hitokoto API with Fallback and Caching

export default async function handler(req, res) {
    // Security: Restrict CORS
    // In production, replace '*' with your actual domain, e.g., 'https://your-domain.com'
    // For this personal project, we keep logic dynamic but safeish
    const allowedOrigins = ['https://ninihaobcx.vercel.app', 'http://localhost:5173'];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        // Default to * only if necessary, or restrict strictly
        res.setHeader('Access-Control-Allow-Origin', '*'); 
    }
    
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS'); // Only allow GET
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Simple DoS mitigation: artificial delay for non-browser UA or high frequency (mock)
    // For Vercel, we rely on platform protection mostly.

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

        // Cache for 60 seconds
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        res.status(200).json(data);

    } catch (error) {
        // Secure logging: Don't log full error object if it contains sensitive data
        console.error(`Hitokoto Proxy Error: ${error.message}`);
        res.status(200).json(FALLBACK_HITOKOTO);
    }
}