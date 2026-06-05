import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, Mail, Calendar, Flag, Handshake, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockProjects, collaborationBadge, getCollabLabel } from "@/data/mockData";
import { toast } from "sonner";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const statusColor: Record<string, string> = {
  "Ý tưởng": "tag-warning",
  "Nguyên mẫu": "tag-primary",
  "Đang phát triển": "tag-accent",
};

const ProjectDetails = () => {
  const { id } = useParams();
  const project = mockProjects.find((p) => p.id === id);
  const [reportOpen, setReportOpen] = useState(false);
  const { t } = useLanguage();

  const reportReasons = [t("project.report.r1"), t("project.report.r2"), t("project.report.r3")];

  if (!project) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold">{t("project.notfound")}</h1>
          <Link to="/explore" className="mt-4 inline-block text-primary hover:underline">← {t("project.back")}</Link>
        </div>
      </div>
    );
  }

  const handleReport = (reason: string) => {
    toast.success(`${t("project.report")}: "${reason}"`);
    setReportOpen(false);
  };

  const badge = collaborationBadge[project.collaborationMode];
  const collabLabel = getCollabLabel(project);
  const isPaid = project.collaborationMode === "Sell Usage Rights";

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10">
        <Link to="/explore" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t("project.back")}
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`tag ${statusColor[project.status]}`}>{project.status}</span>
                <span className="tag tag-muted">{project.category}</span>
                <span className={`tag ${badge.className}`}>{collabLabel}</span>
                <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                  <DialogTrigger asChild>
                    <button className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                      <Flag className="h-3.5 w-3.5" /> {t("project.report")}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t("project.report.title")}</DialogTitle>
                      <DialogDescription>{t("project.report.desc")} "{project.title}"</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 pt-2">
                      {reportReasons.map((reason) => (
                        <button
                          key={reason}
                          onClick={() => handleReport(reason)}
                          className="w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-destructive/5 hover:border-destructive/30 hover:text-destructive active:scale-[0.98]"
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <h1 className="font-display text-3xl font-bold">{project.title}</h1>
            </div>

            <div>
              <h2 className="mb-2 font-semibold">{t("project.description")}</h2>
              <p className="text-muted-foreground leading-relaxed">{project.description}</p>
            </div>

            <div>
              <h2 className="mb-2 font-semibold">{t("project.progress")}</h2>
              <div className="mb-1 flex justify-between text-sm text-muted-foreground">
                <span>{project.status}</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>

            <div>
              <h2 className="mb-3 font-semibold">{t("project.techstack")}</h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span key={tech} className="rounded-lg border bg-card px-3 py-1.5 text-sm font-medium font-mono">{tech}</span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 font-semibold">{t("project.skills")}</h2>
              <div className="flex flex-wrap gap-2">
                {project.skillsNeeded.map((s) => (
                  <span key={s} className="tag tag-primary">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 font-semibold">
                <Handshake className="h-5 w-5 text-primary" />
                {t("project.collab.title")}
              </div>
              <div className="rounded-lg bg-muted/60 p-4 space-y-2">
                <span className={`tag ${badge.className} text-sm`}>{collabLabel}</span>
                {isPaid && (
                  <div className="flex items-center gap-1.5 text-2xl font-bold text-foreground">
                    {(project.price ?? 0).toLocaleString("vi-VN")}₫
                    <span className="text-sm font-normal text-muted-foreground">{t("project.collab.onetime")}</span>
                  </div>
                )}
                {project.collaborationMode === "Profit Sharing" && (
                  <p className="text-sm text-muted-foreground">
                    {t("project.profitsplit.you")} {project.equitySplit}% · {t("project.profitsplit.them")} {100 - (project.equitySplit ?? 50)}% {t("project.profitsplit.profit")}
                  </p>
                )}
                {project.collaborationMode === "Find Co-founder" && (
                  <p className="text-sm text-muted-foreground">{t("project.collab.equity")}</p>
                )}
                {project.collaborationMode === "Free Collaboration" && (
                  <p className="text-sm text-muted-foreground">{t("project.collab.free")}</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {project.creator.avatar}
                </div>
                <div>
                  <p className="font-semibold">{project.creator.name}</p>
                  <p className="text-xs text-muted-foreground">{t("project.creator")}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{project.currentMembers} / {project.teamSize} {t("project.members")}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{t("project.postedon")} {project.createdAt}</span>
              </div>

              <div className="space-y-2">
                {isPaid ? (
                  <Button className="w-full" onClick={() => toast.success("✓")}>
                    <DollarSign className="mr-2 h-4 w-4" /> {t("project.buy")} — {(project.price ?? 0).toLocaleString("vi-VN")}₫
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => toast.success("✓")}>
                    <Users className="mr-2 h-4 w-4" /> {t("project.join")}
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => toast.success("✓")}>
                  <Mail className="mr-2 h-4 w-4" /> {t("project.contact")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectDetails;
