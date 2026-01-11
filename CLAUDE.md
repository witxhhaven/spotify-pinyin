# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A web application that displays Chinese song lyrics with Hanyu Pinyin annotations, powered by OpenAI's GPT-5 Mini model. The app uses a React frontend with an Express backend server for API requests.

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
- **API endpoint**: POST `/api/lyrics` accepts `{ songTitle: string }`
- **CORS enabled**: Allows requests from the frontend development server
- **Environment variables**: Uses `dotenv` to load `OPENAI_API_KEY` from `.env`

### Frontend Architecture

- **React 19** with functional components and hooks
- **Single component**: `App.jsx` contains all UI and state logic
- **Styling**: Tailwind CSS v4 with custom gradient backgrounds
- **Build tool**: Vite for fast development and optimized builds

### API Integration Pattern

The OpenAI API call structure in `server.js`:

1. Accepts POST request with `{ songTitle: string }`
2. Calls GPT-5 Mini (`gpt-5-mini`) with structured prompt from `prompts.js`
3. Prompt asks for alternating lines of pinyin and Chinese characters
4. Returns formatted lyrics or 404 if "NOT_FOUND" is detected in response
5. Uses `max_completion_tokens: 4096` (GPT-5 models require this parameter instead of `max_tokens`)

### Environment Variables

Required environment variable:
- `OPENAI_API_KEY`: API key for OpenAI (stored in `.env` file)

The `.env` file is gitignored. Use `.env.example` as a template.

## Key Technical Details

### Prompt Engineering

The prompt template is stored in `prompts.js` and exported via `getLyricsPrompt(songTitle)`. The prompt is carefully structured to:
- Request alternating pinyin and Chinese character lines
- Specify Hanyu Pinyin with tone marks
- Request simplified Chinese characters
- Handle cases where lyrics are not available (returns "NOT_FOUND")
- Accept flexible input: song title only, title + artist, title + year, or any combination

When modifying the prompt, edit `prompts.js` and maintain the structured format for consistent output.

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
├── server.js             # Express backend server
├── prompts.js            # OpenAI prompt templates
├── vite.config.js        # Vite bundler config
├── tailwind.config.js    # Tailwind CSS config
└── eslint.config.js      # ESLint flat config
```

## Development Workflow

1. **First-time setup**: Create a `.env` file with your `OPENAI_API_KEY` (use `.env.example` as a template)
2. **Local development**: Run `npm run dev` to start both frontend and backend servers concurrently
3. **Testing**: Frontend runs on `http://localhost:5173`, backend API on `http://localhost:3001`
4. **Production build**: Run `npm run build` to create an optimized production build in `dist/`

## Important Notes

- The app uses ES modules (`"type": "module"` in package.json)
- React 19 is used (latest major version)
- Tailwind CSS v4 (latest) with minimal configuration
- No TypeScript - plain JavaScript with JSX
- No component library - custom Tailwind-styled components
- Uses GPT-5 Mini model - when changing models, remember that GPT-5 models use `max_completion_tokens` instead of `max_tokens`
