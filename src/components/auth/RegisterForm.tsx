"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export function RegisterForm() {
  const router = useRouter();
  const t = useTranslations("auth");
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
      setError(t("passwordMinError"));
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
          label={t("fullName")}
          name="full_name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={t("fullNamePlaceholder")}
          required
        />
        <Input
          label={t("email")}
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label={t("password")}
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={t("passwordMin")}
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

        <p className="text-xs leading-relaxed text-navy-500">{t("privacyNote")}</p>

        <Button type="submit" fullWidth size="lg" disabled={submitting}>
          <UserPlus className="h-4 w-4" />
          {submitting ? t("registerSubmitting") : t("registerSubmit")}
        </Button>
      </form>
    </Card>
  );
}
