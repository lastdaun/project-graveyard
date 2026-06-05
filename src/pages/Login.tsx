import { useState } from "react";
import { Link } from "react-router-dom";
import { Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isSignUp ? t("login.create") + "!" : t("login.welcome") + "!");
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-xl font-bold">
            <Skull className="h-6 w-6 text-primary" />
            Project Graveyard
          </Link>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="mb-1 font-display text-xl font-bold">
            {isSignUp ? t("login.create") : t("login.welcome")}
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            {isSignUp ? t("login.sub.signup") : t("login.sub.login")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">{t("login.name")}</Label>
                <Input id="name" placeholder="Nguyễn Văn A" required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input id="email" type="email" placeholder="ban@university.edu" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input id="password" type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full">
              {isSignUp ? t("nav.signup") : t("nav.login")}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isSignUp ? t("login.has_account") : t("login.no_account")}{" "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-primary hover:underline">
              {isSignUp ? t("nav.login") : t("nav.signup")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
