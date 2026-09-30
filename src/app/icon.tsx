import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d0f12", borderRadius: 16, border: "2px solid #3fb3d9" }}>
        <svg width="40" height="40" viewBox="0 0 32 32">
          <path d="M8 25 L16 7 L24 25" fill="none" stroke="#F5F6F7" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11.2 18.5 H20.8" stroke="#5fd4f4" strokeWidth="3.2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size,
  );
}
