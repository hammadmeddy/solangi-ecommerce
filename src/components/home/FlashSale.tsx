"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FLASH_PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/catalog/ProductCard";

export function FlashSale() {
  const t = useTranslations("Flash");
  const [remain, setRemain] = useState(4 * 3600 + 32 * 60 + 18);

  useEffect(() => {
    const id = setInterval(() => setRemain((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const h = String(Math.floor(remain / 3600)).padStart(2, "0");
  const m = String(Math.floor((remain % 3600) / 60)).padStart(2, "0");
  const s = String(remain % 60).padStart(2, "0");

  return (
    <section
      id="flash"
      className="border-y border-[var(--line)] py-14"
      style={{
        background:
          "linear-gradient(135deg, rgba(168,76,46,0.08), transparent 40%), linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.2))",
      }}
    >
      <div className="wrap">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[clamp(1.8rem,3vw,2.35rem)] font-semibold leading-tight">
              {t("title")}
            </h2>
            <p className="mt-1 max-w-[40ch] text-[0.95rem] text-[var(--muted)]">{t("sub")}</p>
          </div>
          <div className="flex items-center gap-1.5 font-semibold tabular-nums" aria-label="Sale ends in">
            {[h, m, s].map((part, i) => (
              <span key={i} className="contents">
                {i > 0 ? <span>:</span> : null}
                <span className="countdown-tick min-w-[2.4rem] rounded-md bg-[var(--ink)] px-2 py-1.5 text-center text-[0.9rem] text-[var(--cream)]">
                  {part}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {FLASH_PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
