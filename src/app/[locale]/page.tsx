import { setRequestLocale } from "next-intl/server";
import { ModeCategories } from "@/components/home/ModeCategories";
import { HeroSlider } from "@/components/home/HeroSlider";
import { FlashSale } from "@/components/home/FlashSale";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { SellerSpotlight } from "@/components/home/SellerSpotlight";
import { JoinStrip } from "@/components/home/JoinStrip";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Reviews } from "@/components/home/Reviews";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <div id="top" />
      {/* Module 1 — Homepage (locked design order) */}
      <ModeCategories />
      <HeroSlider />
      <FlashSale />
      <FeaturedProducts />
      <TrendingProducts />
      <SellerSpotlight />
      <JoinStrip />
      <WhyChooseUs />
      <Reviews />
    </>
  );
}
