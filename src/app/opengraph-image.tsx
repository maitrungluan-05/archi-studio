import { ImageResponse } from "next/og";

export const alt = "ARCHI Digital Copyright Archive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#181818", color: "#fff", padding: 72, alignItems: "flex-end", justifyContent: "space-between", fontFamily: "Arial" }}>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
        <div style={{ display: "flex", color: "#d4a574", fontSize: 22, textTransform: "uppercase" }}>Official Digital Archive / Est. 2015</div>
        <div style={{ display: "flex", marginTop: 22, fontSize: 76, fontWeight: 700 }}>Original works. Clear provenance.</div>
        <div style={{ display: "flex", marginTop: 24, color: "#b9b9b9", fontSize: 28 }}>Photography and film preserved with verified ownership.</div>
      </div>
      <div style={{ display: "flex", width: 176, height: 176, border: "3px solid #c4622d", borderRadius: 18, alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", width: 98, height: 98, border: "16px solid #c4622d", borderRadius: 999, alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 26, fontWeight: 700 }}>A</div>
      </div>
    </div>,
    size
  );
}
