import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login";
      const payload = isSignUp 
        ? { email, password, fullName }
        : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng ký/đăng nhập thất bại");
      }

      // Save token and user details to localStorage
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      toast.success(isSignUp ? t("login.create") + "!" : t("login.welcome") + "!");
      
      // Redirect to profile page
      navigate("/profile");
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi khi kết nối với máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-xl font-bold">
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
                <Input 
                  id="name" 
                  placeholder="Nguyễn Văn A" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  required 
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="ban@university.edu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required 
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : (isSignUp ? t("nav.signup") : t("nav.login"))}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isSignUp ? t("login.has_account") : t("login.no_account")}{" "}
            <button 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="font-medium text-primary hover:underline"
              disabled={isLoading}
            >
              {isSignUp ? t("nav.login") : t("nav.signup")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
