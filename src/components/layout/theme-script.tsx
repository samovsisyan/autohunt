export type Theme = "light" | "dark";

export const STORAGE_KEY = "ah_theme";
export const themeColors: Record<Theme, string> = { dark: "#07080a", light: "#f4f5f7" };

/**
 * Runs synchronously in <head> before first paint: saved choice, else the OS preference.
 * The server always renders data-theme="dark", so <html> needs suppressHydrationWarning.
 */
const themeScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function ThemeScript() {
  return (
    <script
      // text/plain on the client so React doesn't warn about script tags (per Next's flash-prevention guide).
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  );
}
