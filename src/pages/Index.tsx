import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowRight, Lightbulb, Users, Rocket, Star, Quote, Loader2, Building2, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ApiProject, ApiResponse, ApiPage } from "@/types/api";
import { adaptApiProject } from "@/lib/api";
import type { Project } from "@/data/mockData";

const testimonials = [
  { name: "Nguyễn Dev", role: "Lập trình viên", text: "Mình có một app code dở nằm trên GitHub mấy tháng. Chỉ trong một tuần trên Project Graveyard, mình đã tìm được người mua lại và hoàn vốn." },
  { name: "Trần Designer", role: "Nhà thiết kế", text: "Tìm được project từ công ty để hợp tác, học hỏi công nghệ mới và có thêm thu nhập từ dự án thật." },
  { name: "Lê Startup", role: "Founder", text: "Mua lại một MVP bỏ dở, cải tiến thêm 2 tháng và launch thành sản phẩm thật. Tiết kiệm hơn làm từ đầu rất nhiều." },
];

function useFetchProjects(listingType: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects?listingType=${listingType}&size=6&sort=createdAt,desc`)
      .then((r) => r.json())
      .then((body: ApiResponse<ApiPage<ApiProject>>) => {
        setProjects((body.data?.content ?? []).map(adaptApiProject));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listingType]);

  return { projects, loading };
}

const Landing = () => {
  const { t } = useLanguage();
  const { projects: companyProjects, loading: companyLoading } = useFetchProjects("COMPANY_SHOWCASE");
  const { projects: userProjects, loading: userLoading } = useFetchProjects("ABANDONED_PROJECT");

  const steps = [
    { icon: Lightbulb, title: t("landing.step1.title"), desc: t("landing.step1.desc") },
    { icon: Users, title: t("landing.step2.title"), desc: t("landing.step2.desc") },
    { icon: Rocket, title: t("landing.step3.title"), desc: t("landing.step3.desc") },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-primary" /> Nơi project bỏ dở tìm được cuộc sống mới
            </div>
            <h1 className="mb-6 text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Biến dự án bỏ dở thành <br className="hidden md:block" />
              <span className="text-primary">tài sản giá trị</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Mua, bán, hợp tác với các project dang dở. Hoặc khám phá các giải pháp từ công ty phần mềm.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/explore">
                <Button size="lg" className="gap-2">Khám phá ngay <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link to="/post">
                <Button variant="outline" size="lg">Đăng project của bạn</Button>
              </Link>
            </div>
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

      {/* Company Showcase Section */}
      <section className="border-t">
        <div className="container py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Building2 className="h-4 w-4" /> Project từ công ty
              </div>
              <h2 className="font-display text-2xl font-bold">Giải pháp & sản phẩm từ công ty phần mềm</h2>
              <p className="mt-1 text-muted-foreground text-sm">Các project được đội ngũ nền tảng chọn lọc và đăng tải từ các công ty uy tín</p>
            </div>
            <Link to="/explore?type=COMPANY_SHOWCASE" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">
              Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {companyLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : companyProjects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {companyProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          ) : (
            <div className="rounded-xl border bg-muted/30 p-10 text-center">
              <Building2 className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Chưa có project công ty nào. Admin sẽ sớm đăng tải.</p>
            </div>
          )}
        </div>
      </section>

      {/* Abandoned Project Section */}
      <section className="border-t bg-muted/30">
        <div className="container py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                <GitBranch className="h-4 w-4" /> Project từ người dùng
              </div>
              <h2 className="font-display text-2xl font-bold">Project bỏ dở tìm người tiếp tục</h2>
              <p className="mt-1 text-muted-foreground text-sm">Các project dang dở đang tìm người mua lại, hợp tác hoặc tiếp tục phát triển</p>
            </div>
            <Link to="/explore?type=ABANDONED_PROJECT" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">
              Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {userLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : userProjects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          ) : (
            <div className="rounded-xl border bg-card p-10 text-center">
              <GitBranch className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Chưa có project nào được duyệt. Hãy là người đầu tiên đăng!</p>
              <Link to="/post" className="mt-3 inline-block">
                <Button size="sm" variant="outline">Đăng project bỏ dở của bạn</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t">
        <div className="container py-20">
          <h2 className="mb-12 text-center font-display text-3xl font-bold">Họ nói gì về Project Graveyard</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((item, i) => (
              <div key={i} className="rounded-xl border bg-card p-6 card-hover">
                <Quote className="mb-3 h-5 w-5 text-primary/40" />
                <p className="mb-4 text-sm text-muted-foreground">{item.text}</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
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
          <h2 className="mb-4 font-display text-3xl font-bold">Bắt đầu ngay hôm nay</h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">Đăng project bỏ dở hoặc tìm project phù hợp để mua, hợp tác hoặc tiếp tục phát triển.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/explore"><Button size="lg">Khám phá Marketplace</Button></Link>
            <Link to="/post"><Button size="lg" variant="outline">Đăng project bỏ dở</Button></Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
