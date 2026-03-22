import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CSSProperties, MouseEventHandler } from 'react';

/* ── Keyframe animations (self-contained, injected once) ─────────────────── */
const CSS = `
@keyframes ai-gradient {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes ai-shimmer {
  0%   { transform: translateX(-130%) skewX(-18deg); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateX(280%) skewX(-18deg); opacity: 0; }
}
@keyframes ai-glow {
  0%,100% { box-shadow: 0 4px 18px rgba(124,58,237,.40), 0 0 0 0 rgba(124,58,237,.18); }
  50%      { box-shadow: 0 6px 28px rgba(99,102,241,.70), 0 0 0 7px rgba(124,58,237,0); }
}
@keyframes ai-float-a {
  0%,100% { transform: translate(0,0) scale(1);   opacity: .75; }
  50%      { transform: translate(2px,-6px) scale(1.5); opacity: .15; }
}
@keyframes ai-float-b {
  0%,100% { transform: translate(0,0) scale(1);   opacity: .55; }
  50%      { transform: translate(-3px,-4px) scale(1.3); opacity: .10; }
}
@keyframes ai-float-c {
  0%,100% { transform: translate(0,0) scale(1);   opacity: .65; }
  50%      { transform: translate(3px,-7px) scale(1.6); opacity: .12; }
}
@keyframes ai-icon {
  0%   { transform: rotate(0deg) scale(1); }
  20%  { transform: rotate(18deg) scale(1.15); }
  40%  { transform: rotate(-10deg) scale(0.95); }
  60%  { transform: rotate(8deg) scale(1.05); }
  80%  { transform: rotate(-5deg) scale(0.98); }
  100% { transform: rotate(0deg) scale(1); }
}
/* Border aurora ring */
@keyframes ai-border-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
`;

let injected = false;
function injectStyles() {
  if (injected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = CSS;
  document.head.appendChild(el);
  injected = true;
}

/* ── Types ───────────────────────────────────────────────────────────────── */
interface AiReviewButtonProps {
  onClick?: () => void;
  /** 'full' = icon + text (default), 'icon' = icon only (mobile) */
  variant?: 'full' | 'icon';
  /** sm fits in a tight toolbar strip, md is the default */
  size?: 'sm' | 'md';
}

/* ── Component ───────────────────────────────────────────────────────────── */
export function AiReviewButton({
  onClick,
  variant = 'full',
  size = 'sm',
}: AiReviewButtonProps) {
  const { t } = useTranslation();
  injectStyles();

  const isIcon = variant === 'icon';
  const isSm   = size === 'sm';

  /* outer wrapper — provides the aurora border */
  const wrapStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: isIcon ? '8px' : '10px',
    padding: '1.5px',               /* border thickness */
    background: 'linear-gradient(135deg, #7c3aed, #6366f1, #2563eb, #a855f7, #7c3aed)',
    backgroundSize: '400% 400%',
    animation: 'ai-gradient 5s ease infinite',
    flexShrink: 0,
  };

  /* inner button */
  const btnStyle: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: isIcon ? '6px' : '9px',
    border: 'none',
    cursor: 'pointer',
    padding: isIcon
      ? '4px'
      : isSm
        ? '5px 13px'
        : '7px 18px',
    fontSize: isSm ? '13px' : '14px',
    fontWeight: 600,
    letterSpacing: '0.015em',
    color: 'white',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    transition: 'transform .15s ease',
    animation: 'ai-glow 3.2s ease-in-out infinite',
    /* layered gradient: dark base + animated overlay */
    background: 'linear-gradient(135deg, #5b21b6 0%, #4338ca 45%, #1d4ed8 100%)',
  };

  const scale: MouseEventHandler<HTMLButtonElement> = (e) =>
    (e.currentTarget.style.transform = 'scale(1.05)');
  const unscale: MouseEventHandler<HTMLButtonElement> = (e) =>
    (e.currentTarget.style.transform = 'scale(1)');
  const press: MouseEventHandler<HTMLButtonElement> = (e) =>
    (e.currentTarget.style.transform = 'scale(0.96)');

  return (
    <div style={wrapStyle}>
      <button
        onClick={onClick}
        style={btnStyle}
        title={t('resume.aiReview')}
        onMouseEnter={scale}
        onMouseLeave={unscale}
        onMouseDown={press}
        onMouseUp={scale}
      >
        {/* ── Shimmer sweep ── */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(105deg, transparent 35%, rgba(255,255,255,.38) 50%, transparent 65%)',
            animation: 'ai-shimmer 3.4s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* ── Floating sparkle particles (top-right corner) ── */}
        {!isIcon && (
          <>
            <span
              aria-hidden="true"
              style={{
                position: 'absolute', top: 3, right: 9,
                fontSize: 7, color: 'rgba(255,255,255,.9)',
                animation: 'ai-float-a 2.6s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            >✦</span>
            <span
              aria-hidden="true"
              style={{
                position: 'absolute', top: 7, right: 20,
                fontSize: 5, color: 'rgba(255,255,255,.7)',
                animation: 'ai-float-b 3.1s ease-in-out infinite .5s',
                pointerEvents: 'none',
              }}
            >✦</span>
            <span
              aria-hidden="true"
              style={{
                position: 'absolute', top: 2, right: 15,
                fontSize: 6, color: 'rgba(255,255,255,.8)',
                animation: 'ai-float-c 2.9s ease-in-out infinite 1s',
                pointerEvents: 'none',
              }}
            >✦</span>
          </>
        )}

        {/* ── Sparkle icon ── */}
        <Sparkles
          aria-hidden="true"
          style={{
            width: isIcon ? 15 : 14,
            height: isIcon ? 15 : 14,
            flexShrink: 0,
            animation: 'ai-icon 4s ease-in-out infinite',
            filter: 'drop-shadow(0 0 3px rgba(255,255,255,.6))',
          }}
        />

        {/* ── Label ── */}
        {!isIcon && (
          <span style={{ position: 'relative' }}>
            {t('resume.aiReview')}
          </span>
        )}
      </button>
    </div>
  );
}
