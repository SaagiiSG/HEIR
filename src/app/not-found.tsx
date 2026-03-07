import Link from "next/link";

export default function RootNotFound() {
  return (
    <html>
      <body style={{ fontFamily: "sans-serif", color: "#000", textAlign: "center", padding: "120px 20px" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#999", marginBottom: "16px" }}>
          404
        </p>
        <h1 style={{ fontSize: "28px", fontWeight: "normal", marginBottom: "12px" }}>Page Not Found</h1>
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "40px" }}>
          The page you are looking for does not exist.
        </p>
        <Link
          href="/mn"
          style={{
            display: "inline-block",
            border: "1px solid #000",
            borderRadius: "99px",
            padding: "10px 24px",
            fontSize: "12px",
            textDecoration: "none",
            color: "#000",
          }}
        >
          Back to Home
        </Link>
      </body>
    </html>
  );
}
