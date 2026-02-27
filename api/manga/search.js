// Vercel Serverless Function (Node.js)
// Proxy for MangaDex API

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
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { query } = req.query;
    
    if (!query) {
        res.status(400).json({ error: "Missing query parameter" });
        return;
    }

    try {
        // Search MangaDex for manga titles
        // includes[]=cover_art ensures we get cover filename
        const apiUrl = `https://api.mangadex.org/manga?title=${encodeURIComponent(query)}&limit=10&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`MangaDex API error: ${response.status}`);
        
        const data = await response.json();
        
        // Transform data for frontend
        const results = data.data.map(manga => {
            const title = manga.attributes.title.en || manga.attributes.title.ja || Object.values(manga.attributes.title)[0];
            const coverRel = manga.relationships.find(r => r.type === 'cover_art');
            const coverFileName = coverRel ? coverRel.attributes.fileName : null;
            const coverUrl = coverFileName 
                ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}.256.jpg` 
                : '/assets/images/backgrounds/page-head/old.jpg';

            return {
                id: manga.id,
                title: title,
                cover: coverUrl,
                desc: manga.attributes.description.en || "",
                year: manga.attributes.year
            };
        });

        res.status(200).json({ results });
    } catch (error) {
        console.error("MangaDex Search Error:", error);
        res.status(500).json({ error: "Search failed" });
    }
}