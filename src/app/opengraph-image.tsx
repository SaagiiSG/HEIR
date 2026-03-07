import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HEIR — Mongolian Men's Fashion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <p style={{ color: "#fff", fontSize: 80, letterSpacing: "0.15em", margin: 0 }}>
          HEIR
        </p>
        <p style={{ color: "#666", fontSize: 20, letterSpacing: "0.1em", marginTop: 16 }}>
          MONGOLIAN MEN&apos;S FASHION
        </p>
      </div>
    ),
    { ...size }
  );
}
