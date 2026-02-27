// Vercel Serverless Function (Node.js)
// Get chapters for a manga

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
        res.status(400).json({ error: "Missing manga ID" });
        return;
    }

    try {
        // Fetch chapters from MangaDex
        // translatedLanguage[]=ja (original) or en (english) or zh (chinese)
        // We prioritize Chinese, then English, then Original
        const apiUrl = `https://api.mangadex.org/manga/${id}/feed?translatedLanguage[]=zh&translatedLanguage[]=zh-hk&translatedLanguage[]=en&order[chapter]=desc&limit=20`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`MangaDex API error: ${response.status}`);
        
        const data = await response.json();
        
        const chapters = data.data.map(ch => ({
            id: ch.id,
            chapter: ch.attributes.chapter,
            title: ch.attributes.title || `Chapter ${ch.attributes.chapter}`,
            lang: ch.attributes.translatedLanguage,
            pages: ch.attributes.pages
        }));

        res.status(200).json({ chapters });
    } catch (error) {
        console.error("MangaDex Chapter Error:", error);
        res.status(500).json({ error: "Chapter fetch failed" });
    }
}