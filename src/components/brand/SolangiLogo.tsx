type Props = {
  /** mark | full */
  variant?: "mark" | "full";
  size?: number;
  className?: string;
  tone?: "dark" | "light";
  showTagline?: boolean;
};

/** Solangi brand mark — gold trust spark on a teal seal. */
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
        src="/logo/solangi-mark.svg"
        alt=""
        width={size}
        height={size}
        className="shrink-0 drop-shadow-[0_6px_14px_rgba(12,36,33,0.18)]"
      />
      {variant === "full" ? (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className={`font-display text-[1.15rem] md:text-[1.35rem] font-bold tracking-tight ${titleColor}`}>
            Solangi
            <span className={`ms-1.5 text-[0.72em] font-semibold ${gold}`}>Ecommerce</span>
          </span>
          {showTagline ? (
            <span className={`hidden sm:block text-[0.625rem] uppercase tracking-[0.14em] ${muted} mt-0.5`}>
              Your trust is our wealth
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
