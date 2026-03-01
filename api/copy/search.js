// Vercel Serverless Function (Node.js)
// Proxy for CopyManga Search API

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

    const { q, offset = 0, limit = 10 } = req.query;
    
    if (!q) {
        res.status(400).json({ error: "Missing query parameter" });
        return;
    }

    try {
        // Correct API Endpoint found from HTML analysis
        const apiUrl = `https://www.2025copy.com/api/kb/web/searchcd/comics?offset=${offset}&platform=2&limit=${limit}&q=${encodeURIComponent(q)}&q_type=`;
        
        console.log(`Proxying to: ${apiUrl}`);

        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.2025copy.com/',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest',
                'platform': '2' // PC web is usually 2 or 1
            }
        });

        if (!response.ok) {
            throw new Error(`CopyManga API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code !== 200) {
            throw new Error(`API returned error code: ${data.code} - ${data.message}`);
        }

        // Transform data to our standard format
        const results = data.results.list.map(item => ({
            id: item.path_word, // Unique ID for comic
            title: item.name,
            cover: item.cover, // Image URL (needs proxying usually)
            author: item.author.map(a => a.name).join(', '),
            status: item.status === 1 ? '连载中' : '已完结',
            popular: item.popular,
            source: 'copymanga'
        }));

        res.status(200).json({ results, total: data.results.total });

    } catch (error) {
        console.error("CopyManga Search Error:", error);
        res.status(500).json({ error: error.message });
    }
}