import React from "react";
import { COLORS, FONTS } from "../theme";
import { COVER } from "../content";

/**
 * WeekField — TaskFlow's cover motif. The app's own story, told as one image:
 * a plain-English sentence dissolving into typed chips (event/when/where ·
 * task/due/priority) that land on a MON–FRI week grid. "you type → it reads →
 * it files," lifted straight from the landing ParseShowcase (Welcome.tsx).
 *
 * NOT the sibling JobTracker book's envelope field, and not topographic — this
 * is native TaskFlow UI, rendered as print art. Pure HTML + inline styles on
 * the app's near-black ground with one soft emerald glow; no external assets,
 * so it is PDF-safe.
 *
 *   front — example 1 (an event → THU).
 *   back  — example 2 (a task → FRI), so the wraparound reads as a second beat.
 */

export type WeekFieldProps = {
  widthIn: number;
  heightIn: number;
  variant: "front" | "back";
};

const DOTS = `radial-gradient(${COLORS.ON_DARK_HAIRLINE} 0.6px, transparent 0.6px)`;

const BeatLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: FONTS.MONO,
      fontSize: 9,
      fontWeight: 500,
      letterSpacing: "0.3em",
      textTransform: "uppercase",
      color: COLORS.STEEL_SUBTLE,
    }}
  >
    {children}
  </div>
);

export const WeekField: React.FC<WeekFieldProps> = ({ widthIn, heightIn, variant }) => {
  // *In props are reserved API knobs; the layer fills its positioned parent.
  void widthIn;
  void heightIn;

  const ex = variant === "front" ? COVER.examples[0]! : COVER.examples[1]!;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        background: COLORS.GROUND,
        overflow: "hidden",
      }}
    >
      {/* faint dotted engineering grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: DOTS,
          backgroundSize: "26px 26px",
          opacity: 0.5,
        }}
      />
      {/* the one signature glow — emerald, soft, upper area */}
      <div
        style={{
          position: "absolute",
          top: "-8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "9in",
          height: "5in",
          background: `radial-gradient(closest-side, ${COLORS.EMERALD_GLOW}, transparent)`,
          filter: "blur(8px)",
        }}
      />

      {/* three beats, stacked in the top ~64% — leaves the lower third for the
          title block the cover composes over this layer. */}
      <div
        style={{
          position: "absolute",
          top: "1.85in",
          left: "0.7in",
          right: "0.7in",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Beat 1 — you type */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <BeatLabel>you type</BeatLabel>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 16px",
              borderRadius: 10,
              border: `1px solid ${COLORS.ON_DARK_HAIRLINE}`,
              background: COLORS.GROUND_ELEVATED,
              fontFamily: FONTS.MONO,
              fontSize: 17,
              color: COLORS.ON_DARK,
            }}
          >
            <span style={{ color: COLORS.EMERALD_500 }}>&rsaquo;</span>
            <span>{ex.text}</span>
            <span style={{ color: COLORS.EMERALD_400 }}>&#9613;</span>
          </div>
        </div>

        {/* Beat 2 — it reads */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <BeatLabel>it reads</BeatLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ex.chips.map(([kind, value]) => (
              <span
                key={kind + value}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: `1px solid ${COLORS.EMERALD_TINT_STRONG}`,
                  background: COLORS.EMERALD_TINT,
                  fontFamily: FONTS.MONO,
                  fontSize: 12,
                  color: COLORS.EMERALD_300,
                }}
              >
                <span style={{ color: COLORS.EMERALD_500 }}>{kind}</span> {value}
              </span>
            ))}
          </div>
        </div>

        {/* Beat 3 — it files (the MON–FRI week) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <BeatLabel>it files</BeatLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              borderRadius: 10,
              border: `1px solid ${COLORS.ON_DARK_HAIRLINE}`,
              overflow: "hidden",
            }}
          >
            {COVER.days.map((day, i) => (
              <div
                key={day}
                style={{
                  position: "relative",
                  height: "1.55in",
                  borderRight:
                    i < COVER.days.length - 1 ? `1px solid rgba(247,248,248,0.06)` : "none",
                }}
              >
                <div
                  style={{
                    padding: "7px 0",
                    textAlign: "center",
                    borderBottom: `1px solid rgba(247,248,248,0.06)`,
                    fontFamily: FONTS.MONO,
                    fontSize: 9,
                    letterSpacing: "0.2em",
                    color: COLORS.STEEL_SUBTLE,
                  }}
                >
                  {day}
                </div>
                {ex.filed.day === i && (
                  <div
                    style={{
                      position: "absolute",
                      left: 6,
                      right: 6,
                      top: ex.filed.top,
                      padding: "7px 9px",
                      borderRadius: 7,
                      border:
                        ex.filed.kind === "event"
                          ? `1px solid ${COLORS.EMERALD_TINT_STRONG}`
                          : `1px dashed ${COLORS.EMERALD_TINT_STRONG}`,
                      background: COLORS.EMERALD_TINT,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: FONTS.SANS,
                        fontSize: 11,
                        fontWeight: 600,
                        color: COLORS.EMERALD_300,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {ex.filed.label}
                    </div>
                    <div
                      style={{
                        fontFamily: FONTS.MONO,
                        fontSize: 8.5,
                        color: "rgba(52,211,153,0.7)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {ex.filed.detail}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* scrim so the title block reads cleanly over the lower third */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "3.6in",
          background: `linear-gradient(to top, ${COLORS.GROUND} 20%, rgba(10,10,11,0.86) 52%, rgba(10,10,11,0) 100%)`,
        }}
      />
    </div>
  );
};
