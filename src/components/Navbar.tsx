import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Lỗi đọc user", e);
      }
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  const navLinks = [
    { label: t("nav.home"), to: "/" },
    { label: t("nav.explore"), to: "/explore" },
    { label: t("nav.post"), to: "/post" },
    { label: t("nav.pricing"), to: "/pricing" },
    { label: t("nav.transactions"), to: "/transactions" },
    { label: t("nav.profile"), to: "/profile" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <span>Project Graveyard</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                location.pathname === link.to
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Xin chào, {user.fullName}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">{t("nav.login")}</Button>
              </Link>
              <Link to="/login">
                <Button size="sm">{t("nav.signup")}</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-background px-4 pb-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                location.pathname === link.to
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            {user ? (
              <div className="flex flex-col gap-2 border-t pt-2 w-full">
                <span className="text-sm font-medium text-muted-foreground py-2 px-1">
                  Xin chào, {user.fullName}
                </span>
                <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">{t("nav.login")}</Button>
                </Link>
                <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">{t("nav.signup")}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
