import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Audio TTS Proxy Endpoint (Reliable fallback for Chinese and English)
  app.get('/api/tts', async (req, res) => {
    try {
      const text = (req.query.text as string) || '';
      const lang = (req.query.lang as string) || 'zh-CN';

      if (!text.trim()) {
        res.status(400).send('Text query param is required');
        return;
      }

      const encoded = encodeURIComponent(text.trim());
      const langCode = lang.startsWith('zh') ? 'zh-CN' : 'en';

      // Stream TTS audio from public reliable TTS endpoint
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encoded}`;

      const response = await fetch(ttsUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'audio/mpeg, audio/*',
        },
      });

      if (!response.ok) {
        console.warn(`TTS remote returned ${response.status}`);
        res.status(response.status).send('TTS upstream failure');
        return;
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err) {
      console.error('Server /api/tts error:', err);
      res.status(500).send('Internal TTS error');
    }
  });

  // Enable JSON body parsing for LLM proxy
  app.use(express.json());

  // LLM Proxy Endpoint (Reliably bypasses browser CORS / ad-blockers)
  app.post('/api/llm/chat', async (req, res) => {
    try {
      const { endpoint, apiKey, body } = req.body;
      if (!apiKey || !apiKey.trim()) {
        res.status(400).json({ error: { message: 'API key is required' } });
        return;
      }

      const targetUrl = endpoint || 'https://api.groq.com/openai/v1/chat/completions';

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify(body),
      });

      const responseText = await response.text();
      let responseJson: any;
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        responseJson = { raw: responseText };
      }

      if (!response.ok) {
        res.status(response.status).json(responseJson);
        return;
      }

      res.json(responseJson);
    } catch (err: any) {
      console.error('Server /api/llm/chat proxy error:', err);
      res.status(500).json({ error: { message: err?.message || 'Server proxy failure' } });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite development middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`LinguaMath server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
