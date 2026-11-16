const SIZES = {
  sm: 56,
  md: 84,
  lg: 112,
} as const;

/** Branded dual-ring loader. Safe in server components, including route `loading` files. */
export function PremiumLoader({
  label,
  size = "md",
  variant = "page",
}: {
  label?: string;
  size?: keyof typeof SIZES;
  variant?: "page" | "panel" | "spinner";
}) {
  if (variant === "spinner") {
    return <span className="premium-spinner" aria-hidden="true" />;
  }

  const px = SIZES[size];
  const body = (
    <div className="premium-loader" role="status" aria-live="polite">
      <div className="premium-loader__stage" style={{ width: px, height: px }}>
        <span className="premium-loader__glow" />
        <span className="premium-loader__ring premium-loader__ring--gold" />
        <span className="premium-loader__ring premium-loader__ring--teal" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo/solangi-mark.png"
          alt=""
          width={Math.round(px * 0.42)}
          height={Math.round(px * 0.42)}
          className="premium-loader__mark"
        />
      </div>
      {label ? <p className="premium-loader__label">{label}</p> : <span className="sr-only">Loading</span>}
    </div>
  );

  if (variant === "panel") {
    return <div className="flex justify-center py-10">{body}</div>;
  }

  return (
    <section className="wrap flex min-h-[46vh] items-center justify-center py-16">{body}</section>
  );
}
