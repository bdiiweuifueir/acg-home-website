# Kirikiri Web Engine Setup Guide

This directory (`public/games/krkr-engine/`) is a placeholder for the Kirikiri Web Assembly Engine. To run commercial Galgames (like *Senren*Banka*) in the browser, you need to manually populate this folder with the engine core and game data.

## 1. Get the Engine Core
Since `krkr.js` and `krkr.wasm` are part of the Kirikiri SDL2 port, you need to obtain them from a reliable source.

*   **Option A (Build from Source)**: Clone [Kirikiri-Web](https://github.com/zeas2/Kirikiri-Web) and build with Emscripten.
*   **Option B (Download Pre-built)**: Find a pre-built release from community projects (e.g., typically found in "Web Galgame" projects on GitHub).

**Files needed:**
*   `krkr.js` -> Place in this folder.
*   `krkr.wasm` -> Place in this folder.

## 2. Prepare Game Data
You need to extract the game resources from your PC version of the game.

1.  **Extract `.xp3` files**: Use tools like **Garbro** or **KrkrExtract** to unpack `data.xp3` (and others).
2.  **Convert Images**: Convert `.tlg` files to `.png` or `.webp`. (Web browsers do not support TLG).
3.  **Convert Audio**: Ensure audio is `.ogg` or `.m4a`.
4.  **Rename Files**: **CRITICAL!** Convert ALL filenames to **lowercase**. Linux/Vercel is case-sensitive, but Windows is not. If your script calls `Bg.jpg` but file is `bg.jpg`, it will fail.

## 3. Deployment Structure
Your folder should look like this:

```
public/games/krkr-engine/
├── index.html       # (Created by Trae)
├── krkr.js          # (You add this)
├── krkr.wasm        # (You add this)
└── data/            # (Game Data Folder)
    ├── system/      # System scripts
    ├── scenario/    # Game scripts (.ks)
    ├── bgimage/     # Backgrounds
    ├── fgimage/     # Sprites
    ├── bgm/         # Music
    ├── sound/       # SFX
    └── startup.tjs  # Entry point
```

## 4. Large File Strategy (Vercel Limit)
Vercel has a 4.5GB repo limit and 50MB single file limit.
For large games (4GB+):
1.  **Don't upload large assets to Vercel**.
2.  Upload `bgm/`, `voice/`, `mov/` to an object storage (Cloudflare R2, AWS OSS).
3.  Modify `krkr.js` (or use a VFS plugin) to fetch these files from the CDN URL instead of local relative path.

## 5. Testing
Once files are in place, run `npm run dev` and navigate to:
`http://localhost:5173/games/krkr-engine/index.html`

Good luck!
