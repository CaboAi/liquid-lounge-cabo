"use client";

import Script from "next/script";

export default function PracticeBetterWidget() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `.better-inline-booking-widget{position:relative;overflow:hidden}.better-inline-booking-widget iframe{position:absolute;top:0;left:0;width:100%;height:100%}`,
        }}
      />
      <div
        className="better-inline-booking-widget mx-auto"
        data-url="https://my.practicebetter.io"
        data-booking-page=""
        data-hash="6aad7b494410b61195e6596f"
        data-theme="315450"
        data-theme-accent="fcf6f1"
        data-scrollbar-visible="false"
        style={{
          width: "100%",
          maxWidth: "550px",
          height: "clamp(560px, 75vh, 720px)",
        }}
      />
      <Script
        src="https://cdn.practicebetter.io/assets/js/booking.widget.js"
        strategy="afterInteractive"
      />
    </>
  );
}
