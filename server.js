const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { generate } = require('./services/gemini');
const { generateImage } = require('./services/imagen');

const app = express();
app.use(express.json());

const systemPrompt = { role: 'system', content: 'Ты — интерактивный рассказчик.' };
const stories = new Map();

app.post('/api/story', async (req, res) => {
  const { prompt, title } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }
  const id = uuidv4();
  const history = [systemPrompt, { role: 'user', content: prompt }];
  const text = await generate(history);
  history.push({ role: 'model', content: text });
  const image = await generateImage(text);
  stories.set(id, { id, title: title || 'Untitled', history, images: [image] });
  res.json({ id, text, image });
});

app.post('/api/story/:id/action', async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  const story = stories.get(id);
  if (!story) return res.status(404).json({ error: 'Story not found' });
  if (!action) return res.status(400).json({ error: 'action is required' });
  story.history.push({ role: 'user', content: action });
  const text = await generate(story.history);
  story.history.push({ role: 'model', content: text });
  const image = await generateImage(text);
  story.images.push(image);
  res.json({ text, image });
});

app.get('/api/stories', (req, res) => {
  const list = Array.from(stories.values()).map(({ id, title }) => ({ id, title }));
  res.json(list);
});

app.get('/api/story/:id', (req, res) => {
  const story = stories.get(req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });
  res.json(story);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
