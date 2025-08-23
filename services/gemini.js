const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
let model;

if (apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

async function generate(messages) {
  if (!model) {
    return '[Gemini API key missing]';
  }
  const result = await model.generateContent(messages);
  return result.response.text();
}

module.exports = { generate };
