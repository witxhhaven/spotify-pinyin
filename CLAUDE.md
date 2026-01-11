# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A web application that displays Chinese song lyrics with Hanyu Pinyin annotations. The app uses direct Genius.com scraping to fetch lyrics, converts Traditional Chinese to Simplified Chinese, and adds local pinyin tone mark annotations. Built with a React frontend and Express backend server.

## Common Commands

### Development
```bash
# Start both frontend and backend concurrently (recommended)
npm run dev

# Or run separately in two terminals:
npm run dev:frontend  # Starts Vite dev server (port 5173)
npm run dev:backend   # Starts Express server (port 3001)
```

### Building and Linting
```bash
# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Backend Architecture

- **Express Server**: `server.js` runs on port 3001
- **API endpoint**: POST `/api/lyrics` accepts `{ songTitle: string }` and returns `{ lyrics: string, source: string, method: string }`
- **CORS enabled**: Allows requests from the frontend development server
- **4-Step Direct Scraping Process**:
  1. **scrapeGeniusDirectly()**: Searches Genius.com API and scrapes lyrics page
  2. **cleanLyrics()**: Removes metadata and excessive whitespace
  3. **convertToSimplified()**: Converts Traditional Chinese to Simplified Chinese using OpenCC
  4. **addPinyinLocally()**: Uses pinyin-pro library locally to add Hanyu Pinyin with tone marks

### Frontend Architecture

- **React 19** with functional components and hooks
- **Single component**: `App.jsx` contains all UI and state logic
- **Styling**: Tailwind CSS v4 with custom gradient backgrounds
- **Build tool**: Vite for fast development and optimized builds

### API Integration Pattern - Direct Genius.com Scraping

The `/api/lyrics` endpoint in `server.js` uses a 4-step direct scraping approach:

**Step 1: Search and Scrape Genius.com** (`scrapeGeniusDirectly()`)
- Uses Genius.com search API: `https://genius.com/api/search/multi?q=${songTitle}`
- Parses JSON response to find the first song result URL
- Uses `axios` to fetch the lyrics page HTML
- Uses `cheerio` to parse HTML and extract lyrics using `[data-lyrics-container="true"]` selector
- Preserves line breaks by converting `<br>` tags and `</div>` tags to newlines
- Returns raw lyrics text and source URL

**Step 2: Clean Lyrics** (`cleanLyrics()`)
- Removes excessive whitespace and newlines
- Filters out empty lines
- Removes English metadata markers: `[Verse]`, `[Chorus]`, `Written by:`, etc.
- Returns cleaned Chinese lyrics text

**Step 3: Convert to Simplified Chinese** (`convertToSimplified()`)
- Uses `opencc-js` library to convert Traditional Chinese to Simplified Chinese
- Converter: `{ from: 'tw', to: 'cn' }`
- Ensures consistent character set for pinyin conversion

**Step 4: Add Pinyin Locally** (`addPinyinLocally()`)
- Uses `pinyin-pro` library with `toneType: 'symbol'` for tone marks (ā á ǎ à)
- Processes line-by-line to maintain structure
- No API call required - fully local processing
- Formats as: pinyin line → Chinese line → blank line

**Final Response:**
```json
{
  "lyrics": "wǒ ài nǐ\n我爱你\n\n...",
  "source": "https://genius.com/Artist-song-title-lyrics",
  "method": "genius-direct-scrape"
}
```

### Environment Variables

**No environment variables are required!** The app now uses direct Genius.com scraping without any API keys.

The `.env` file is no longer needed but is kept gitignored for future use.

## Key Technical Details

### Web Scraping Implementation

**Genius.com Scraping Strategy** (`scrapeGeniusDirectly()` in `server.js`):
- **Step 1: Search** - Uses Genius.com public search API to find song by title
  - Endpoint: `https://genius.com/api/search/multi?q=${encodeURIComponent(songTitle)}`
  - Returns JSON with search results
  - Extracts first song URL from results
- **Step 2: Scrape Lyrics Page** - Fetches and parses the lyrics page
  - Uses `axios` with browser-like headers to avoid detection
  - Uses `cheerio` for jQuery-like HTML parsing
  - Targets Genius.com's specific structure: `[data-lyrics-container="true"]` attribute
  - Converts HTML line breaks (`<br>`, `</div>`) to newlines
  - Removes all HTML tags while preserving text and line structure

**Chinese Text Processing**:
- **Traditional to Simplified Conversion** (`convertToSimplified()`):
  - Uses `opencc-js` library with `{ from: 'tw', to: 'cn' }` converter
  - Handles both Traditional and Simplified Chinese input
  - Ensures consistent output for pinyin conversion

- **Pinyin Conversion** (`addPinyinLocally()`):
  - Uses `pinyin-pro` library with `toneType: 'symbol'` for tone marks
  - Processes line-by-line to maintain lyric structure
  - Skips empty lines but preserves spacing between verses
  - No external API calls required - fully local processing

### Dependencies for Lyrics Processing

- **axios**: HTTP client for fetching Genius.com API and lyrics pages
- **cheerio**: Fast, flexible HTML parsing (server-side jQuery)
- **opencc-js**: Traditional Chinese to Simplified Chinese conversion
- **pinyin-pro**: Chinese-to-Pinyin conversion with tone mark support
- **cors**: Enable CORS for frontend-backend communication
- **express**: Web server framework

### ESLint Configuration

Modern flat config format using:
- `@eslint/js` recommended rules
- React Hooks plugin for hook linting
- React Refresh plugin for Vite HMR
- Custom rule: allows uppercase or underscore-prefixed unused variables

## File Structure

```
spotify-pinyin/
├── src/
│   ├── App.jsx           # Main React component (all UI logic)
│   ├── App.css           # Component-specific styles
│   ├── index.css         # Global Tailwind imports
│   └── main.jsx          # React entry point
├── server.js             # Express backend server (4-step Genius.com scraping)
├── vite.config.js        # Vite bundler config
├── tailwind.config.js    # Tailwind CSS config
└── eslint.config.js      # ESLint flat config
```

## Development Workflow

1. **First-time setup**: No setup required! Just run `npm install` to install dependencies
2. **Local development**: Run `npm run dev` to start both frontend and backend servers concurrently
3. **Testing**:
   - Frontend runs on `http://localhost:5173`
   - Backend API on `http://localhost:3001`
   - Search for songs using format: "Song Title Artist Name" (e.g., "七里香 Jay Chou")
4. **Production build**: Run `npm run build` to create an optimized production build in `dist/`

## Important Notes

- The app uses ES modules (`"type": "module"` in package.json)
- React 19 is used (latest major version)
- Tailwind CSS v4 (latest) with minimal configuration
- No TypeScript - plain JavaScript with JSX
- No component library - custom Tailwind-styled components
- **No API keys required** - Direct Genius.com scraping without authentication
- **Fully local text processing**:
  - OpenCC for Traditional to Simplified Chinese conversion
  - Pinyin-pro for pinyin with tone marks
  - No external API calls for text processing
- **Genius.com as lyrics source**:
  - Uses public search API to find songs
  - Scrapes lyrics using data attributes
  - Best results with artist name included in search (e.g., "Song Title Artist Name")

## Troubleshooting

### Lyrics Not Found
If the API returns a "Song not found on Genius.com" error:
- The song may not be available on Genius.com
- Try including the artist name in the search: "Song Title Artist Name"
- Check the exact spelling of the song title
- Some Chinese songs may be listed under English titles on Genius

### Incorrect Lyrics
If the wrong lyrics are returned:
- Genius.com returned a different song with a similar name
- Be more specific: include artist name, album, or year in the search
- Example: Instead of "七里香", use "七里香 Jay Chou" or "七里香 周杰伦"

### Scraping Failures
If you get "Could not extract lyrics from page" error:
- Genius.com may have changed their HTML structure
- Update the selector in `scrapeGeniusDirectly()` function (currently uses `[data-lyrics-container="true"]`)
- The 10-second timeout may need adjustment for slow connections
- Genius.com may be temporarily blocking requests (rare)

### Empty or Garbled Output
If lyrics appear empty or have strange characters:
- Check server logs for extraction errors
- Verify that the song has Chinese lyrics on Genius.com
- Some pages may have lyrics in `<script>` tags instead of HTML (not currently supported)

### Pinyin Accuracy
- The `pinyin-pro` library uses dictionary-based conversion
- Some characters may have multiple pronunciations (polyphonic characters)
- Context-dependent pronunciation may not always be perfect
- For best results, verify tone marks for polyphonic characters manually

### Testing the System
Successfully tested with:
- ✅ "七里香 Jay Chou" (Qi Li Xiang)
- ✅ "海闊天空 Beyond" (Boundless Oceans Vast Skies)
- ✅ "甜蜜蜜 Teresa Teng" (Tian Mi Mi)
