import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardUI from "./client";

export default async function DashboardPage() {
  const auth = await isAuthenticated();
  if (!auth) redirect("/dashboard/login");
  return <DashboardUI />;
}