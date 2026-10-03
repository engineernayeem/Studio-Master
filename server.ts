import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { removeBackground } from '@imgly/background-removal-node';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '35mb' }));

// Server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// High-Accuracy Machine Learning Background Removal Service
app.post('/api/remove-background', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const inputBlob = new Blob([buffer], { type: 'image/png' });

    // Execute neural network portrait segmentation (ISNet / U2Net architecture)
    const outputBlob = await removeBackground(inputBlob, {
      model: 'medium',
      output: {
        format: 'image/png',
        quality: 1.0,
      },
    });

    const arrayBuffer = await outputBlob.arrayBuffer();
    const resultBase64 = Buffer.from(arrayBuffer).toString('base64');

    res.json({
      success: true,
      cutoutBase64: `data:image/png;base64,${resultBase64}`,
      model: 'ML-ISNet-Portrait-v1',
    });
  } catch (error: any) {
    console.error('ML Background Removal Service Error:', error);
    res.status(500).json({
      error: error.message || 'Machine learning background removal failed',
    });
  }
});

// Pre-warm the ML model in the background so user requests are fast
setTimeout(async () => {
  try {
    const tinyBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC';
    const testBlob = new Blob([Buffer.from(tinyBase64, 'base64')], { type: 'image/png' });
    await removeBackground(testBlob);
    console.log('ML Background Removal neural network pre-warmed and ready.');
  } catch (err) {
    console.warn('Pre-warming notice:', err);
  }
}, 2000);

// Analyze portrait & recommend professional studio corrections
app.post('/api/ai/analyze-face', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `You are a professional passport photo studio expert. Analyze this portrait photo for official passport / stamp print preparation.
Evaluate:
1. Face brightness and lighting balance
2. Skin tone and roughness/blemish level needing smoothing
3. Framing compliance (head size, eye level for passport standard)
Return ONLY a valid JSON object matching this schema:
{
  "recommendedBrightness": number between -20 and 50 (positive if face is dark/shadowy, default around 15 for fair studio look),
  "recommendedSmoothing": number between 15 and 80 (skin smoothing level to clean blemishes while preserving eyes/mouth),
  "recommendedContrast": number between -10 and 25,
  "recommendedWarmth": number between -10 and 15,
  "sharpness": number between 10 and 40,
  "studioAdviceBn": "A short 1-2 sentence Bengali recommendation for best passport print result",
  "studioAdviceEn": "A short 1-2 sentence English recommendation"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = {
        recommendedBrightness: 18,
        recommendedSmoothing: 45,
        recommendedContrast: 8,
        recommendedWarmth: 4,
        sharpness: 20,
        studioAdviceBn: "ছবিতে স্টুডিও লাইটিং ও ফর্সা স্কিন টোন প্রয়োগ করা হয়েছে।",
        studioAdviceEn: "Studio lighting and skin smoothing applied for optimal print quality.",
      };
    }

    res.json(data);
  } catch (error: any) {
    console.error('Face analysis error:', error);
    // Return sensible studio defaults so user experience is never blocked
    res.json({
      recommendedBrightness: 16,
      recommendedSmoothing: 40,
      recommendedContrast: 6,
      recommendedWarmth: 3,
      sharpness: 20,
      studioAdviceBn: "স্টুডিও স্ট্যান্ডার্ড অনুযায়ী ফটো অটো অ্যাডজাস্ট করা হয়েছে।",
      studioAdviceEn: "Adjusted to studio standards.",
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', studio: 'StudioMaster Pro' });
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
