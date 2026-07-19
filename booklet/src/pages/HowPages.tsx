import React from "react";
import { BodyPage } from "../templates/BodyPage";
import { StatCallout } from "../primitives/StatCallout";
import { SourceNote } from "../primitives/SourceNote";
import { COLORS, FONTS, SECTION_INK } from "../theme";
import { HOW } from "../content";
import {
  ChronoSignature,
  PrioritySignature,
  CompromiseSignature,
  ResolveSignature,
} from "../visuals/Signatures";

const SECTION_LABEL = "HOW";
const ACCENT = SECTION_INK["02_HOW"];

type PageProps = { parity: "recto" | "verso"; pageNumber: number; totalPages: number };

const Para: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontFamily: FONTS.SANS, fontSize: 11, lineHeight: 1.5, letterSpacing: "-0.005em", color: COLORS.INK, margin: 0 }}>
    {children}
  </p>
);

const Note: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: FONTS.SERIF, fontStyle: "italic", fontSize: 12.5, lineHeight: 1.35, color: COLORS.INK_MUTED }}>
    {children}
  </div>
);

/** Source citation rail pinned into the bottom margin, below the live area. */
const SourceRail: React.FC<{ parity: "recto" | "verso"; children: React.ReactNode }> = ({ parity, children }) => (
  <div
    style={{
      position: "absolute",
      bottom: "0.68in",
      left: parity === "recto" ? "0.75in" : "0.75in",
      right: "0.75in",
    }}
  >
    <SourceNote color={COLORS.EMERALD_700}>{children}</SourceNote>
  </div>
);

// ── p9 · the pipeline ───────────────────────────────────────────────────────

export const HowPipelinePage: React.FC<PageProps> = (p) => {
  const c = HOW.pipeline;
  return (
    <BodyPage {...p} sectionLabel={SECTION_LABEL} sectionColor={ACCENT} eyebrow={c.eyebrow} headline={c.headline} align="top">
      <p style={{ fontFamily: FONTS.SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.4, color: COLORS.INK_MUTED, margin: "0 0 18px", maxWidth: "5.9in" }}>
        {c.lede}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", columnGap: "0.5in", alignItems: "start" }}>
        {/* the ordered stages */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {c.steps.map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                border: `0.5pt solid ${COLORS.HAIRLINE}`,
                borderLeft: `3px solid ${COLORS.EMERALD_400}`,
                borderRadius: 5,
                background: COLORS.PAPER_ELEVATED,
                padding: "9px 12px",
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: COLORS.EMERALD_400,
                  color: COLORS.GROUND,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONTS.MONO,
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {s.n}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONTS.SANS, fontSize: 13, fontWeight: 700, color: COLORS.INK }}>{s.label}</div>
                <div style={{ fontFamily: FONTS.MONO, fontSize: 8.5, color: COLORS.INK_MUTED }}>{s.detail}</div>
              </div>
              <span style={{ fontFamily: FONTS.MONO, fontSize: 8.5, fontWeight: 700, color: COLORS.EMERALD_700 }}>{s.accept}</span>
            </div>
          ))}
        </div>

        {/* the 5 pipeline stages + closing body */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              fontFamily: FONTS.MONO,
              fontSize: 8.5,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: COLORS.EMERALD_600,
            }}
          >
            parse() · five stages
          </div>
          <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {c.stages5.map((s, i) => (
              <li key={i} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <span style={{ fontFamily: FONTS.MONO, fontSize: 9, fontWeight: 700, color: COLORS.EMERALD_600, fontVariantNumeric: "tabular-nums" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontFamily: FONTS.SANS, fontSize: 10.5, lineHeight: 1.35, color: COLORS.INK }}>{s}</span>
              </li>
            ))}
          </ol>
          <Para>{c.body}</Para>
        </div>
      </div>
      <SourceRail parity={p.parity}>{c.source}</SourceRail>
    </BodyPage>
  );
};

// ── shared two-column detail layout for chrono / priority / compromise ──────

const DetailPage: React.FC<
  PageProps & {
    eyebrow: string;
    headline: string;
    body: readonly string[];
    note: string;
    source: string;
    signature: React.ReactNode;
    stats?: ReadonlyArray<{ label: string; value: string }>;
  }
> = ({ parity, pageNumber, totalPages, eyebrow, headline, body, note, source, signature, stats }) => (
  <BodyPage parity={parity} pageNumber={pageNumber} totalPages={totalPages} sectionLabel={SECTION_LABEL} sectionColor={ACCENT} eyebrow={eyebrow} headline={headline}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.02fr", columnGap: "0.5in", alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {body.map((b, i) => (
          <Para key={i}>{b}</Para>
        ))}
        <Note>{note}</Note>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {signature}
        {stats && <StatCallout rows={stats} accent={COLORS.EMERALD_400} />}
      </div>
    </div>
    <SourceRail parity={parity}>{source}</SourceRail>
  </BodyPage>
);

export const HowChronoPage: React.FC<PageProps> = (p) => {
  const c = HOW.chrono;
  return (
    <DetailPage
      {...p}
      eyebrow={c.eyebrow}
      headline={c.headline}
      body={c.body}
      note={c.note}
      source={c.source}
      signature={<ChronoSignature />}
      stats={[
        { label: c.stat.label, value: c.stat.value },
        { label: c.stat2.label, value: c.stat2.value },
      ]}
    />
  );
};

export const HowPriorityPage: React.FC<PageProps> = (p) => {
  const c = HOW.priority;
  return (
    <DetailPage {...p} eyebrow={c.eyebrow} headline={c.headline} body={c.body} note={c.note} source={c.source} signature={<PrioritySignature />} />
  );
};

export const HowCompromisePage: React.FC<PageProps> = (p) => {
  const c = HOW.compromise;
  return (
    <DetailPage
      {...p}
      eyebrow={c.eyebrow}
      headline={c.headline}
      body={c.body}
      note={c.note}
      source={c.source}
      signature={<CompromiseSignature />}
      stats={[
        { label: c.stat.label, value: c.stat.value },
        { label: c.stat2.label, value: c.stat2.value },
      ]}
    />
  );
};

// ── p13 · resolve + file ────────────────────────────────────────────────────

export const HowResolvePage: React.FC<PageProps> = (p) => {
  const c = HOW.resolve;
  return (
    <BodyPage {...p} sectionLabel={SECTION_LABEL} sectionColor={ACCENT} eyebrow={c.eyebrow} headline={c.headline}>
      <p style={{ fontFamily: FONTS.SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.4, color: COLORS.INK_MUTED, margin: "0 0 18px", maxWidth: "5.9in" }}>
        {c.lede}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "0.5in", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Para>{c.body}</Para>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {c.bands.map((b) => (
              <div
                key={b.verb}
                style={{
                  display: "grid",
                  gridTemplateColumns: "58px 1fr",
                  alignItems: "baseline",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: `0.5pt solid ${COLORS.HAIRLINE}`,
                }}
              >
                <span style={{ fontFamily: FONTS.MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: COLORS.EMERALD_600 }}>{b.verb}</span>
                <span style={{ fontFamily: FONTS.SANS, fontSize: 10.5, lineHeight: 1.35, color: COLORS.INK }}>{b.detail}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <ResolveSignature />
          <Note>{c.loopNote}</Note>
        </div>
      </div>
      <SourceRail parity={p.parity}>{c.source}</SourceRail>
    </BodyPage>
  );
};
