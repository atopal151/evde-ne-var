"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const err = await signIn(email.trim(), password);
    if (err) {
      setError(err);
      setSubmitting(false);
      return;
    }

    router.refresh();
    router.push("/");
  };

  return (
    <Card padding="lg" className="shadow-md">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <Input
          label="E-posta"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ornek@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Şifre"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="rounded-lg p-1 text-navy-400 transition-colors hover:text-navy-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-200"
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" disabled={submitting}>
          <LogIn className="h-4 w-4" />
          {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>
    </Card>
  );
}
