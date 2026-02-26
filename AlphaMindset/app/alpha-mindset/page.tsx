import { redirect } from "next/navigation";

/** Alpha Mindset section is disabled. Redirect to home. */
export default function AlphaMindsetPage() {
  redirect("/");
}
