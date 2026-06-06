"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export function RegisterForm() {
  const router = useRouter();
  const { signUp, signIn } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı");
      setSubmitting(false);
      return;
    }

    const err = await signUp(email.trim(), password, fullName.trim());
    if (err) {
      setError(err);
      setSubmitting(false);
      return;
    }

    const loginErr = await signIn(email.trim(), password);
    if (loginErr) {
      router.push("/login");
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
          label="Ad Soyad"
          name="full_name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Adınız Soyadınız"
          required
        />
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
          type="password"
          autoComplete="new-password"
          placeholder="En az 6 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <p className="text-xs leading-relaxed text-navy-500">
          Kayıt olarak kendi mutfak evinizi oluşturursunuz. Stok, tarif ve
          alışveriş verileriniz güvenle bulutta saklanır.
        </p>

        <Button type="submit" fullWidth size="lg" disabled={submitting}>
          <UserPlus className="h-4 w-4" />
          {submitting ? "Hesap oluşturuluyor..." : "Ücretsiz Kayıt Ol"}
        </Button>
      </form>
    </Card>
  );
}
