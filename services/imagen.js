async function generateImage(prompt) {
  if (!process.env.IMAGEN_API_KEY) {
    // Placeholder image
    return `https://placehold.co/600x400?text=${encodeURIComponent(prompt.slice(0,40))}`;
  }
  // TODO: integrate Google Imagen API when available
  return null;
}

module.exports = { generateImage };
