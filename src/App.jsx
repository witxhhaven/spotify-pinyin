import { useState } from 'react';
import './App.css';

function App() {
  const [songTitle, setSongTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLyrics = async (e) => {
    e.preventDefault();

    if (!songTitle.trim()) {
      setError('Please enter a song title, artist, or year');
      return;
    }

    setLoading(true);
    setError('');
    setLyrics('');

    try {
      const response = await fetch('http://localhost:3001/api/lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songTitle: songTitle.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch lyrics');
      }

      setLyrics(data.lyrics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
            Chinese Song Lyrics with Pinyin
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Enter a Chinese song (title, artist, or year) to get lyrics with Hanyu Pinyin
          </p>

          <form onSubmit={fetchLyrics} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                placeholder="e.g., 月亮代表我的心 邓丽君 or 七里香 周杰伦 2004"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Loading...' : 'Get Lyrics'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {lyrics && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Lyrics:</h2>
              <div className="whitespace-pre-wrap font-mono text-lg leading-relaxed">
                {lyrics}
              </div>
            </div>
          )}

          {!lyrics && !error && !loading && (
            <div className="text-center text-gray-500 py-12">
              Enter a song above to display lyrics with pinyin
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Powered by GPT-4o Mini</p>
        </div>
      </div>
    </div>
  );
}

export default App;
