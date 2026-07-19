import React from "react";
import { BodyPage } from "../templates/BodyPage";
import { StatBig } from "../primitives/StatBig";
import { SourceNote } from "../primitives/SourceNote";
import { COLORS, FONTS, SECTION_INK } from "../theme";
import { INSIDE } from "../content";

const SECTION_LABEL = "INSIDE";
const ACCENT = SECTION_INK["03_INSIDE"];

type PageProps = { parity: "recto" | "verso"; pageNumber: number; totalPages: number };
type Fact = { k: string; v: string };

const Para: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontFamily: FONTS.SANS, fontSize: 11, lineHeight: 1.5, letterSpacing: "-0.005em", color: COLORS.INK, margin: 0 }}>
    {children}
  </p>
);

const Lede: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontFamily: FONTS.SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.4, color: COLORS.INK_MUTED, margin: "0 0 16px", maxWidth: "5.9in" }}>
    {children}
  </p>
);

const HonestNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      marginTop: 16,
      borderLeft: `2px solid ${COLORS.EMERALD_400}`,
      paddingLeft: 12,
      fontFamily: FONTS.SERIF,
      fontStyle: "italic",
      fontSize: 12.5,
      lineHeight: 1.4,
      color: COLORS.INK,
    }}
  >
    {children}
  </div>
);

/** The dark app-panel fact grid — 2×2 k/v pairs on the near-black ground. */
const FactGrid: React.FC<{ facts: readonly Fact[] }> = ({ facts }) => (
  <div
    style={{
      background: COLORS.GROUND,
      borderRadius: 8,
      border: `1px solid ${COLORS.GROUND_ELEVATED}`,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      overflow: "hidden",
    }}
  >
    {facts.map((f, i) => (
      <div
        key={f.k}
        style={{
          padding: "12px 13px",
          borderRight: i % 2 === 0 ? `1px solid ${COLORS.ON_DARK_HAIRLINE}` : "none",
          borderTop: i >= 2 ? `1px solid ${COLORS.ON_DARK_HAIRLINE}` : "none",
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        <span style={{ fontFamily: FONTS.MONO, fontSize: 7.5, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.EMERALD_400 }}>
          {f.k}
        </span>
        <span style={{ fontFamily: FONTS.MONO, fontSize: 9, lineHeight: 1.35, color: COLORS.ON_DARK }}>{f.v}</span>
      </div>
    ))}
  </div>
);

const SourceRail: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", bottom: "0.68in", left: "0.75in", right: "0.75in" }}>
    <SourceNote color={COLORS.EMERALD_700}>{children}</SourceNote>
  </div>
);

// ── p15 · the dispatcher ────────────────────────────────────────────────────

export const InsideDispatchPage: React.FC<PageProps> = (p) => {
  const c = INSIDE.dispatch;
  return (
    <BodyPage {...p} sectionLabel={SECTION_LABEL} sectionColor={ACCENT} eyebrow={c.eyebrow} headline={c.headline}>
      <Lede>{c.lede}</Lede>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "0.5in", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Para>{c.body}</Para>
          {/* before → after */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <StatBig value={c.before.value} label={c.before.label} tier="metricMedium" color={COLORS.INK} />
            <span style={{ fontFamily: FONTS.MONO, fontSize: 22, color: COLORS.EMERALD_500 }}>→</span>
            <StatBig value={c.after.value} label={c.after.label} tier="metricMedium" color={COLORS.EMERALD_600} />
          </div>
          <div style={{ fontFamily: FONTS.MONO, fontSize: 8.5, color: COLORS.INK_MUTED }}>{c.exact}</div>
        </div>
        <FactGrid facts={c.facts} />
      </div>
      <div style={{ marginTop: 14, fontFamily: FONTS.SERIF, fontStyle: "italic", fontSize: 13, color: COLORS.INK_MUTED }}>
        {c.ratio}.
      </div>
      <SourceRail>{c.source}</SourceRail>
    </BodyPage>
  );
};

// ── p16 · the data path ─────────────────────────────────────────────────────

export const InsideDataPage: React.FC<PageProps> = (p) => {
  const c = INSIDE.data;
  return (
    <BodyPage {...p} sectionLabel={SECTION_LABEL} sectionColor={ACCENT} eyebrow={c.eyebrow} headline={c.headline}>
      <Lede>{c.lede}</Lede>
      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", columnGap: "0.5in", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Para>{c.body}</Para>
          <HonestNote>{c.honest}</HonestNote>
        </div>
        <FactGrid facts={c.facts} />
      </div>
      <SourceRail>{c.source}</SourceRail>
    </BodyPage>
  );
};

// ── p17 · auth + secrets ────────────────────────────────────────────────────

export const InsideAuthPage: React.FC<PageProps> = (p) => {
  const c = INSIDE.auth;
  return (
    <BodyPage {...p} sectionLabel={SECTION_LABEL} sectionColor={ACCENT} eyebrow={c.eyebrow} headline={c.headline}>
      <Lede>{c.lede}</Lede>
      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", columnGap: "0.5in", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Para>{c.body}</Para>
          <HonestNote>{c.honest}</HonestNote>
        </div>
        <FactGrid facts={c.facts} />
      </div>
      <SourceRail>{c.source}</SourceRail>
    </BodyPage>
  );
};
