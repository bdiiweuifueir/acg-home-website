// Vercel Serverless Function (Node.js)
// Get pages (images) for a chapter

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

    const { id } = req.query;
    
    if (!id) {
        res.status(400).json({ error: "Missing chapter ID" });
        return;
    }

    try {
        // Fetch pages metadata
        const apiUrl = `https://api.mangadex.org/at-home/server/${id}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`MangaDex API error: ${response.status}`);
        
        const data = await response.json();
        
        // Cache response for 1 hour
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        
        // Construct image URLs
        const baseUrl = data.baseUrl;
        const hash = data.chapter.hash;
        const pages = data.chapter.data.map(filename => `${baseUrl}/data/${hash}/${filename}`);

        res.status(200).json({ pages });
    } catch (error) {
        console.error("MangaDex Pages Error:", error);
        res.status(500).json({ error: "Pages fetch failed" });
    }
}