import { redirect } from "next/navigation";

// Registration disabled for security; redirect to login
export default function RegisterPage() {
  redirect("/auth/v2/login");
}
