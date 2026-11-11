import { setRequestLocale } from "next-intl/server";
import { SearchView } from "@/components/search/SearchView";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    mode?: string;
    cat?: string;
    min?: string;
    max?: string;
    sort?: string;
  }>;
}) {
  const { locale } = await params;
  const initial = await searchParams;
  setRequestLocale(locale);
  return <SearchView initial={initial} />;
}
