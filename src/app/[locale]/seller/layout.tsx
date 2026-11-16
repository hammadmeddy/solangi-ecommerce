import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function SellerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  if (!session) redirect(`/${locale}/auth/login`);
  if (session.role !== "seller" && session.role !== "admin") {
    redirect(`/${locale}/account`);
  }
  return children;
}
