import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogsUI from "./client";

export default async function LogsPage() {
  const auth = await isAuthenticated();
  if (!auth) redirect("/dashboard/login");
  return <LogsUI />;
}
