import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AutoHunt — Find. Import. Drive.";

export default async function OpenGraphImage() {
  const hero = await readFile(path.join(process.cwd(), "public/images/site/hero.jpg"));
  const src = `data:image/jpeg;base64,${hero.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#07080a" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" width={1200} height={750} style={{ position: "absolute", left: 180, top: -40, width: 1200, height: 750, objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(90deg, #07080a 30%, rgba(7,8,10,0.2) 100%)" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px", color: "#f5f6f7" }}>
          <div style={{ fontSize: 34, fontWeight: 700, display: "flex" }}>
            Auto<span style={{ color: "#5fd4f4" }}>Hunt</span>
          </div>
          <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -3, lineHeight: 1, marginTop: 40, display: "flex", flexDirection: "column" }}>
            <span>Find.</span>
            <span style={{ color: "#5fd4f4" }}>Import.</span>
            <span>Drive.</span>
          </div>
          <div style={{ fontSize: 28, color: "#a1a8b3", marginTop: 36, display: "flex" }}>See the real cost in Armenia.</div>
        </div>
      </div>
    ),
    size,
  );
}
