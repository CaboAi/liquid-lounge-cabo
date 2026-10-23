"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

const PRACTICE_BETTER_SUBDOMAIN = "liquidloungecabo";
const PRACTICE_BETTER_HASH = "6aad7b494410b61195e6596f";
const PRACTICE_BETTER_THEME = "315450";
const PRACTICE_BETTER_ACCENT = "fcf6f1";

export default function PracticeBetterWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current && containerRef.current) {
      const existingIframe = containerRef.current.querySelector("iframe");
      if (existingIframe) {
        existingIframe.remove();
      }
    }
  }, []);

  const handleScriptLoad = () => {
    scriptLoadedRef.current = true;
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .better-inline-booking-widget {
              position: relative;
              overflow: hidden;
            }
            .better-inline-booking-widget iframe {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            }
          `,
        }}
      />
      <div
        ref={containerRef}
        className="better-inline-booking-widget mx-auto w-full rounded-2xl bg-white shadow-card"
        data-url={`https://${PRACTICE_BETTER_SUBDOMAIN}.practicebetter.io`}
        data-hash={PRACTICE_BETTER_HASH}
        data-theme={PRACTICE_BETTER_THEME}
        data-theme-accent={PRACTICE_BETTER_ACCENT}
        style={{
          width: "100%",
          maxWidth: "600px",
          height: "750px",
        }}
      />
      <Script
        src="https://cdn.practicebetter.io/assets/js/booking.widget.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
    </>
  );
}
