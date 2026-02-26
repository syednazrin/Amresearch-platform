import { redirect } from "next/navigation";

/** Alpha Mindset section is disabled. Redirect to admin dashboard. */
export default function AdminAlphaMindsetPage() {
  redirect("/admin");
}
