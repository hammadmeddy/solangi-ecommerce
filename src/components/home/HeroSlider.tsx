"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAdminMedia } from "@/components/providers/AdminMediaProvider";

type Cta =
  | { kind: "hash"; href: string; label: string }
  | { kind: "route"; href: "/seller"; label: string };

export function HeroSlider() {
  const t = useTranslations("Hero");
  const { media } = useAdminMedia();
  const [index, setIndex] = useState(0);

  const slides: {
    kicker: string;
    brand: string;
    copy: string;
    cta: Cta;
    cta2: Cta;
    image: string;
    alt: string;
  }[] = [
    {
      kicker: t("kicker"),
      brand: t("brand"),
      copy: t("copy"),
      cta: { kind: "hash", href: "#featured", label: t("ctaShop") },
      cta2: { kind: "route", href: "/seller", label: t("ctaSell") },
      image: "/heroes/retail.jpg",
      alt: "Solangi retail marketplace",
    },
    {
      kicker: t("slide2Kicker"),
      brand: t("slide2Brand"),
      copy: t("slide2Copy"),
      cta: { kind: "hash", href: "#flash", label: t("slide2Cta") },
      cta2: { kind: "hash", href: "#trending", label: t("slide2Cta2") },
      image: "/heroes/flash.jpg",
      alt: "Solangi flash deals",
    },
    {
      kicker: t("slide3Kicker"),
      brand: t("slide3Brand"),
      copy: t("slide3Copy"),
      cta: { kind: "hash", href: "#top", label: t("slide3Cta") },
      cta2: { kind: "hash", href: "#join", label: t("slide3Cta2") },
      image: "/heroes/modes.jpg",
      alt: "Solangi marketplace modes",
    },
  ];

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5600);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section className="relative isolate min-h-[min(78vh,640px)] overflow-hidden" aria-label="Hero">
      {slides.map((slide, i) => {
        const override = media.heroImages[String(i)];
        return (
        <div
          key={slide.kicker + i}
          className={`absolute inset-0 grid items-end transition-opacity duration-700 ${
            i === index ? "opacity-100 z-[1] pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          {override ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={override}
              alt={slide.alt}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          ) : (
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, rgba(12,36,33,0.92) 0%, rgba(12,36,33,0.72) 38%, rgba(12,36,33,0.35) 68%, rgba(12,36,33,0.2) 100%)",
            }}
          />
          <div
            className="hero-atmosphere pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                "radial-gradient(circle at 78% 28%, rgba(232,213,163,0.18), transparent 32%)",
            }}
          />
          <div className="hero-content-anim relative z-[2] mx-auto mb-14 w-[min(100%-2rem,var(--max))] max-w-[620px] px-0 pt-16 text-[var(--cream)] md:ml-[max(1rem,calc((100%-var(--max))/2+1rem))] md:mr-auto md:pt-[4.5rem]">
            <p className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-[var(--gold-light)]">
              {slide.kicker}
            </p>
            <h1 className="font-display mb-2 text-[clamp(2.4rem,7vw,4.6rem)] font-semibold leading-[0.95] tracking-tight">
              {slide.brand}
            </h1>
            <p className="font-display mb-4 text-[clamp(1.15rem,2.4vw,1.55rem)] italic font-medium text-[var(--gold-light)]">
              {t("tagline")}
            </p>
            <p className="mb-6 max-w-[34ch] text-base font-light text-[rgba(247,244,238,0.82)]">
              {slide.copy}
            </p>
            <div className="flex flex-wrap gap-3">
              <HeroCta cta={slide.cta} variant="primary" />
              <HeroCta cta={slide.cta2} variant="ghost" />
            </div>
          </div>
        </div>
      );
      })}

      <div className="absolute bottom-5 left-[max(1rem,calc((100%-var(--max))/2+1rem))] z-[3] flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-[3px] rounded-sm transition-all ${
              i === index ? "w-[42px] bg-[var(--gold-light)]" : "w-7 bg-white/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function HeroCta({
  cta,
  variant,
}: {
  cta: Cta;
  variant: "primary" | "ghost";
}) {
  const className =
    variant === "primary"
      ? "inline-flex items-center rounded-full bg-[var(--gold)] px-5 py-3 text-[0.9rem] font-semibold text-[var(--ink)] hover:bg-[var(--gold-light)] transition-colors"
      : "inline-flex items-center rounded-full border border-white/35 px-5 py-3 text-[0.9rem] font-semibold text-[var(--cream)] hover:border-white hover:bg-white/5 transition-colors";

  if (cta.kind === "hash") {
    return (
      <a href={cta.href} className={className}>
        {cta.label}
      </a>
    );
  }

  return (
    <Link href={cta.href} className={className}>
      {cta.label}
    </Link>
  );
}
