import { redirect } from "next/navigation";
import { getUsuarioAtual } from "@/lib/current-user";

export default async function Home() {
  const sessao = await getUsuarioAtual();
  if (sessao) redirect("/dashboard");
  redirect("/login");
}
