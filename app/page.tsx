import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  console.log("SESSION:", session);
  if (!session || !session.user) {
    redirect("/auth/signin");
  }
  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }
  redirect("/dashboard");
}
