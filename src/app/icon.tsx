import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: 19,
            fontWeight: 300,
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.5px",
            marginTop: 1,
          }}
        >
          H
        </span>
      </div>
    ),
    { ...size }
  );
}
