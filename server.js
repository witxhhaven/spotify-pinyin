import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { getLyricsPrompt } from './prompts.js';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/lyrics', async (req, res) => {
  try {
    const { songTitle } = req.body;

    if (!songTitle) {
      return res.status(400).json({ error: 'Song title is required' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      max_completion_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: getLyricsPrompt(songTitle),
        },
      ],
    });

    const responseText = completion.choices[0].message.content;

    if (responseText.includes('NOT_FOUND')) {
      return res.status(404).json({ error: 'Lyrics not found or not in Chinese' });
    }

    res.json({ lyrics: responseText });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch lyrics' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
