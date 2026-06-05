import { Link } from "react-router-dom";
import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockProjects } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";

const userSkills = ["React", "TypeScript", "UI/UX Design", "Node.js", "Figma"];
const createdProjects = mockProjects.slice(0, 2);
const joinedProjects = mockProjects.slice(3, 5);

const Profile = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-4xl py-10">
        <div className="mb-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">AC</div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">Alex Chen</h1>
            <p className="text-muted-foreground">Khoa học Máy tính • Đại học Công nghệ</p>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> TP. Hồ Chí Minh
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <ExternalLink className="h-3.5 w-3.5" /> {t("profile.edit")}
          </Button>
        </div>

        <div className="mb-8">
          <h2 className="mb-3 font-display text-lg font-semibold">{t("profile.skills")}</h2>
          <div className="flex flex-wrap gap-2">
            {userSkills.map((s) => (<span key={s} className="tag tag-primary">{s}</span>))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 font-display text-lg font-semibold">{t("profile.created")}</h2>
          <div className="space-y-3">
            {createdProjects.map((p) => (
              <Link key={p.id} to={`/project/${p.id}`} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30">
                <div className="flex-1">
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-muted-foreground">{p.category} · {p.status}</p>
                </div>
                <div className="hidden w-32 sm:block">
                  <Progress value={p.progress} className="h-1.5" />
                  <p className="mt-1 text-right text-xs text-muted-foreground">{p.progress}%</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 font-display text-lg font-semibold">{t("profile.joined")}</h2>
          <div className="space-y-3">
            {joinedProjects.map((p) => (
              <Link key={p.id} to={`/project/${p.id}`} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30">
                <div className="flex-1">
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-muted-foreground">{p.category} · {p.status}</p>
                </div>
                <div className="hidden w-32 sm:block">
                  <Progress value={p.progress} className="h-1.5" />
                  <p className="mt-1 text-right text-xs text-muted-foreground">{p.progress}%</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg font-semibold">{t("profile.portfolio")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {["Website cá nhân", "Thư viện Design System"].map((item) => (
              <div key={item} className="rounded-xl border bg-card p-5 card-hover">
                <div className="mb-3 h-24 rounded-lg bg-muted" />
                <p className="font-semibold">{item}</p>
                <p className="text-sm text-muted-foreground">Dự án showcase</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
