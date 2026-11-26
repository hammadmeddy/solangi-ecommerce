import { redirect } from "next/navigation";
import { getActiveSession } from "@/lib/api-auth";

/**
 * Any signed-in member may open /seller: customers see the seller application
 * (or its status) inside SellerShell; approved sellers see their panel.
 */
export default async function SellerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getActiveSession();
  if (!session) redirect(`/${locale}/auth/login`);
  if (session.role === "admin") redirect(`/${locale}/admin/sellers`);
  return children;
}
