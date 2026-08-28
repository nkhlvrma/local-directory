import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #7c2d12 0%, #c2410c 55%, #ea580c 100%)",
          color: "#fff7ed",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 36, opacity: 0.85, marginBottom: 24 }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 950 }}>
          Verified local businesses on WhatsApp
        </div>
        <div style={{ fontSize: 30, opacity: 0.85, marginTop: 28, maxWidth: 850 }}>
          Chat directly with neighborhood shops and services. No forms, no spam calls.
        </div>
      </div>
    ),
    { ...size },
  );
}
