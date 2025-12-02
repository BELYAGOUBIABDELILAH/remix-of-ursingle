// Firebase Cloud Function for AI Chat
// Deploy with: firebase deploy --only functions:aiChat

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.aiChat = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).send('Invalid request: messages array required');
      return;
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
    res.status(500).send('Internal Server Error');
  }
});
