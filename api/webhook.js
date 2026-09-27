export default function handler(req, res) {
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
  }
  
  res.status(200).send('البوت شغال!');
}
