import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowRight, Lightbulb, Users, Rocket, Star, Quote, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ApiProject, ApiResponse, ApiPage } from "@/types/api";
import { adaptApiProject } from "@/lib/api";
import type { Project } from "@/data/mockData";

const testimonials = [
  { name: "Emma W.", role: { vi: "Lập trình viên", en: "Developer" }, text: { vi: "Mình có một app code dở nằm trên GitHub mấy tháng. Chỉ trong một tuần trên Project Graveyard, mình đã tìm được designer và marketer để hoàn thành nó.", en: "I had an unfinished app on GitHub for months. Within a week on Project Graveyard, I found a designer and marketer to complete it." } },
  { name: "Ryan T.", role: { vi: "Nhà thiết kế", en: "Designer" }, text: { vi: "Là designer, mình luôn muốn có dự án thật cho portfolio. Nền tảng này kết nối mình với các developer cần đúng kỹ năng của mình.", en: "As a designer, I always wanted real projects for my portfolio. This platform connects me with developers who need my exact skills." } },
  { name: "Priya S.", role: { vi: "Chuyên viên Marketing", en: "Marketer" }, text: { vi: "Mình tham gia một dự án startup với vai trò marketing. Giờ đó là điểm nổi bật nhất trong CV và mình học được nhiều hơn bất kỳ môn học nào.", en: "I joined a startup project as a marketer. It's now the highlight of my CV and I learned more than any course." } },
];

const Landing = () => {
  const { t } = useLanguage();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    fetch("/api/projects?size=3&sort=createdAt,desc")
      .then((r) => r.json())
      .then((body: ApiResponse<ApiPage<ApiProject>>) => {
        setFeaturedProjects((body.data?.content ?? []).map(adaptApiProject));
      })
      .catch(() => {})
      .finally(() => setLoadingFeatured(false));
  }, []);

  const steps = [
    { icon: Lightbulb, title: t("landing.step1.title"), desc: t("landing.step1.desc") },
    { icon: Users, title: t("landing.step2.title"), desc: t("landing.step2.desc") },
    { icon: Rocket, title: t("landing.step3.title"), desc: t("landing.step3.desc") },
  ];

  const benefits = [
    t("landing.benefit1"),
    t("landing.benefit2"),
    t("landing.benefit3"),
    t("landing.benefit4"),
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-primary" /> {t("landing.badge")}
            </div>
            <h1 
              className="mb-6 text-4xl md:text-6xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif" }}
            >
              Biến dự án bỏ dở thành <br className="hidden md:block" />
              <span className="text-primary" style={{ fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif" }}>tài sản giá trị</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">{t("landing.subtitle")}</p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/explore">
                <Button size="lg" className="gap-2">{t("landing.cta.explore")} <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link to="/post">
                <Button variant="outline" size="lg">{t("landing.cta.post")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t">
        <div className="container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 font-display text-3xl font-bold">{t("landing.problem.title")}</h2>
            <p className="text-lg text-muted-foreground">{t("landing.problem.desc")}</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30">
        <div className="container py-20">
          <h2 className="mb-12 text-center font-display text-3xl font-bold">{t("landing.how.title")}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="rounded-xl border bg-card p-6 text-center card-hover">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <section className="border-t">
        <div className="container py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">{t("landing.featured.title")}</h2>
              <p className="mt-2 text-muted-foreground">{t("landing.featured.sub")}</p>
            </div>
            <Link to="/explore" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">
              {t("landing.featured.all")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {loadingFeatured ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : featuredProjects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-10">Chưa có dự án nào. Hãy là người đầu tiên đăng!</p>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t bg-muted/30">
        <div className="container py-20">
          <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="mb-4 font-display text-3xl font-bold">{t("landing.benefits.title")}</h2>
              <p className="text-muted-foreground">{t("landing.benefits.sub")}</p>
            </div>
            <div className="space-y-4">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border bg-card p-4">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">✓</div>
                  <span className="text-sm font-medium">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t">
        <div className="container py-20">
          <h2 className="mb-12 text-center font-display text-3xl font-bold">{t("landing.testimonials.title")}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((item, i) => (
              <div key={i} className="rounded-xl border bg-card p-6 card-hover">
                <Quote className="mb-3 h-5 w-5 text-primary/40" />
                <p className="mb-4 text-sm text-muted-foreground">{item.text.vi}</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role.vi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t gradient-hero">
        <div className="container py-20 text-center">
          <h2 className="mb-4 font-display text-3xl font-bold">{t("landing.cta2.title")}</h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">{t("landing.cta2.sub")}</p>
          <div className="flex justify-center gap-3">
            <Link to="/explore">
              <Button size="lg">{t("landing.cta2.btn")}</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
