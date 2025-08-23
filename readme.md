# Interactive Story Game Backend

Simple Express server demonstrating endpoints for an AI-powered text adventure.

## Setup

```bash
npm install
```

Set environment variables `GEMINI_API_KEY` and optionally `IMAGEN_API_KEY`.

## Run

```bash
npm start
```

## API Endpoints

- `POST /api/story` `{ prompt, title? }`
- `POST /api/story/:id/action` `{ action }`
- `GET /api/stories`
- `GET /api/story/:id`

`npm test` currently only prints a placeholder message.
