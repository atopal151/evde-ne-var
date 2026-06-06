import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Tekrar hoş geldiniz"
      subtitle="Hesabınıza giriş yapın ve mutfağınıza devam edin"
    >
      <LoginForm />
    </AuthShell>
  );
}
