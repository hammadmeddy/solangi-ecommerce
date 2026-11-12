import { setRequestLocale } from "next-intl/server";
import { AdminReviews } from "@/components/admin/AdminReviews";

export default async function AdminReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminReviews />;
}
