const menu = document.getElementById('menu');
const list = document.getElementById('story-list');
const game = document.getElementById('game');
const entries = document.getElementById('entries');
const titleEl = document.getElementById('story-title');
const actionInput = document.getElementById('action');

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function loadStories() {
  list.innerHTML = '';
  const stories = await fetchJSON('/api/stories');
  stories.forEach(({ id, title }) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = title;
    btn.onclick = () => openStory(id, title);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

async function createStory() {
  const prompt = document.getElementById('new-prompt').value;
  const title = document.getElementById('new-title').value;
  if (!prompt) return alert('Please enter a prompt');
  const { id, text, image } = await fetchJSON('/api/story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, title })
  });
  showStory(id, title || 'Untitled', [{ role: 'model', content: text }], [image]);
}

async function openStory(id, title) {
  const data = await fetchJSON(`/api/story/${id}`);
  showStory(id, data.title, data.history.filter(m => m.role !== 'system'), data.images);
}

function showStory(id, title, history, images) {
  menu.style.display = 'none';
  game.style.display = 'block';
  titleEl.textContent = title;
  game.dataset.id = id;
  entries.innerHTML = '';
  history.forEach((msg, idx) => {
    const div = document.createElement('div');
    div.className = msg.role;
    div.textContent = msg.content;
    entries.appendChild(div);
    if (msg.role === 'model' && images[idx]) {
      const img = document.createElement('img');
      img.src = images[idx];
      entries.appendChild(img);
    }
  });
}

async function sendAction() {
  const id = game.dataset.id;
  const action = actionInput.value;
  if (!action) return;
  const { text, image } = await fetchJSON(`/api/story/${id}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  });
  const userDiv = document.createElement('div');
  userDiv.className = 'user';
  userDiv.textContent = action;
  entries.appendChild(userDiv);
  const modelDiv = document.createElement('div');
  modelDiv.className = 'model';
  modelDiv.textContent = text;
  entries.appendChild(modelDiv);
  const img = document.createElement('img');
  img.src = image;
  entries.appendChild(img);
  actionInput.value = '';
  entries.scrollTop = entries.scrollHeight;
}

document.getElementById('create-story').onclick = createStory;
document.getElementById('send-action').onclick = sendAction;
document.getElementById('back').onclick = () => {
  game.style.display = 'none';
  menu.style.display = 'block';
  loadStories();
};

loadStories();
