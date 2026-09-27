const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID;

export default async function handler(req, res) {
  // 1. التحقق من الرابط (Verification)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === 'ahmed_secret_token_123') {
        res.status(200).send(challenge);
        return;
      }
    }
    res.status(200).send('البوت شغال!');
  }

  // 2. استقبال الرسائل والرد عليها بالذكاء الاصطناعي
  if (req.method === 'POST') {
    const body = req.body;
    
    if (body.object === 'instagram' && body.entry && body.entry[0].messaging) {
      const messagingEvent = body.entry[0].messaging[0];
      
      // التأكد أن الرسالة ليست من البوت نفسه
      if (messagingEvent.message && !messagingEvent.message.is_echo) {
        const senderId = messagingEvent.sender.id;
        const messageText = messagingEvent.message.text;

        if (messageText) {
          try {
            // إرسال الرسالة إلى Gemini
            const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: messageText }] }]
              })
            });

            const geminiData = await geminiResponse.json();
            const replyText = geminiData.candidates[0].content.parts[0].text;

            // إرسال الرد إلى إنستغرام
            await fetch(`https://graph.facebook.com/v19.0/${INSTAGRAM_ACCOUNT_ID}/messages?access_token=${INSTAGRAM_ACCESS_TOKEN}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                recipient: { id: senderId },
                message: { text: replyText }
              })
            });

          } catch (error) {
            console.error('Error:', error);
          }
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  }
}
