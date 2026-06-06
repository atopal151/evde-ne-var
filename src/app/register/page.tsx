import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Hesap oluşturun"
      subtitle="Dakikalar içinde akıllı mutfak asistanınızı kurun"
    >
      <RegisterForm />
    </AuthShell>
  );
}
