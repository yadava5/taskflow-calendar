import React from "react";
import { BodyPage } from "../templates/BodyPage";
import { StatBig } from "../primitives/StatBig";
import { SourceNote } from "../primitives/SourceNote";
import { COLORS, FONTS, SECTION_INK } from "../theme";
import { PROOF, COVER } from "../content";

const SECTION_LABEL = "PROOF";
const ACCENT = SECTION_INK["04_PROOF"];

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

const SourceRail: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", bottom: "0.68in", left: "0.75in", right: "0.75in" }}>
    <SourceNote color={COLORS.EMERALD_700}>{children}</SourceNote>
  </div>
);

const FactGrid: React.FC<{ facts: readonly Fact[] }> = ({ facts }) => (
  <div style={{ background: COLORS.GROUND, borderRadius: 8, border: `1px solid ${COLORS.GROUND_ELEVATED}`, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
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
        <span style={{ fontFamily: FONTS.MONO, fontSize: 7.5, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.EMERALD_400 }}>{f.k}</span>
        <span style={{ fontFamily: FONTS.MONO, fontSize: 9, lineHeight: 1.35, color: COLORS.ON_DARK }}>{f.v}</span>
      </div>
    ))}
  </div>
);

// ── p19 · the number (hero) ─────────────────────────────────────────────────

export const ProofTestsPage: React.FC<PageProps> = (p) => {
  const c = PROOF.tests;
  return (
    <BodyPage {...p} sectionLabel={SECTION_LABEL} sectionColor={ACCENT} eyebrow={c.eyebrow} headline={c.headline}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
        <div style={{ fontFamily: FONTS.MONO, fontSize: 92, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 0.95, color: COLORS.EMERALD_600, fontVariantNumeric: "tabular-nums" }}>
          {c.hero}
        </div>
        <div style={{ fontFamily: FONTS.MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.INK_MUTED }}>
          {c.heroLabel}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", columnGap: "0.5in", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Para>{c.body}</Para>
          <div style={{ fontFamily: FONTS.MONO, fontSize: 8.5, color: COLORS.INK_MUTED }}>{c.exact}</div>
        </div>
        <div
          style={{
            borderLeft: `2px solid ${COLORS.EMERALD_400}`,
            paddingLeft: 14,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <StatBig value={c.ciValue} label={c.ciLabel} tier="metricMedium" color={COLORS.EMERALD_600} />
          <p style={{ fontFamily: FONTS.SANS, fontSize: 10, lineHeight: 1.4, color: COLORS.INK, margin: 0 }}>{c.ciBody}</p>
        </div>
      </div>
      <SourceRail>{c.source}</SourceRail>
    </BodyPage>
  );
};

// ── p20 · the parse showcase (signature) ────────────────────────────────────

const ShowcaseCard: React.FC<{ ex: (typeof COVER.examples)[number] }> = ({ ex }) => (
  <div style={{ background: COLORS.GROUND, borderRadius: 10, border: `1px solid ${COLORS.GROUND_ELEVATED}`, overflow: "hidden" }}>
    {/* you type */}
    <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontFamily: FONTS.MONO, fontSize: 7.5, letterSpacing: "0.24em", textTransform: "uppercase", color: COLORS.STEEL_SUBTLE }}>you type</span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "9px 11px",
          borderRadius: 8,
          border: `1px solid ${COLORS.ON_DARK_HAIRLINE}`,
          background: COLORS.GROUND_ELEVATED,
          fontFamily: FONTS.MONO,
          fontSize: 11.5,
          color: COLORS.ON_DARK,
        }}
      >
        <span style={{ color: COLORS.EMERALD_500 }}>&rsaquo;</span>
        {ex.text}
      </div>
      {/* it reads */}
      <span style={{ fontFamily: FONTS.MONO, fontSize: 7.5, letterSpacing: "0.24em", textTransform: "uppercase", color: COLORS.STEEL_SUBTLE }}>it reads</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {ex.chips.map(([kind, value]) => (
          <span
            key={kind + value}
            style={{
              display: "inline-flex",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 999,
              border: `1px solid ${COLORS.EMERALD_TINT_STRONG}`,
              background: COLORS.EMERALD_TINT,
              fontFamily: FONTS.MONO,
              fontSize: 9.5,
              color: COLORS.EMERALD_300,
            }}
          >
            <span style={{ color: COLORS.EMERALD_500 }}>{kind}</span> {value}
          </span>
        ))}
      </div>
      {/* it files */}
      <span style={{ fontFamily: FONTS.MONO, fontSize: 7.5, letterSpacing: "0.24em", textTransform: "uppercase", color: COLORS.STEEL_SUBTLE }}>it files</span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", borderRadius: 7, border: `1px solid ${COLORS.ON_DARK_HAIRLINE}`, overflow: "hidden" }}>
        {COVER.days.map((day, i) => (
          <div key={day} style={{ position: "relative", height: 62, borderRight: i < 4 ? `1px solid rgba(247,248,248,0.06)` : "none" }}>
            <div style={{ padding: "4px 0", textAlign: "center", borderBottom: `1px solid rgba(247,248,248,0.06)`, fontFamily: FONTS.MONO, fontSize: 7, letterSpacing: "0.16em", color: COLORS.STEEL_SUBTLE }}>
              {day}
            </div>
            {ex.filed.day === i && (
              <div
                style={{
                  position: "absolute",
                  left: 3,
                  right: 3,
                  top: ex.filed.top,
                  padding: "4px 5px",
                  borderRadius: 5,
                  border: ex.filed.kind === "event" ? `1px solid ${COLORS.EMERALD_TINT_STRONG}` : `1px dashed ${COLORS.EMERALD_TINT_STRONG}`,
                  background: COLORS.EMERALD_TINT,
                }}
              >
                <div style={{ fontFamily: FONTS.SANS, fontSize: 8, fontWeight: 600, color: COLORS.EMERALD_300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ex.filed.label}</div>
                <div style={{ fontFamily: FONTS.MONO, fontSize: 6, color: "rgba(52,211,153,0.7)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ex.filed.detail}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ProofParsePage: React.FC<PageProps> = (p) => {
  const c = PROOF.parse;
  return (
    <BodyPage {...p} sectionLabel={SECTION_LABEL} sectionColor={ACCENT} eyebrow={c.eyebrow} headline={c.headline} align="top">
      <Lede>{c.lede}</Lede>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "0.4in", rowGap: 12 }}>
        <ShowcaseCard ex={COVER.examples[0]!} />
        <ShowcaseCard ex={COVER.examples[1]!} />
      </div>
      <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontFamily: FONTS.SERIF, fontStyle: "italic", fontSize: 13, color: COLORS.INK }}>{c.legendGate}.</span>
        <span style={{ fontFamily: FONTS.MONO, fontSize: 8, color: COLORS.INK_SUBTLE }}>{c.illustrativeNote}</span>
      </div>
      <SourceRail>{c.source}</SourceRail>
    </BodyPage>
  );
};

// ── p21 · it folds to fit (mobile + google) ─────────────────────────────────

const AGENDA_ROWS: ReadonlyArray<[string, string]> = [
  ["MON 9:00", "Standup"],
  ["THU 1:00", "Lunch with Sam"],
  ["FRI —", "Ship the report"],
];

export const ProofAdaptPage: React.FC<PageProps> = (p) => {
  const c = PROOF.adapt;
  return (
    <BodyPage {...p} sectionLabel={SECTION_LABEL} sectionColor={ACCENT} eyebrow={c.eyebrow} headline={c.headline}>
      <Lede>{c.lede}</Lede>
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", columnGap: "0.5in", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Para>{c.body}</Para>
          <FactGrid facts={c.facts} />
          <div style={{ borderLeft: `2px solid ${COLORS.EMERALD_400}`, paddingLeft: 12, fontFamily: FONTS.SERIF, fontStyle: "italic", fontSize: 12.5, lineHeight: 1.4, color: COLORS.INK }}>
            {c.honest}
          </div>
        </div>

        {/* phone mock: agenda list */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: "2.05in",
              background: COLORS.GROUND,
              borderRadius: 20,
              border: `2px solid ${COLORS.GROUND_ELEVATED}`,
              padding: 8,
            }}
          >
            <div style={{ height: 5, width: 40, background: COLORS.ON_DARK_HAIRLINE, borderRadius: 3, margin: "2px auto 8px" }} />
            <div style={{ fontFamily: FONTS.MONO, fontSize: 7.5, letterSpacing: "0.14em", textTransform: "uppercase", color: COLORS.EMERALD_400, padding: "0 4px 8px" }}>
              listWeek · agenda
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {AGENDA_ROWS.map(([when, what], i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 4px", borderTop: `1px solid rgba(247,248,248,0.06)` }}>
                  <span style={{ fontFamily: FONTS.MONO, fontSize: 7, color: COLORS.STEEL_SUBTLE }}>{when}</span>
                  <span style={{ fontFamily: FONTS.SANS, fontSize: 10, color: COLORS.ON_DARK }}>{what}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontFamily: FONTS.MONO, fontSize: 8, letterSpacing: "0.1em", color: COLORS.INK_SUBTLE }}>&lt; 768px · the week folds</div>
        </div>
      </div>
      <SourceRail>{c.source}</SourceRail>
    </BodyPage>
  );
};

// ── p22 · the posture ───────────────────────────────────────────────────────

export const ProofSecurityPage: React.FC<PageProps> = (p) => {
  const c = PROOF.security;
  return (
    <BodyPage {...p} sectionLabel={SECTION_LABEL} sectionColor={ACCENT} eyebrow={c.eyebrow} headline={c.headline}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", columnGap: "0.35in", marginBottom: 20 }}>
        {c.stats.map((s, i) => (
          <div key={s.value} style={{ borderLeft: i === 0 ? "none" : `0.5pt solid ${COLORS.HAIRLINE}`, paddingLeft: i === 0 ? 0 : 14 }}>
            <div style={{ fontFamily: FONTS.MONO, fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", color: COLORS.EMERALD_600 }}>{s.value}</div>
            <div style={{ fontFamily: FONTS.MONO, fontSize: 8.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: COLORS.INK_MUTED, marginTop: 4 }}>{s.label}</div>
            <div style={{ fontFamily: FONTS.MONO, fontSize: 7.5, color: COLORS.INK_SUBTLE, marginTop: 2 }}>{s.note}</div>
          </div>
        ))}
      </div>
      <Para>{c.body}</Para>
      <div style={{ marginTop: 16, borderLeft: `2px solid ${COLORS.EMERALD_400}`, paddingLeft: 12, fontFamily: FONTS.SERIF, fontStyle: "italic", fontSize: 12.5, color: COLORS.INK }}>
        {c.honest}
      </div>
      <div style={{ marginTop: 22, borderTop: `1pt solid ${COLORS.INK}`, paddingTop: 14 }}>
        <span style={{ fontFamily: FONTS.SERIF, fontStyle: "italic", fontSize: 18, lineHeight: 1.3, color: COLORS.INK }}>{c.handoffQuote}</span>
      </div>
    </BodyPage>
  );
};
