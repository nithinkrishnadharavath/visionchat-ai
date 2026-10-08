# VisionChat AI

A portfolio-ready AI Vision Chatbot built with React, Vite, Vercel Serverless Functions and Google's Gemini API.

## Features
- Upload an image
- Ask natural-language questions about the image
- AI visual understanding
- Chat-style interface
- Responsive design
- API key kept on the server through an environment variable

## Run locally

```bash
npm install
npm run dev
```

For the AI API, create a Gemini API key and set:

```bash
GEMINI_API_KEY=your_key_here
```

When using Vercel, add `GEMINI_API_KEY` under Project Settings → Environment Variables.

## Deploy

Push this folder to GitHub and import the repository into Vercel. Vercel automatically deploys Git repositories and provides a production URL.

Do not put your Gemini API key inside frontend JavaScript.
