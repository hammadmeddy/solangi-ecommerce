import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { SolangiLogo } from "@/components/brand/SolangiLogo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="wrap py-10 md:py-16">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <aside
          className="relative overflow-hidden rounded-2xl px-7 py-10 text-[var(--cream)] md:px-9"
          style={{
            background:
              "linear-gradient(145deg, var(--ink) 0%, #144039 55%, #1a4d44 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-10 h-56 w-56 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(184,146,62,0.35), transparent 65%)",
            }}
            aria-hidden
          />
          <div className="relative mb-6">
            <SolangiLogo size={52} tone="light" showTagline={false} />
          </div>
          <p className="relative mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[var(--gold-light)]">
            solangiecommerce.com
          </p>
          <h1 className="font-display relative mb-3 text-[clamp(2.2rem,4vw,3.2rem)] font-semibold leading-tight">
            Solangi Ecommerce
          </h1>
          <p className="font-display relative mb-5 text-xl italic text-[var(--gold-light)]">
            YOUR TRUST IS OUR WEALTH
          </p>
          <p className="relative max-w-[34ch] text-sm leading-relaxed text-white/75">
            {subtitle}
          </p>
          <Link
            href="/"
            className="relative mt-8 inline-flex text-sm font-semibold text-[var(--gold-light)] hover:text-white"
          >
            ← Back to shop
          </Link>
        </aside>

        <div className="rounded-2xl border border-[var(--line)] bg-white/80 p-6 shadow-[0_18px_40px_rgba(12,36,33,0.06)] md:p-8">
          <h2 className="font-display mb-2 text-[1.85rem] font-semibold leading-tight text-[var(--ink)]">
            {title}
          </h2>
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6 border-t border-[var(--line)] pt-5 text-sm text-[var(--muted)]">{footer}</div> : null}
        </div>
      </div>
    </section>
  );
}
