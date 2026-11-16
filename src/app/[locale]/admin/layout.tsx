import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  if (!session) redirect(`/${locale}/auth/admin`);
  if (session.role !== "admin") redirect(`/${locale}/account`);
  return children;
}
