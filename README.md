# ⚡ design.code

> **Turn any UI screenshot into clean React + Tailwind code — instantly.**  
> Powered by Claude Vision AI with real-time streaming output.

<!-- Replace the line below with your actual screenshot once you have it -->
<!-- ![design.code app screenshot](./public/screenshot.png) -->

---

## ✨ What It Does

Drag in a screenshot of any UI — a website, Figma frame, mobile app, or hand-drawn sketch — and **design.code** generates production-ready React component code in seconds. Watch it stream in token by token, edit it live in a full VS Code editor, then preview the rendered component right inside the app.

No more manually translating designs into code. Just drop and generate.

---

## 🎬 Demo

| Upload a design | Code streams live | Preview the component |
|---|---|---|
| Drop any PNG/JPG/WebP screenshot | Claude Vision generates React + Tailwind code token by token | Renders in a live sandboxed iframe with Desktop / Tablet / Mobile viewports |

---

## 🚀 Features

### Input
- 📂 **Drag & drop** upload zone with animated border and file validation
- 🖼️ **Image preview** with zoom lightbox, dimensions, file size display
- 🔄 **Remove / Replace** uploaded image without page reload

### Generation
- 🤖 **Claude Vision AI** analyzes layout, colors, spacing, and typography
- ⚡ **Real-time streaming** — code appears token by token as Claude types
- ⚙️ **Framework picker** — React, Next.js 14 (App Router), or Vue 3
- 🎨 **Styling picker** — Tailwind CSS, CSS Modules, or Styled Components
- 📝 **Extra instructions** — tell Claude to add dark mode, animations, accessibility, and more
- ✕ **Cancel** streaming mid-generation at any time

### Code Editor
- 💻 **Monaco Editor** — the exact engine that powers VS Code, in your browser
- 🎨 **Custom dark theme** with syntax highlighting tuned to the app's color system
- 📖 **Read-only while streaming**, fully editable once done
- 📋 **Copy to clipboard** with toast notification
- 📥 **Download** as `.jsx` or `.vue` file

### Live Preview
- 📺 **Live iframe renderer** — React 18 + Babel + Tailwind CDN, no build step
- 🖥️📱 **Viewport modes** — Desktop, Tablet (768px), Mobile (390px)
- 🔁 **Auto-refresh** when you edit code in Monaco
- 🌙 **Theme-aware** — preview respects your dark/light mode toggle

### UI Polish
- 🌙 **Dark / Light mode** — persisted across sessions
- 🎞️ **Framer Motion animations** — staggered panel entrance, cross-fade transitions
- ↔️ **Draggable split divider** — resize the layout to your preference
- 🌌 **Animated ambient background** — slow drifting gradient orbs

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| AI | Anthropic Claude (claude-sonnet-4) — Vision + Streaming |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| Animations | Framer Motion |
| Styling | Tailwind CSS |
| Theme | next-themes |
| Toasts | react-hot-toast |
| Preview | Babel Standalone + React 18 CDN inside sandboxed iframe |
| Deploy | Vercel (Edge Runtime) |

---

## 📦 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/design-code.git
cd design-code
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your API key

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Then open `.env.local` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get a key at [console.anthropic.com](https://console.anthropic.com).

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
design-code/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.js          # Edge API route — Claude Vision + streaming
│   ├── globals.css               # Design tokens, fonts, custom scrollbar
│   ├── layout.js                 # Root layout with ThemeProvider + Toaster
│   └── page.js                   # Main page — wires all panels together
│
├── components/
│   ├── Header.jsx                # Nav bar with logo, theme toggle, live indicator
│   ├── SplitLayout.jsx           # Draggable two-panel layout shell
│   ├── UploadZone.jsx            # Drag & drop upload with validation
│   ├── ImagePreview.jsx          # Preview card with zoom lightbox
│   ├── OptionsPanel.jsx          # Framework/styling picker + Generate CTA
│   ├── OutputPanel.jsx           # Right panel — orchestrates all output states
│   ├── MonacoEditor.jsx          # VS Code editor wrapper with custom theme
│   ├── TabSwitcher.jsx           # Code / Preview tab toggle
│   ├── ActionToolbar.jsx         # Copy + Download buttons with toasts
│   ├── LivePreview.jsx           # Sandboxed iframe renderer
│   ├── ViewportToolbar.jsx       # Desktop / Tablet / Mobile toggle
│   └── ThemeProvider.jsx         # next-themes wrapper
│
├── hooks/
│   └── useCodeGeneration.js      # Streaming hook — fetch, parse NDJSON, state
│
├── .env.example                  # Environment variable template
├── next.config.mjs               # Next.js config (Turbopack + COOP header)
├── tailwind.config.js            # Tailwind with custom design tokens
└── README.md
```

---

## 🚀 Deploy to Vercel

The fastest way to ship:

```bash
# 1. Push to GitHub
git add .
git commit -m "feat: initial release"
git push origin main
```

Then:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add the environment variable in the Vercel dashboard:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-your-key-here`
4. Click **Deploy**

Done — live shareable URL in under 60 seconds. ⚡

---

## 🧠 How It Works

```
User uploads screenshot
        │
        ▼
Image converted to base64 (client-side)
        │
        ▼
POST /api/generate (Edge Runtime)
  ├── Builds prompt with framework/styling/instructions
  └── Calls Claude Vision API (claude-sonnet-4)
              │
              ▼
        Streams NDJSON events back
        { type: "delta", text: "..." }
              │
              ▼
useCodeGeneration hook reads stream
  └── Appends text to code state token by token
              │
              ▼
Monaco Editor renders code live with syntax highlighting
              │
              ▼
User clicks Preview tab
  └── LivePreview builds full HTML document as Blob URL
      ├── Loads React 18 + Babel + Tailwind from CDN
      ├── Transforms JSX in-browser
      └── Mounts component in sandboxed iframe
```

---

## ⚙️ Configuration

### Supported Frameworks
| Option | Output |
|---|---|
| React | Functional component with hooks, `.jsx` |
| Next.js | App Router ready, `"use client"` where needed, `.jsx` |
| Vue 3 | Composition API with `<script setup>`, `.vue` |

### Supported Styling
| Option | Output |
|---|---|
| Tailwind CSS | Utility classes, responsive variants |
| CSS Modules | `styles.module.css` companion file |
| Styled Components | `styled-components` with theme support |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push and open a Pull Request

---

## 📄 License

MIT — use it, ship it, build on it.

---

<div align="center">
  <p>Built with ❤️ using <a href="https://anthropic.com">Claude AI</a> · <a href="https://nextjs.org">Next.js</a> · <a href="https://ui.shadcn.com">Tailwind CSS</a></p>
  <p>
    <a href="https://github.com/yourusername/design-code">GitHub</a> ·
    <a href="https://console.anthropic.com">Get API Key</a> ·
    <a href="https://vercel.com/new">Deploy</a>
  </p>
</div>