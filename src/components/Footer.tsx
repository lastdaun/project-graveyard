import { Skull } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
              <Skull className="h-5 w-5 text-primary" />
              Project Graveyard
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">{t("footer.desc")}</p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-sm">{t("footer.platform")}</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/explore" className="hover:text-foreground transition-colors">{t("nav.explore")}</Link>
              <Link to="/post" className="hover:text-foreground transition-colors">{t("nav.post")}</Link>
              <Link to="/profile" className="hover:text-foreground transition-colors">{t("footer.yourProfile")}</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-sm">{t("footer.resources")}</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer transition-colors">{t("footer.howItWorks")}</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">{t("footer.faq")}</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">{t("footer.blog")}</span>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-sm">{t("footer.connect")}</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer transition-colors">Twitter</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Discord</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">GitHub</span>
              <Link to="/admin" className="hover:text-foreground transition-colors">{t("footer.admin")}</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
