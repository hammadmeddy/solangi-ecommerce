import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { routing } from "@/i18n/routing";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CustomerProvider } from "@/components/providers/CustomerProvider";
import { SellerProvider } from "@/components/providers/SellerProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { AdminMediaProvider } from "@/components/providers/AdminMediaProvider";
import { AnnouncementBar } from "@/components/chrome/AnnouncementBar";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL("https://solangiecommerce.com"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === "ur" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${cormorant.variable} ${outfit.variable}`}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <AdminMediaProvider>
              <CustomerProvider>
                <SellerProvider>
                  <CartProvider>
                    <CurrencyProvider>
                      <AnnouncementBar />
                      <Header />
                      <main>{children}</main>
                      <Footer />
                    </CurrencyProvider>
                  </CartProvider>
                </SellerProvider>
              </CustomerProvider>
            </AdminMediaProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
