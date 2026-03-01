// Vercel Serverless Function (Node.js)
// Proxy for CopyManga Chapter Images

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

    const { id, comicId } = req.query; // id=chapter_uuid, comicId=path_word
    
    if (!id || !comicId) {
        res.status(400).json({ error: "Missing ID" });
        return;
    }

    try {
        const url = `https://www.2025copy.com/api/v3/comic/${comicId}/chapter/${id}?platform=2`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': `https://www.2025copy.com/comic/${comicId}/chapter/${id}`,
                'platform': '2',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.code !== 200) {
            throw new Error(`API Code Error: ${data.code}`);
        }
        
        // Extract images
        // CopyManga returns `contents` array with `url`
        const pages = data.results.chapter.contents.map(c => c.url);
        
        // Add words (pagination info)
        const words = data.results.chapter.words; // number of pages

        res.status(200).json({ pages, words });

    } catch (error) {
        console.error("CopyManga Chapter Error:", error);
        res.status(500).json({ error: error.message });
    }
}