# ChatOSS

**ChatOSS** is an open-source AI chatbot platform that lets users chat with various models, organize conversations, and explore multiple response paths — all within a clean, extensible interface powered by [Convex](https://www.convex.dev/).

---

## 🚀 Features

- 💬 **Multi-model chat** – Talk to any AI model you configure
- 🔀 **Branching chats** – Fork any message to explore alternate responses
- ♻️ **Resend prompts** – Retry prompts with different models
- 🗂️ **Folder system** – Organize your chats like files
- 🔍 **Filter by model capabilities** – Search by cost, features, and more
- 🖼️ **Image uploads** – Send images to supported models
- 🔑 **Bring your own API key** – Use your own [OpenRouter](https://openrouter.ai) key
- 🔐 **Google Auth** – Sign in with Google
- 🧠 **Real-time backend** – Built on Convex
- ⚡ **TypeScript-first** – Fully typed, modern codebase

---

## 📦 Tech Stack

- **Frontend**: React + Next.js + TypeScript
- **Backend**: [Convex](https://www.convex.dev/)
- **Auth**: Google OAuth via Convex Auth
- **AI Integration**: [OpenRouter](https://openrouter.ai)

---

## 🛠️ Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/HakobChalikyan/chatoss.git
cd chatoss
npm install
````

---

### 2. Convex Setup

To set up the Convex backend:

```bash
npm run dev
```
You'll be prompted to:

* Create a new project
* Choose between cloud or local deployment (recommend **cloud**)

After setup, the Convex dashboard will be launched.

---

### 3. Environment Variables

Convex uses cloud environment variables that can be set from the CLI or project settings dashboard.

#### Required Variables

```bash
npx convex env set AUTH_GOOGLE_ID <your-google-client-id>
npx convex env set AUTH_GOOGLE_SECRET <your-google-secret>
npx convex env set ENCRYPTION_KEY <your-encryption-key>
```

To generate a secure `ENCRYPTION_KEY`, run:

```bash
openssl rand -hex 16
```

> You don't need to add these to `.env.local`. Convex will handle them in the cloud.

---

### 4. Run the App Locally

To run both the frontend and backend together:

```bash
npm run dev
```

This command will:

* Run `next dev` for the frontend
* Run `convex dev` for the backend

---

## 🌐 Useful Links

* Project Website: *Coming soon*
* Get an OpenRouter API Key: https://openrouter.ai/settings/keys
* Convex Docs: [https://docs.convex.dev](https://docs.convex.dev)

---

## 🧑‍💻 License

[MIT](LICENSE)

---
