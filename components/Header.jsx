"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export default function Header({
  historyCount = 0,
  onOpenHistory,
  historyOpen,
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const isDark = theme === "dark";

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: scrolled ? "rgba(8,8,16,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--border-subtle)"
          : "1px solid transparent",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Logo */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "9px",
            background:
              "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 18px rgba(124,106,255,0.45)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 4h5v2H2V4zm0 3h5v2H2V7zm0 3h5v2H2v-2z"
              fill="white"
              opacity="0.9"
            />
            <rect
              x="9"
              y="4"
              width="5"
              height="8"
              rx="1"
              fill="white"
              opacity="0.45"
            />
            <circle cx="11.5" cy="12.5" r="2.5" fill="white" />
            <path
              d="M11.5 11.5v2M10.5 12.5h2"
              stroke="#7c6aff"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "16px",
              color: "var(--text-primary)",
              letterSpacing: "-0.3px",
            }}
          >
            design
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "16px",
              background:
                "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.3px",
            }}
          >
            .code
          </span>
        </div>
        <motion.span
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.4, type: "spring" }}
          style={{
            fontSize: "9px",
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            color: "var(--accent-primary)",
            background: "rgba(124,106,255,0.1)",
            border: "1px solid rgba(124,106,255,0.2)",
            padding: "2px 7px",
            borderRadius: "99px",
          }}
        >
          beta
        </motion.span>
      </motion.div>

      {/* Centre tagline */}
      <motion.div
        className="hidden md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.38 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "7px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-secondary)",
          }}
        >
          screenshot
        </span>
        <svg width="32" height="10" viewBox="0 0 32 10" fill="none">
          <path
            d="M0 5h28M24 1l4 4-4 4"
            stroke="var(--accent-primary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-secondary)",
          }}
        >
          react code
        </span>
      </motion.div>

      {/* Right controls */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.45 }}
        style={{ display: "flex", alignItems: "center", gap: "8px" }}
      >
        {/* History toggle */}
        {onOpenHistory && (
          <motion.button
            onClick={onOpenHistory}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.92 }}
            title={historyOpen ? "Close history" : "Open history"}
            style={{
              ...navBtn,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              color: historyOpen
                ? "var(--accent-primary)"
                : "var(--text-secondary)",
              background: historyOpen
                ? "rgba(124,106,255,0.1)"
                : "var(--bg-card)",
              borderColor: historyOpen
                ? "rgba(124,106,255,0.3)"
                : "var(--border-default)",
              paddingLeft: "10px",
              paddingRight: historyCount > 0 ? "8px" : "10px",
              width: "auto",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {historyCount > 0 && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  fontWeight: 700,
                  color: historyOpen
                    ? "var(--accent-primary)"
                    : "var(--text-muted)",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-subtle)",
                  padding: "1px 5px",
                  borderRadius: "99px",
                }}
              >
                {historyCount}
              </span>
            )}
          </motion.button>
        )}

        {/* GitHub */}
        <motion.a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.92 }}
          style={{
            ...navBtn,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
        </motion.a>

        {/* Theme toggle */}
        {mounted && (
          <motion.button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.88, rotate: 20 }}
            style={{
              ...navBtn,
              cursor: "pointer",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
            }}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.span
                  key="sun"
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.22 }}
                  style={{ display: "flex" }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                  </svg>
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.22 }}
                  style={{ display: "flex" }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}

        <div
          style={{
            width: "1px",
            height: "20px",
            background: "var(--border-subtle)",
          }}
        />

        {/* Live status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 10px",
            borderRadius: "9px",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-card)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--success)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--text-secondary)",
              letterSpacing: "0.3px",
            }}
          >
            Claude Vision
          </span>
        </motion.div>
      </motion.div>
    </motion.header>
  );
}

const navBtn = {
  width: "34px",
  height: "34px",
  borderRadius: "9px",
  border: "1px solid var(--border-default)",
  background: "var(--bg-card)",
};
