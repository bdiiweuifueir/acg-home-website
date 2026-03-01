// Vercel Serverless Function (Node.js)
// Proxy for CopyManga Comic Details

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

    const { id } = req.query; // id is path_word
    
    if (!id) {
        res.status(400).json({ error: "Missing comic ID" });
        return;
    }

    try {
        // Try multiple endpoints if one fails
        const endpoints = [
            `https://www.2025copy.com/api/v3/comic2/${id}`,
            `https://www.2025copy.com/api/v3/comic/${id}`
        ];

        let infoData = null;
        let lastError = null;

        for (const url of endpoints) {
            try {
                console.log(`Trying Info API: ${url}`);
                const res = await fetch(url + "?platform=2", { 
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Referer': `https://www.2025copy.com/comic/${id}`,
                        'platform': '2',
                        'region': '1' // Sometimes required
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.code === 200) {
                        infoData = data;
                        break;
                    }
                }
            } catch (e) {
                lastError = e;
            }
        }

        if (!infoData) {
             throw new Error(`All Info APIs failed. Last error: ${lastError?.message}`);
        }

        const comic = infoData.results.comic;
        
        // Step 2: Get Chapters
        // Try default group first
        let chapters = [];
        const chapterUrl = `https://www.2025copy.com/api/v3/comic/${id}/group/default/chapters?limit=500&offset=0&platform=2`;
        
        try {
            console.log(`Fetching Chapters: ${chapterUrl}`);
            const chaptersRes = await fetch(chapterUrl, { 
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': `https://www.2025copy.com/comic/${id}`,
                    'platform': '2'
                }
            });
            
            if (chaptersRes.ok) {
                const chaptersData = await chaptersRes.json();
                if (chaptersData.code === 200) {
                    chapters = chaptersData.results.list.map(ch => ({
                        id: ch.uuid,
                        title: ch.name,
                        size: ch.size,
                        type: ch.type, 
                        sort: ch.ordered
                    }));
                } else {
                    console.warn(`Chapter API Code: ${chaptersData.code}`);
                }
            }
        } catch (e) {
            console.warn("Chapter fetch failed", e);
        }

        res.status(200).json({
            id: comic.path_word,
            title: comic.name,
            cover: comic.cover,
            author: comic.author.map(a => a.name).join(', '),
            desc: comic.brief,
            status: comic.status,
            chapters: chapters
        });

    } catch (error) {
        console.error("CopyManga Comic Error:", error);
        res.status(500).json({ error: error.message });
    }
}