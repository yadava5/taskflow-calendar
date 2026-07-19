import React from 'react';
import { BodyPage } from '../templates/BodyPage';
import { PullQuote } from '../primitives/PullQuote';
import { COLORS, FONTS, SECTION_INK } from '../theme';
import { WHY, COVER, STAGES } from '../content';
import { FigureCard } from '../visuals/charts';

const SECTION_LABEL = 'WHY';
const ACCENT = SECTION_INK['01_WHY'];

type PageProps = {
  parity: 'recto' | 'verso';
  pageNumber: number;
  totalPages: number;
};

const Para: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <p
    style={{
      fontFamily: FONTS.SANS,
      fontSize: 11,
      lineHeight: 1.5,
      letterSpacing: '-0.005em',
      color: COLORS.INK,
      margin: 0,
      ...style,
    }}
  >
    {children}
  </p>
);

// ── p5 · the form ───────────────────────────────────────────────────────────

export const WhyFormsPage: React.FC<PageProps> = (p) => {
  const c = WHY.forms;
  return (
    <BodyPage
      {...p}
      sectionLabel={SECTION_LABEL}
      sectionColor={ACCENT}
      eyebrow={c.eyebrow}
      headline={c.headline}
    >
      <PullQuote style={{ maxWidth: '5.6in', marginBottom: 20 }}>
        {c.pullQuote}
      </PullQuote>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.35fr 1fr',
          columnGap: '0.5in',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {c.body.map((b, i) => (
            <Para key={i}>{b}</Para>
          ))}
          <div
            style={{
              borderLeft: `2px solid ${ACCENT}`,
              paddingLeft: 12,
              fontFamily: FONTS.SERIF,
              fontStyle: 'italic',
              fontSize: 14,
              lineHeight: 1.35,
              color: COLORS.INK,
            }}
          >
            {c.coda}
          </div>
        </div>

        {/* the form dialog mock — six boxes */}
        <div
          style={{
            background: COLORS.GROUND,
            borderRadius: 10,
            border: `1px solid ${COLORS.GROUND_ELEVATED}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '10px 12px',
              borderBottom: `1px solid ${COLORS.ON_DARK_HAIRLINE}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: FONTS.SANS,
                fontSize: 11,
                fontWeight: 600,
                color: COLORS.ON_DARK,
              }}
            >
              New Event
            </span>
            <span
              style={{
                fontFamily: FONTS.MONO,
                fontSize: 10,
                color: COLORS.STEEL_SUBTLE,
              }}
            >
              ×
            </span>
          </div>
          <div
            style={{
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 9,
            }}
          >
            {c.fields.map((f) => (
              <div
                key={f.label}
                style={{ display: 'flex', flexDirection: 'column', gap: 3 }}
              >
                <span
                  style={{
                    fontFamily: FONTS.MONO,
                    fontSize: 7.5,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: COLORS.STEEL_SUBTLE,
                  }}
                >
                  {f.label}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.MONO,
                    fontSize: 9,
                    color: COLORS.STEEL,
                    background: COLORS.GROUND_ELEVATED,
                    border: `1px solid ${COLORS.ON_DARK_HAIRLINE}`,
                    borderRadius: 4,
                    padding: '5px 8px',
                  }}
                >
                  {f.filler}
                </span>
              </div>
            ))}
            <div
              style={{
                marginTop: 2,
                textAlign: 'center',
                fontFamily: FONTS.MONO,
                fontSize: 7.5,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: COLORS.STEEL_SUBTLE,
              }}
            >
              six boxes · every time
            </div>
          </div>
        </div>
      </div>

      {/* six boxes, one thought — the fields you already knew before the dialog */}
      <div
        style={{
          marginTop: 22,
          borderTop: `0.5pt solid ${COLORS.HAIRLINE}`,
          paddingTop: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: FONTS.MONO,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: ACCENT,
            flexShrink: 0,
          }}
        >
          the six
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1 }}>
          {c.fields.map((f) => (
            <span
              key={f.label}
              style={{
                fontFamily: FONTS.MONO,
                fontSize: 8.5,
                letterSpacing: '0.08em',
                color: COLORS.INK_MUTED,
                background: COLORS.PAPER_ELEVATED,
                border: `0.5pt solid ${COLORS.HAIRLINE}`,
                borderRadius: 3,
                padding: '3px 9px',
              }}
            >
              {f.label}
            </span>
          ))}
        </div>
        <span
          style={{
            fontFamily: FONTS.SERIF,
            fontStyle: 'italic',
            fontSize: 12.5,
            color: COLORS.INK,
            flexShrink: 0,
          }}
        >
          you knew all six before the dialog opened.
        </span>
      </div>

      {/* The payoff, previewed: the one sentence that carries all six fields. */}
      <div
        style={{
          marginTop: 18,
          borderRadius: 8,
          border: `0.5pt solid ${COLORS.HAIRLINE}`,
          borderLeft: `2.5px solid ${ACCENT}`,
          background: COLORS.PAPER_ELEVATED,
          padding: '14px 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.MONO,
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: ACCENT,
            }}
          >
            or · one line instead
          </span>
          <span
            style={{
              fontFamily: FONTS.MONO,
              fontSize: 7.5,
              letterSpacing: '0.06em',
              color: COLORS.INK_SUBTLE,
            }}
          >
            zero boxes
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{ fontFamily: FONTS.MONO, fontSize: 12, color: COLORS.INK }}
          >
            “{COVER.examples[0]!.text}”
          </span>
          <span
            style={{
              fontFamily: FONTS.MONO,
              fontSize: 12,
              color: COLORS.EMERALD_500,
            }}
          >
            →
          </span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {COVER.examples[0]!.chips.map(([kind, value]) => (
              <span
                key={kind}
                style={{
                  display: 'inline-flex',
                  gap: 5,
                  padding: '3px 9px',
                  borderRadius: 999,
                  border: `0.5pt solid ${COLORS.EMERALD_600}`,
                  background: COLORS.EMERALD_TINT,
                  fontFamily: FONTS.MONO,
                  fontSize: 8.5,
                  color: COLORS.EMERALD_700,
                }}
              >
                <span style={{ fontWeight: 700 }}>{kind}</span> {value}
              </span>
            ))}
          </div>
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: FONTS.SERIF,
            fontStyle: 'italic',
            fontSize: 11.5,
            color: COLORS.INK_MUTED,
          }}
        >
          The same event — title, date, time, place — read straight out of one
          sentence, no dialog opened.
        </div>
      </div>
    </BodyPage>
  );
};

// ── p6 · the cost (fill the form / type the sentence) ───────────────────────

const CompareColumn: React.FC<{
  title: string;
  rows: readonly string[];
  tone: 'form' | 'sentence';
}> = ({ title, rows, tone }) => {
  const accent = tone === 'sentence' ? COLORS.EMERALD_600 : COLORS.INK_MUTED;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          fontFamily: FONTS.MONO,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: accent,
          borderBottom: `1.5pt solid ${accent}`,
          paddingBottom: 6,
        }}
      >
        {title}
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}
        >
          <span
            style={{
              color: accent,
              fontFamily: FONTS.MONO,
              fontSize: 11,
              lineHeight: 1.4,
              flexShrink: 0,
            }}
          >
            {tone === 'sentence' ? '→' : '·'}
          </span>
          <span
            style={{
              fontFamily: FONTS.SANS,
              fontSize: 10.5,
              lineHeight: 1.4,
              color: COLORS.INK,
            }}
          >
            {r}
          </span>
        </div>
      ))}
    </div>
  );
};

export const WhyFrictionPage: React.FC<PageProps> = (p) => {
  const c = WHY.friction;
  return (
    <BodyPage
      {...p}
      sectionLabel={SECTION_LABEL}
      sectionColor={ACCENT}
      eyebrow={c.eyebrow}
      headline={c.headline}
    >
      <p
        style={{
          fontFamily: FONTS.SERIF,
          fontStyle: 'italic',
          fontSize: 16,
          lineHeight: 1.4,
          color: COLORS.INK_MUTED,
          margin: '0 0 20px',
          maxWidth: '5.8in',
        }}
      >
        {c.lede}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          columnGap: '0.5in',
        }}
      >
        <CompareColumn title={c.beforeTitle} rows={c.before} tone="form" />
        <CompareColumn title={c.withTitle} rows={c.with} tone="sentence" />
      </div>
      <div
        style={{
          marginTop: 20,
          borderTop: `0.5pt solid ${COLORS.HAIRLINE}`,
          paddingTop: 14,
          fontFamily: FONTS.SERIF,
          fontStyle: 'italic',
          fontSize: 15,
          lineHeight: 1.4,
          color: COLORS.INK,
        }}
      >
        {c.gate}
      </div>

      {/* the cost, as units — six fields to fill vs one line to type */}
      <div style={{ marginTop: 18 }}>
        <FigureCard
          label="one lunch · the cost"
          caption="Same event, logged two ways: six fields to hand-assemble, or one sentence to type. The form's cost is the count of boxes it makes you fill."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <CostRow
              label="FILL THE FORM"
              units={6}
              note="six fields · title · date · start · end · list · priority"
              tone="form"
            />
            <CostRow
              label="TYPE THE SENTENCE"
              units={1}
              note="one line · “lunch with Sam tomorrow at one”"
              tone="sentence"
            />
          </div>
        </FigureCard>
      </div>

      {/* the trade, in three figures — closes the page on the friction argument */}
      <div
        style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          borderTop: `1pt solid ${COLORS.INK}`,
          borderBottom: `0.5pt solid ${COLORS.HAIRLINE}`,
        }}
      >
        {[
          { v: '6', k: 'fields · the form', n: 'hand-assembled, every event' },
          { v: '1', k: 'line · the sentence', n: "typed the way you'd say it" },
          {
            v: '∞',
            k: 'patience · the reframe',
            n: 'a sentence never runs out',
          },
        ].map((x, i) => (
          <div
            key={x.k}
            style={{
              padding: '13px 16px',
              borderLeft: i === 0 ? 'none' : `0.5pt solid ${COLORS.HAIRLINE}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.MONO,
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: i === 1 ? COLORS.EMERALD_600 : COLORS.INK,
                lineHeight: 1,
              }}
            >
              {x.v}
            </span>
            <span
              style={{
                fontFamily: FONTS.MONO,
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: COLORS.INK_MUTED,
              }}
            >
              {x.k}
            </span>
            <span
              style={{
                fontFamily: FONTS.SERIF,
                fontStyle: 'italic',
                fontSize: 9.5,
                lineHeight: 1.25,
                color: COLORS.INK_SUBTLE,
              }}
            >
              {x.n}
            </span>
          </div>
        ))}
      </div>
    </BodyPage>
  );
};

const CostRow: React.FC<{
  label: string;
  units: number;
  note: string;
  tone: 'form' | 'sentence';
}> = ({ label, units, note, tone }) => {
  const sentence = tone === 'sentence';
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.35in auto 1fr',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <span
        style={{
          fontFamily: FONTS.MONO,
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: sentence ? COLORS.EMERALD_700 : COLORS.INK_MUTED,
        }}
      >
        {label}
      </span>
      <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
        {sentence ? (
          <span
            style={{
              width: 118,
              height: 16,
              borderRadius: 8,
              background: COLORS.EMERALD_400,
              display: 'inline-block',
            }}
          />
        ) : (
          Array.from({ length: units }).map((_, i) => (
            <span
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: 3,
                background: COLORS.SURFACE,
                border: `1px solid ${COLORS.HAIRLINE_STRONG}`,
              }}
            />
          ))
        )}
      </span>
      <span
        style={{
          fontFamily: FONTS.SERIF,
          fontStyle: 'italic',
          fontSize: 11,
          color: COLORS.INK_MUTED,
        }}
      >
        {note}
      </span>
    </div>
  );
};

// ── p7 · the reframe ────────────────────────────────────────────────────────

export const WhyPlainPage: React.FC<PageProps> = (p) => {
  const c = WHY.plain;
  return (
    <BodyPage
      {...p}
      sectionLabel={SECTION_LABEL}
      sectionColor={ACCENT}
      eyebrow={c.eyebrow}
      headline={c.headline}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          maxWidth: '6in',
        }}
      >
        {c.body.map((b, i) => (
          <Para key={i}>{b}</Para>
        ))}
      </div>

      <PullQuote style={{ margin: '22px 0', maxWidth: '6in' }}>
        {c.thesis}
      </PullQuote>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {c.reframe.map((r, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 24px 1fr',
              alignItems: 'center',
              gap: 12,
              padding: '9px 0',
              borderBottom: `0.5pt solid ${COLORS.HAIRLINE}`,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.SANS,
                fontSize: 11,
                color: COLORS.INK_MUTED,
                textAlign: 'right',
              }}
            >
              {r.from}
            </span>
            <span
              style={{
                color: COLORS.EMERALD_500,
                textAlign: 'center',
                fontFamily: FONTS.MONO,
                fontSize: 13,
              }}
            >
              →
            </span>
            <span
              style={{
                fontFamily: FONTS.SANS,
                fontSize: 11.5,
                fontWeight: 600,
                color: COLORS.INK,
              }}
            >
              {r.to}
            </span>
          </div>
        ))}
      </div>

      {/* the comprehension task — the four questions a read of the sentence answers */}
      <div style={{ marginTop: 22 }}>
        <div
          style={{
            fontFamily: FONTS.MONO,
            fontSize: 8.5,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: ACCENT,
            marginBottom: 10,
          }}
        >
          comprehension · four questions
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
          }}
        >
          {c.questions.map((qa, i) => (
            <div
              key={qa.q}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                padding: '12px 12px',
                borderRadius: 6,
                background: COLORS.PAPER_ELEVATED,
                border: `0.5pt solid ${COLORS.HAIRLINE}`,
                borderTop: `2.5px solid ${COLORS.EMERALD_400}`,
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.MONO,
                  fontSize: 8,
                  fontWeight: 700,
                  color: COLORS.EMERALD_700,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                style={{
                  fontFamily: FONTS.SANS,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: COLORS.INK,
                }}
              >
                {qa.q}
              </span>
              <span
                style={{
                  fontFamily: FONTS.SERIF,
                  fontStyle: 'italic',
                  fontSize: 11,
                  lineHeight: 1.3,
                  color: COLORS.INK_MUTED,
                }}
              >
                {qa.a}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Teaser: the three readers that answer those questions — sets up §02. */}
      <div
        style={{
          marginTop: 20,
          borderTop: `1pt solid ${COLORS.INK}`,
          paddingTop: 14,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.MONO,
            fontSize: 8.5,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: ACCENT,
            marginBottom: 10,
          }}
        >
          the sentence, read by three
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0,
          }}
        >
          {STAGES.map((s, i) => (
            <div
              key={s.id}
              style={{
                paddingLeft: i === 0 ? 0 : 14,
                paddingRight: 14,
                borderLeft: i === 0 ? 'none' : `0.5pt solid ${COLORS.HAIRLINE}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                <span
                  style={{
                    fontFamily: FONTS.MONO,
                    fontSize: 12,
                    fontWeight: 700,
                    color: COLORS.EMERALD_600,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {s.n}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.SANS,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: COLORS.INK,
                  }}
                >
                  {s.label}
                </span>
              </div>
              <span
                style={{
                  fontFamily: FONTS.MONO,
                  fontSize: 8,
                  letterSpacing: '0.04em',
                  color: COLORS.EMERALD_700,
                }}
              >
                reads the {s.reads}
              </span>
              <span
                style={{
                  fontFamily: FONTS.MONO,
                  fontSize: 7.5,
                  color: COLORS.INK_SUBTLE,
                }}
              >
                {s.engine}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          fontFamily: FONTS.MONO,
          fontSize: 9,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: COLORS.EMERALD_600,
        }}
      >
        {c.handoff}
      </div>
    </BodyPage>
  );
};
