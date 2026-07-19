import React from "react";
import { COLORS, FONTS } from "../theme";
import { Lollipop } from "./charts";

/**
 * Per-stage "signature" visuals — one distinct diagram per parser rung so the
 * HOW detail pages don't read as one template. Each shows how that stage
 * actually reads the sentence:
 *
 *   ChronoSignature     — a time rail: "tomorrow 1pm" resolved forward onto it.
 *   PrioritySignature   — the real regex → level · confidence table, as bars.
 *   CompromiseSignature — the sentence tokenized: person / place / title.
 *   ResolveSignature    — two overlapping spans, one winner by priority.
 *
 * All on light editorial cards with the single emerald accent.
 */

const CARD: React.CSSProperties = {
  border: `0.5pt solid ${COLORS.HAIRLINE}`,
  borderRadius: 6,
  background: COLORS.PAPER_ELEVATED,
  padding: 14,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const CardHead: React.FC<{ label: string; source: string }> = ({ label, source }) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
    <span
      style={{
        fontFamily: FONTS.MONO,
        fontSize: 8.5,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: COLORS.EMERALD_600,
      }}
    >
      {label}
    </span>
    <span style={{ fontFamily: FONTS.MONO, fontSize: 7, color: COLORS.INK_SUBTLE }}>{source}</span>
  </div>
);

const Caption: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: FONTS.SERIF, fontStyle: "italic", fontSize: 10.5, color: COLORS.INK_MUTED }}>
    {children}
  </div>
);

// ── Stage 1 · chrono — the time rail ───────────────────────────────────────

export const ChronoSignature: React.FC = () => (
  <div style={CARD}>
    <CardHead label="forwardDate · time rail" source="chrono-node" />
    <svg viewBox="0 0 200 96" width="100%" style={{ display: "block" }}>
      {/* axis */}
      <line x1={12} y1={64} x2={188} y2={64} stroke={COLORS.HAIRLINE_STRONG} strokeWidth={1} />
      {["today", "+1", "+2", "+3", "+4"].map((lab, i) => {
        const x = 20 + i * 40;
        return (
          <g key={lab}>
            <line x1={x} y1={60} x2={x} y2={68} stroke={COLORS.HAIRLINE_STRONG} strokeWidth={0.8} />
            <text x={x} y={80} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={7} fill={COLORS.INK_SUBTLE}>
              {lab}
            </text>
          </g>
        );
      })}
      {/* "now" marker */}
      <circle cx={20} cy={64} r={3} fill={COLORS.INK} />
      <text x={20} y={50} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={7} fill={COLORS.INK_MUTED}>
        now
      </text>
      {/* resolved "tomorrow 1pm" — jumps forward to +1 */}
      <path d="M 22 60 Q 40 30 58 60" fill="none" stroke={COLORS.EMERALD_500} strokeWidth={1.3} strokeDasharray="4 3" />
      <circle cx={60} cy={64} r={4.5} fill={COLORS.PAPER} stroke={COLORS.EMERALD_500} strokeWidth={2} />
      <text x={60} y={28} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={7.5} fontWeight={700} fill={COLORS.EMERALD_600}>
        tomorrow 1:00 PM
      </text>
    </svg>
    <Caption>
      “tomorrow 1pm” resolves forward onto the rail; a bare weekday always lands on
      the <b>next</b> one, never a past date.
    </Caption>
  </div>
);

// ── Stage 2 · priority — the rule table as a confidence dot-plot ─────────────
// A lollipop plot (not a bar chart): each pattern sits at its exact confidence
// on a shared 0.65–1.0 axis, so the reader compares by position, not length.

const PRIORITY_ROWS: ReadonlyArray<{ pat: string; level: string; conf: number }> = [
  { pat: "p1 / p2 / p3", level: "high·med·low", conf: 0.95 },
  { pat: "urgent · asap", level: "high", conf: 0.85 },
  { pat: "someday", level: "low", conf: 0.8 },
  { pat: "high", level: "high", conf: 0.75 },
  { pat: "medium", level: "medium", conf: 0.7 },
];

export const PrioritySignature: React.FC = () => (
  <div style={CARD}>
    <CardHead label="pattern · confidence" source="PriorityParser.ts" />
    <Lollipop
      rows={PRIORITY_ROWS.map((r) => ({ label: r.pat, sub: r.level, value: r.conf, highlight: r.conf === 0.95 }))}
      min={0.65}
      max={1.0}
      ticks={[0.7, 0.8, 0.9, 1.0]}
      format={(v) => v.toFixed(2)}
      labelW={96}
    />
    <Caption>
      Each pattern sits at its exact confidence in the source — “p1” at 0.95, a bare
      “high” at 0.75. Auditable, not learned.
    </Caption>
  </div>
);

// ── Stage 3 · compromise — the tokenized sentence ───────────────────────────

const TOKENS: ReadonlyArray<{ t: string; tag?: string }> = [
  { t: "Lunch", tag: "title" },
  { t: "with" },
  { t: "Sam", tag: "person" },
  { t: "at" },
  { t: "Patterson's", tag: "place" },
];

export const CompromiseSignature: React.FC = () => (
  <div style={CARD}>
    <CardHead label="named entities · POS" source="compromise" />
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "10px 8px", padding: "6px 0 2px" }}>
      {TOKENS.map((tk, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span
            style={{
              fontFamily: FONTS.SANS,
              fontSize: 14,
              fontWeight: tk.tag ? 600 : 400,
              color: tk.tag ? COLORS.INK : COLORS.INK_SUBTLE,
            }}
          >
            {tk.t}
          </span>
          {tk.tag ? (
            <>
              <span style={{ width: "100%", height: 2, background: COLORS.EMERALD_400, borderRadius: 2 }} />
              <span style={{ fontFamily: FONTS.MONO, fontSize: 6.5, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.EMERALD_700 }}>
                {tk.tag}
              </span>
            </>
          ) : (
            <span style={{ width: "100%", height: 2 }} />
          )}
        </div>
      ))}
    </div>
    <Caption>
      The language pass tags who and where — “Sam” a person, “Patterson's” a place —
      leaving the verb as the event title.
    </Caption>
  </div>
);

// ── Resolve — two overlapping spans, one winner ─────────────────────────────

export const ResolveSignature: React.FC = () => (
  <div style={CARD}>
    <CardHead label="overlap → one winner" source="SmartParser.ts:152–188" />
    <svg viewBox="0 0 200 104" width="100%" style={{ display: "block" }}>
      {/* the sentence baseline */}
      <text x={12} y={22} fontFamily="ui-monospace, monospace" fontSize={8.5} fill={COLORS.INK}>
        …meeting Friday 9am…
      </text>
      {/* chrono span (wins) */}
      <rect x={70} y={30} width={92} height={16} rx={4} fill={COLORS.EMERALD_400} fillOpacity={0.16} stroke={COLORS.EMERALD_500} strokeWidth={1.2} />
      <text x={116} y={41} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={7} fontWeight={700} fill={COLORS.EMERALD_700}>
        chrono · p10
      </text>
      {/* priority span (loses, overlaps) */}
      <rect x={116} y={54} width={64} height={16} rx={4} fill="none" stroke={COLORS.HAIRLINE_STRONG} strokeWidth={1} strokeDasharray="3 3" />
      <text x={148} y={65} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={7} fill={COLORS.INK_SUBTLE}>
        priority · p8
      </text>
      {/* resolution arrow */}
      <line x1={116} y1={78} x2={116} y2={90} stroke={COLORS.HAIRLINE_STRONG} strokeWidth={1} />
      <text x={116} y={100} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={7.5} fontWeight={700} fill={COLORS.EMERALD_600}>
        higher priority keeps the span
      </text>
    </svg>
    <Caption>
      When two stages claim the same words, the higher-priority tag wins the span
      and the loser is dropped — then a clean title remains.
    </Caption>
  </div>
);
