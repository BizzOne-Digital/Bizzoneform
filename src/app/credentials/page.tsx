import type { Metadata } from "next";
import CredentialsForm from "@/components/CredentialsForm";

export const metadata: Metadata = {
  title: "Website Credentials | BizzOne Digital",
  description: "Securely submit website credentials to BizzOne Digital",
  robots: { index: false, follow: false },
};

export default async function CredentialsPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <CredentialsForm token={token} />;
}
