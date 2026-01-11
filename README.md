# Chinese Song Lyrics with Pinyin

A web application that displays Chinese song lyrics with Hanyu Pinyin annotations, powered by Claude AI.

## Features

- Enter any Chinese song title
- Get lyrics formatted with Hanyu Pinyin (with tone marks) above each line
- Simplified Chinese characters below the pinyin
- Clean, modern UI built with React and Tailwind CSS
- Powered by Claude 3.5 Haiku (fast and cost-effective)
- Serverless architecture with Vercel

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- An Anthropic API key
- A Vercel account (free tier available)

## Getting Your Claude API Key

### Step 1: Create an Anthropic Account

1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Click "Sign Up" or "Sign In" if you already have an account
3. Complete the registration process

### Step 2: Get API Access

1. Once logged in, navigate to the [API Keys page](https://console.anthropic.com/settings/keys)
2. Click "Create Key" button
3. Give your key a name (e.g., "Lyrics App")
4. Copy the API key immediately (you won't be able to see it again)

### Step 3: Add Credits

1. Go to [Billing](https://console.anthropic.com/settings/billing) in the console
2. Add credits to your account (minimum $5)
3. The app uses Claude 3.5 Haiku, which is very affordable

### Model Pricing (as of January 2025)

**Claude 3.5 Haiku** (used in this app):
- Input: $0.80 per million tokens
- Output: $4.00 per million tokens

This is the cheapest and fastest model, perfect for this use case. A typical song lyrics request costs less than $0.01.

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Install Vercel CLI globally (if you haven't already):
```bash
npm install -g vercel
```

4. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

5. Open the `.env` file and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

## Running Locally

Run the development server with Vercel CLI (this runs both frontend and serverless functions):

```bash
vercel dev
```

The app will start on `http://localhost:3000`

Note: The first time you run `vercel dev`, it will ask you to link the project. Follow the prompts:
- Set up and develop: Y
- Which scope: Select your account
- Link to existing project: N
- What's your project's name: spotify-pinyin (or any name)
- In which directory is your code located: ./ (just press Enter)

## Deploying to Vercel

### Option 1: Deploy via CLI (Recommended)

1. Make sure you're logged in to Vercel:
```bash
vercel login
```

2. Deploy to production:
```bash
vercel --prod
```

3. Add your environment variable in Vercel dashboard:
   - Go to your project settings
   - Click "Environment Variables"
   - Add `ANTHROPIC_API_KEY` with your API key
   - Redeploy if needed: `vercel --prod`

### Option 2: Deploy via GitHub

1. Push your code to a GitHub repository

2. Go to [vercel.com](https://vercel.com) and click "New Project"

3. Import your GitHub repository

4. Add environment variable:
   - In the deployment settings, add `ANTHROPIC_API_KEY`
   - Paste your Anthropic API key

5. Click "Deploy"

Vercel will automatically deploy your app and give you a URL like `https://your-app.vercel.app`

## Usage

1. Open your browser and go to your deployed URL (or `http://localhost:3000` for local)
2. Enter a Chinese song title (e.g., "月亮代表我的心")
3. Click "Get Lyrics"
4. View the lyrics with pinyin annotations

## Example Songs to Try

- 月亮代表我的心 (The Moon Represents My Heart)
- 甜蜜蜜 (Sweet Honey)
- 童话 (Fairy Tale)
- 小幸运 (A Little Happiness)
- 演员 (Actor)

## Technology Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **AI**: Claude 3.5 Haiku via Anthropic API
- **Language**: JavaScript (ES Modules)
- **Hosting**: Vercel

## Project Structure

```
spotify-pinyin/
├── src/
│   ├── App.jsx          # Main React component
│   ├── App.css          # Component styles
│   ├── index.css        # Global styles (Tailwind)
│   └── main.jsx         # React entry point
├── api/
│   └── lyrics.js        # Vercel serverless function
├── .env                 # Environment variables (API key)
├── .env.example         # Example environment file
├── vercel.json          # Vercel configuration
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind configuration
└── vite.config.js       # Vite configuration
```

## Why Vercel?

- **No separate backend**: Serverless functions handle API calls
- **Free tier**: Generous free limits for personal projects
- **Automatic deployments**: Push to GitHub and auto-deploy
- **Environment variables**: Secure API key storage
- **HTTPS by default**: Automatic SSL certificates
- **Edge network**: Fast global performance

## Troubleshooting

### API Key Issues
- Make sure you've added `ANTHROPIC_API_KEY` in Vercel dashboard
- Verify your API key is correct and has no extra spaces
- Check that you have credits in your Anthropic account
- Redeploy after adding environment variables

### Local Development Issues
- Make sure you're using `vercel dev` not `npm run dev`
- Check that your `.env` file exists and has the correct key
- Try `vercel env pull` to sync environment variables from Vercel

### Deployment Issues
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify the build command is correct in `vercel.json`

### Lyrics Not Found
- Try entering the song title in Chinese characters
- Some songs may not be in Claude's training data
- Make sure the song actually has Chinese lyrics

## Cost Estimation

With Claude 3.5 Haiku:
- Average song request: ~500 input tokens + ~2000 output tokens
- Cost per request: ~$0.008 (less than 1 cent)
- 100 songs: ~$0.80
- 1000 songs: ~$8.00

Vercel Free Tier includes:
- 100 GB bandwidth
- 100 GB-hours serverless function execution
- Unlimited deployments

This is more than enough for personal use and small projects.

## Alternative: Running Without Vercel

If you don't want to use Vercel, you can still run the old Express backend:

1. Uncomment the dependencies in `package.json`: `express`, `cors`, `dotenv`
2. Use the old `server.js` file
3. Change the fetch URL in `App.jsx` back to `http://localhost:3001/api/lyrics`
4. Run `npm run server` in one terminal and `npm run dev` in another

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests.
