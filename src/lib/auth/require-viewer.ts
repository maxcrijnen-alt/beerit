import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";

export async function requireViewer() {
  const viewer = await getViewer();

  if (!viewer) {
    redirect("/auth?notice=Start%20guest%20mode%20or%20sign%20in%20to%20continue.");
  }

  return viewer;
}
