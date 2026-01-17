import express from 'express';
import cors from 'cors';
import * as OpenCC from 'opencc-js';
import { pinyin } from 'pinyin-pro';
import ToJyutping from 'to-jyutping';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize OpenCC converter (Traditional Chinese → Simplified Chinese)
const converter = OpenCC.Converter({ from: 'tw', to: 'cn' });

/**
 * Step 1: Scrape Genius.com directly for lyrics
 */
async function scrapeGeniusDirectly(songTitle) {
  console.log('Searching Genius.com for:', songTitle);

  try {
    // Step 1: Search Genius.com for the song
    const searchUrl = `https://genius.com/api/search/multi?q=${encodeURIComponent(songTitle)}`;

    const searchResponse = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    // Find the first song result
    const sections = searchResponse.data.response.sections;
    let songUrl = null;

    for (const section of sections) {
      if (section.type === 'song' && section.hits && section.hits.length > 0) {
        songUrl = section.hits[0].result.url;
        console.log('Found song URL:', songUrl);
        break;
      }
    }

    if (!songUrl) {
      throw new Error('Song not found on Genius.com');
    }

    // Step 2: Scrape the lyrics page
    const lyricsResponse = await axios.get(songUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(lyricsResponse.data);

    // Extract lyrics from Genius.com's structure
    // Genius uses data-lyrics-container attribute for lyrics
    let lyrics = '';

    $('[data-lyrics-container="true"]').each((i, elem) => {
      // Get text content and preserve line breaks
      const html = $(elem).html();
      const text = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim();
      lyrics += text + '\n';
    });

    if (!lyrics || lyrics.trim().length === 0) {
      throw new Error('Could not extract lyrics from page');
    }

    console.log('Extracted lyrics length:', lyrics.length);

    return {
      lyrics: lyrics.trim(),
      url: songUrl
    };

  } catch (error) {
    console.error('Genius scraping error:', error.message);
    throw error;
  }
}

/**
 * Step 2: Clean up the lyrics text (remove metadata, excessive whitespace)
 */
function cleanLyrics(lyricsText) {
  return lyricsText
    .trim()
    .replace(/\n{3,}/g, '\n\n')  // Remove excessive newlines
    .replace(/\r/g, '')          // Remove carriage returns
    .split('\n')
    .filter(line => {
      // Remove empty lines and metadata lines
      const trimmed = line.trim();
      if (!trimmed) return false;
      // Skip English metadata like [Verse 1], [Chorus], etc.
      if (/^\[.*\]$/.test(trimmed)) return false;
      if (/^Written by:/i.test(trimmed)) return false;
      return true;
    })
    .join('\n');
}

/**
 * Step 3: Convert Traditional Chinese to Simplified Chinese
 */
function convertToSimplified(chineseLyrics) {
  return converter(chineseLyrics);
}

/**
 * Step 4a: Add Hanyu Pinyin using pinyin-pro library (for Mandarin)
 */
async function addPinyinLocally(simplifiedLyrics) {
  const lines = simplifiedLyrics.split('\n');
  const result = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      // Add blank line for spacing
      if (result.length > 0 && result[result.length - 1] !== '') {
        result.push('');
      }
      continue;
    }

    // Convert to pinyin with tone marks
    const pinyinLine = pinyin(trimmedLine, {
      toneType: 'symbol'  // Use tone marks (ā á ǎ à)
    });

    // Add pinyin line, then Chinese line, then blank line
    result.push(pinyinLine);
    result.push(trimmedLine);
    result.push('');
  }

  return result.join('\n').trim();
}

/**
 * Step 4b: Add Jyutping using to-jyutping library (for Cantonese)
 */
async function addJyutpingLocally(chineseLyrics) {
  const lines = chineseLyrics.split('\n');
  const result = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      // Add blank line for spacing
      if (result.length > 0 && result[result.length - 1] !== '') {
        result.push('');
      }
      continue;
    }

    // Convert to Jyutping
    const jyutpingResult = ToJyutping.getJyutpingList(trimmedLine);
    // getJyutpingList returns array of [char, jyutping] pairs
    const jyutpingLine = jyutpingResult
      .map(([char, jyutping]) => jyutping || char)
      .join(' ');

    // Add Jyutping line, then Chinese line, then blank line
    result.push(jyutpingLine);
    result.push(trimmedLine);
    result.push('');
  }

  return result.join('\n').trim();
}

/**
 * Main API endpoint - Direct Genius.com scraping
 */
app.post('/api/lyrics', async (req, res) => {
  try {
    const { songTitle, language = 'mandarin' } = req.body;

    if (!songTitle) {
      return res.status(400).json({ error: 'Song title is required' });
    }

    const isCantonese = language === 'cantonese';
    const romanizationType = isCantonese ? 'Jyutping' : 'Hanyu Pinyin';

    console.log(`[1/4] Scraping Genius.com directly for: ${songTitle} (${romanizationType})`);
    const scrapedData = await scrapeGeniusDirectly(songTitle);

    console.log(`[2/4] Cleaning lyrics text...`);
    const cleanedLyrics = cleanLyrics(scrapedData.lyrics);

    console.log(`[3/4] Converting to Simplified Chinese...`);
    const simplifiedLyrics = convertToSimplified(cleanedLyrics);

    console.log(`[4/4] Adding ${romanizationType} locally...`);
    const lyricsWithRomanization = isCantonese
      ? await addJyutpingLocally(simplifiedLyrics)
      : await addPinyinLocally(simplifiedLyrics);

    res.json({
      lyrics: lyricsWithRomanization,
      source: scrapedData.url,
      method: 'genius-direct-scrape',
      language: isCantonese ? 'cantonese' : 'mandarin'
    });
  } catch (error) {
    console.error('=== ERROR ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch lyrics from Genius.com', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
