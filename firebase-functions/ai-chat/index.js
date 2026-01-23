// Firebase Cloud Function for AI Chat
// Deploy with: firebase deploy --only functions:aiChat

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Allowed origins for CORS - restrict to your domains
const ALLOWED_ORIGINS = [
  'https://cityhealth-ec7e7.web.app',
  'https://cityhealth-ec7e7.firebaseapp.com',
  // Add your production domain here
];

// Rate limiting: track requests per user (in-memory, resets on cold start)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function isRateLimited(userId) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(userId) || [];
  
  // Clean old requests
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW_MS);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(userId, recentRequests);
  return false;
}

exports.aiChat = functions.https.onRequest(async (req, res) => {
  const origin = req.headers.origin;
  
  // CORS - restrict to allowed origins (allow localhost for development)
  if (origin && (ALLOWED_ORIGINS.includes(origin) || origin.includes('localhost') || origin.includes('lovableproject.com') || origin.includes('lovable.app'))) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    // Verify Firebase Auth token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization header' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (authError) {
      console.error('Token verification failed:', authError.message);
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
      return;
    }

    const userId = decodedToken.uid;

    // Rate limiting per user
    if (isRateLimited(userId)) {
      res.status(429).json({ error: 'Too many requests. Please wait a moment before trying again.' });
      return;
    }

    // Validate request body
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Invalid request: messages array required' });
      return;
    }

    // Validate messages structure
    if (messages.length > 50) {
      res.status(400).json({ error: 'Too many messages in conversation' });
      return;
    }

    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        res.status(400).json({ error: 'Invalid message format: role and content required' });
        return;
      }
      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        res.status(400).json({ error: 'Invalid message role' });
        return;
      }
      if (typeof msg.content !== 'string' || msg.content.length > 10000) {
        res.status(400).json({ error: 'Invalid message content' });
        return;
      }
    }

    // TODO: Integrate with your preferred AI service (OpenAI, Anthropic, etc.)
    // Example with OpenAI:
    /*
    const openaiApiKey = functions.config().openai.key;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        stream: true
      })
    });

    // Stream the response back
    response.body.pipe(res);
    */

    // Placeholder response for now
    res.status(200).send('data: {"choices":[{"delta":{"content":"AI chat function needs to be implemented with your AI service API."}}]}\n\ndata: [DONE]\n\n');
    
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
