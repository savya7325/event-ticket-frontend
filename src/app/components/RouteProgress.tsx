"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Slim top progress bar for page changes.
// The App Router has no navigation events, so we start on link clicks and on
// non-prefetch RSC fetches (covers router.push), and finish when the URL changes.
export default function RouteProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<{ show?: number; tick?: number; safety?: number }>({});
  const running = useRef(false);

  const clearTimers = () => {
    window.clearTimeout(timers.current.show);
    window.clearInterval(timers.current.tick);
    window.clearTimeout(timers.current.safety);
  };

  const start = () => {
    if (running.current) return;
    running.current = true;
    clearTimers();
    setProgress(8);
    // Only show for navigations that take noticeable time.
    timers.current.show = window.setTimeout(() => setVisible(true), 120);
    timers.current.tick = window.setInterval(() => {
      setProgress(p => (p < 85 ? p + (90 - p) * 0.08 : p));
    }, 200);
    timers.current.safety = window.setTimeout(done, 12000);
  };

  const done = () => {
    if (!running.current) return;
    running.current = false;
    clearTimers();
    setProgress(100);
    window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  };

  // Finish whenever the route changes.
  useEffect(() => {
    done();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      start();
    };

    // router.push() fetches the next page's RSC payload; prefetches are marked and ignored.
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
      const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
      if (headers.get("RSC") === "1" && !headers.get("Next-Router-Prefetch")) start();
      return originalFetch.call(this, input, init);
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", start);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", start);
      window.fetch = originalFetch;
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 2000,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity .3s ease",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #8b5cf6, #ec4899, #fcd34d)",
          boxShadow: "0 0 12px rgba(167,139,250,0.8)",
          transition: "width .2s ease",
          borderRadius: "0 3px 3px 0",
        }}
      />
    </div>
  );
}
