"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export const VIEWPORTS = [
  {
    id: "desktop",
    label: "Desktop",
    width: "100%",
    frameWidth: null,
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    id: "tablet",
    label: "Tablet",
    width: "768px",
    frameWidth: 768,
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <circle cx="12" cy="18" r="1" />
      </svg>
    ),
  },
  {
    id: "mobile",
    label: "Mobile",
    width: "390px",
    frameWidth: 390,
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <circle cx="12" cy="18" r="1" />
      </svg>
    ),
  },
];

// ─── Strip imports and exports, expose React globals ─────────────────────────
function prepareCode(raw) {
  return (
    raw
      // Remove all import lines (handles multi-line imports too)
      .replace(/^import\s[\s\S]*?from\s+['"][^'"]+['"];?\s*/gm, "")
      .replace(/^import\s+['"][^'"]+['"];?\s*/gm, "")
      // Remove export default — Babel will handle the component name
      .replace(/^export\s+default\s+/gm, "var __DefaultExport = ")
      // Remove named exports
      .replace(/^export\s+(const|let|var|function|class)\s+/gm, "$1 ")
      .trim()
  );
}

function buildHTML(code, isDark) {
  const prepared = prepareCode(code);
  const isVue = code.includes("<template>") && code.includes("<script");

  if (isVue) return buildVueHTML(prepared, isDark);
  return buildReactHTML(prepared, isDark);
}

function buildReactHTML(code, isDark) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  <!-- Tailwind -->
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    if (window.tailwind) {
      tailwind.config = { darkMode: 'class', theme: { extend: {} } }
    }
  <\/script>

  <!-- React 18 -->
  <script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>

  <!-- Babel (JSX transform) -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>

  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      min-height: 100vh;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      background: ${isDark ? "#0d0d18" : "#ffffff"};
      color: ${isDark ? "#eeeef5" : "#111827"};
    }
    #root { width: 100%; }
    #__error {
      display: none;
      margin: 16px;
      padding: 14px 16px;
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 10px;
      font-family: monospace;
      font-size: 12px;
      color: #ef4444;
      white-space: pre-wrap;
      line-height: 1.6;
    }
  </style>
</head>
<body class="${isDark ? "dark" : ""}">
  <div id="root"></div>
  <div id="__error"></div>

  <script type="text/babel">
    // ── Make React hooks available as globals so the component code
    //    doesn't need import statements ──────────────────────────────
    const {
      useState, useEffect, useRef, useCallback, useMemo,
      useContext, useReducer, useLayoutEffect, useId,
      createContext, forwardRef, Fragment,
    } = React;

    // ── Injected component ────────────────────────────────────────
    ${code}

    // ── Mount ─────────────────────────────────────────────────────
    try {
      // Find what to render — we replaced "export default X" with "var __DefaultExport = X"
      const Component = typeof __DefaultExport !== 'undefined'
        ? __DefaultExport
        : (() => {
            // Fallback: scan for any capitalised function/class/const
            const names = ['App','Component','Page','Home','Root','Main','Layout','Card','Button','Hero','Form','Nav','Header','Sidebar','Dashboard','Widget']
            for (const n of names) {
              try { if (typeof eval(n) === 'function') return eval(n) } catch(e) {}
            }
            return null
          })()

      if (!Component) {
        throw new Error('No renderable component found.\\n\\nMake sure your component uses "export default".')
      }

      const root = ReactDOM.createRoot(document.getElementById('root'))
      root.render(React.createElement(Component))
    } catch (err) {
      const box = document.getElementById('__error')
      box.style.display = 'block'
      box.textContent = '⚠ Preview error:\\n' + (err.message || String(err))
    }
  <\/script>

  <script>
    // Bubble runtime errors to parent
    window.addEventListener('error', (e) => {
      const box = document.getElementById('__error')
      if (box) { box.style.display = 'block'; box.textContent = '⚠ Runtime error:\\n' + e.message }
      window.parent.postMessage({ type: 'preview-error', message: e.message }, '*')
    })
    window.addEventListener('unhandledrejection', (e) => {
      const msg = e.reason?.message || String(e.reason)
      const box = document.getElementById('__error')
      if (box) { box.style.display = 'block'; box.textContent = '⚠ Async error:\\n' + msg }
      window.parent.postMessage({ type: 'preview-error', message: msg }, '*')
    })
    window.parent.postMessage({ type: 'preview-ready' }, '*')
  <\/script>
</body>
</html>`;
}

function buildVueHTML(code, isDark) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin:0; padding:16px; min-height:100vh; font-family:ui-sans-serif,system-ui,sans-serif; background:${isDark ? "#0d0d18" : "#ffffff"}; color:${isDark ? "#eeeef5" : "#111827"}; }
  </style>
</head>
<body class="${isDark ? "dark" : ""}">
  <div id="app"></div>
  <script>
    const src = ${JSON.stringify(code)};
    const templateMatch = src.match(/<template>([\s\S]*?)<\/template>/)
    const scriptMatch   = src.match(/<script[^>]*>([\s\S]*?)<\/script>/)
    const styleMatch    = src.match(/<style[^>]*>([\s\S]*?)<\/style>/)

    if (styleMatch) {
      const s = document.createElement('style')
      s.textContent = styleMatch[1]
      document.head.appendChild(s)
    }

    const template = templateMatch ? templateMatch[1].trim() : '<div>No template found</div>'
    let compOptions = { template, setup: () => ({}) }

    if (scriptMatch) {
      try {
        let scriptBody = scriptMatch[1]
          .replace(/import[^;]+from[^;]+;/g, '')
          .replace(/export\s+default\s+defineComponent\s*\(/, 'compOptions = Vue.defineComponent(')
          .replace(/export\s+default\s*\{/, 'compOptions = {')
        compOptions.template = template
        eval(scriptBody)
      } catch(e) { console.warn('Vue parse error', e) }
    }

    Vue.createApp(compOptions).mount('#app')
  <\/script>
</body>
</html>`;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LivePreview({ code, viewport, isDark }) {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const [state, setState] = useState("idle"); // idle | loading | ready | error
  const [errorMsg, setErrorMsg] = useState(null);
  const [scale, setScale] = useState(1);

  const currentViewport =
    VIEWPORTS.find((v) => v.id === viewport) || VIEWPORTS[0];

  const inject = useCallback(
    (src) => {
      const iframe = iframeRef.current;
      if (!iframe || !src) return;
      setState("loading");
      setErrorMsg(null);
      const html = buildHTML(src, isDark);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      iframe.src = url;
      iframe.onload = () => URL.revokeObjectURL(url);
    },
    [isDark],
  );

  // Debounced inject when code changes
  useEffect(() => {
    if (!code) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => inject(code), 600);
    return () => clearTimeout(debounceRef.current);
  }, [code, inject]);

  // Re-inject when theme changes
  useEffect(() => {
    if (code) inject(code);
  }, [isDark]); // eslint-disable-line

  // Listen for iframe messages
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "preview-ready") setState("ready");
      if (e.data?.type === "preview-error") {
        setState("error");
        setErrorMsg(e.data.message);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Scale when viewport frame is wider than container
  useEffect(() => {
    if (!containerRef.current || !currentViewport.frameWidth) {
      setScale(1);
      return;
    }
    const ro = new ResizeObserver(([entry]) => {
      const cw = entry.contentRect.width;
      const fw = currentViewport.frameWidth;
      setScale(fw > cw ? cw / fw : 1);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [currentViewport]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "auto",
        background: "var(--bg-secondary)",
        position: "relative",
      }}
    >
      {/* Loading overlay */}
      {state === "loading" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(8,8,16,0.55)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 20px",
              borderRadius: "10px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ animation: "spin 0.8s linear infinite" }}
            >
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              Rendering preview…
            </span>
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Error banner */}
      {state === "error" && errorMsg && (
        <div
          style={{
            width: "100%",
            padding: "10px 16px",
            background: "rgba(239,68,68,0.06)",
            borderBottom: "1px solid rgba(239,68,68,0.2)",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--error)"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ flexShrink: 0, marginTop: "1px" }}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--error)",
              lineHeight: "1.5",
            }}
          >
            {errorMsg}
          </span>
        </div>
      )}

      {/* Device frame */}
      <div
        style={{
          padding: "16px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <div
          style={{
            width: currentViewport.frameWidth
              ? `${currentViewport.frameWidth}px`
              : "100%",
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            flex: currentViewport.id === "desktop" ? 1 : "none",
            minHeight: currentViewport.id !== "desktop" ? "600px" : "0",
            borderRadius: currentViewport.id === "desktop" ? "10px" : "20px",
            overflow: "hidden",
            border: "1px solid var(--border-default)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            transformOrigin: "top center",
            transform: `scale(${scale})`,
            transition: "width 0.3s ease, border-radius 0.3s ease",
            background: isDark ? "#0d0d18" : "#ffffff",
          }}
        >
          {/* Browser chrome */}
          <div
            style={{
              height: "36px",
              flexShrink: 0,
              background: "var(--bg-card)",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", gap: "5px" }}>
              {["#f87171", "#fbbf24", "#34d399"].map((c) => (
                <div
                  key={c}
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: c,
                    opacity: 0.8,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                flex: 1,
                height: "20px",
                borderRadius: "5px",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                padding: "0 8px",
                gap: "5px",
              }}
            >
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "var(--success)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  color: "var(--text-muted)",
                }}
              >
                localhost:3000 · preview
              </span>
            </div>
          </div>

          {/* Iframe */}
          <iframe
            ref={iframeRef}
            title="Component Preview"
            sandbox="allow-scripts allow-same-origin"
            style={{
              flex: 1,
              width: "100%",
              border: "none",
              minHeight: currentViewport.id !== "desktop" ? "560px" : "0",
              background: "transparent",
            }}
          />
        </div>
      </div>
    </div>
  );
}
