type Props = {
  /** mark | full */
  variant?: "mark" | "full";
  size?: number;
  className?: string;
  tone?: "dark" | "light";
  showTagline?: boolean;
};

/** Solangi brand mark — teal & gold “S” with cart. */
export function SolangiLogo({
  variant = "full",
  size = 44,
  className = "",
  tone = "dark",
  showTagline = true,
}: Props) {
  const titleColor = tone === "light" ? "text-white" : "text-[var(--ink)]";
  const muted = tone === "light" ? "text-white/65" : "text-[var(--muted)]";
  const gold = tone === "light" ? "text-[var(--gold-light)]" : "text-[var(--gold)]";

  return (
    <span className={`inline-flex items-center gap-3 min-w-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/solangi-mark.png"
        alt="Solangi Ecommerce"
        width={size}
        height={size}
        className="shrink-0 object-contain drop-shadow-[0_6px_14px_rgba(12,36,33,0.18)]"
      />
      {variant === "full" ? (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className={`font-display text-[1.15rem] md:text-[1.35rem] font-bold tracking-tight ${titleColor}`}>
            Solangi
            <span className={`ms-1.5 text-[0.72em] font-semibold ${gold}`}>Ecommerce</span>
          </span>
          {showTagline ? (
            <span className={`mt-0.5 hidden text-[0.625rem] uppercase tracking-[0.14em] sm:block ${muted}`}>
              Your trust is our wealth
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
