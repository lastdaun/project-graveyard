import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Flag, DollarSign, Loader2, Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Project } from "@/data/mockData";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ApiProject, ApiResponse } from "@/types/api";
import { adaptApiProject, apiFetch, isAuthenticated } from "@/lib/api";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [buying, setBuying] = useState(false);

  const reportReasons = [t("project.report.r1"), t("project.report.r2"), t("project.report.r3")];

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setNotFound(false);

    fetch(`/api/projects/${id}`)
      .then(async (res) => {
        if (res.status === 404) { setNotFound(true); return; }
        const body: ApiResponse<ApiProject> = await res.json();
        if (body.data) setProject(adaptApiProject(body.data));
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleReport = (reason: string) => {
    toast.success(`${t("project.report")}: "${reason}"`);
    setReportOpen(false);
  };

  const handleBuy = async () => {
    if (!isAuthenticated()) {
      toast.error("Đăng nhập để mua project");
      navigate("/login");
      return;
    }
    if (!project) return;
    setBuying(true);
    try {
      const createRes = await apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({ projectId: Number(project.id) }),
      });
      const createBody = await createRes.json();
      if (!createRes.ok) throw new Error(createBody?.message || "Tạo đơn thất bại");

      const orderId = createBody.data.id;
      const payRes = await apiFetch(`/api/orders/${orderId}/mock-pay`, { method: "PATCH" });
      const payBody = await payRes.json();
      if (!payRes.ok) throw new Error(payBody?.message || "Thanh toán thất bại");

      toast.success("Mua thành công! Xem tại Đơn mua.");
      navigate("/profile?tab=purchases");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi mua hàng");
    } finally {
      setBuying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (notFound || !project) {
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

  const isCompany = project.listingType === "COMPANY_PROJECT";
  const isIncomplete = project.listingType === "USER_INCOMPLETE_PROJECT" || project.completionStatus === "INCOMPLETE";

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10">
        <Link to="/explore" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t("project.back")}
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="tag tag-primary">
                  {isCompany ? "Sản phẩm công ty" : "Project cộng đồng"}
                </span>
                <span className="tag tag-muted">{project.category}</span>
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
                          className="w-full rounded-lg border px-4 py-3 text-left text-sm font-medium hover:bg-destructive/5"
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
              <h2 className="mb-2 font-semibold">Mô tả</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </div>

            {isIncomplete && (
              <>
                <div>
                  <h2 className="mb-2 font-semibold">% hoàn thiện</h2>
                  <div className="mb-1 flex justify-between text-sm text-muted-foreground">
                    <span>{project.currentStage || project.status}</span>
                    <span>{project.completionPercent ?? project.progress}%</span>
                  </div>
                  <Progress value={project.completionPercent ?? project.progress} className="h-2" />
                </div>
                {project.completedParts && (
                  <div>
                    <h2 className="mb-2 font-semibold">Phần đã làm</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">{project.completedParts}</p>
                  </div>
                )}
                {project.missingParts && (
                  <div>
                    <h2 className="mb-2 font-semibold">Phần còn thiếu</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">{project.missingParts}</p>
                  </div>
                )}
              </>
            )}

            {isCompany && project.companyName && (
              <div className="rounded-xl border p-4 space-y-2">
                <h2 className="font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Thông tin công ty
                </h2>
                <p>{project.companyName}</p>
                {project.companyWebsite && (
                  <a href={project.companyWebsite} target="_blank" rel="noreferrer" className="text-primary text-sm inline-flex items-center gap-1">
                    Website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}

            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline text-sm">
                Xem demo <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            {project.techStack && project.techStack.length > 0 && (
              <div>
                <h2 className="mb-3 font-semibold">Tech stack</h2>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="rounded-lg border bg-card px-3 py-1.5 text-sm font-medium font-mono">{tech}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Giá bán</p>
              <p className="text-3xl font-bold">
                {(project.price ?? 0).toLocaleString("vi-VN")}₫
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{project.createdAt ? new Date(project.createdAt).toLocaleDateString("vi-VN") : ""}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Người đăng:{" "}
                {project.creator.id != null ? (
                  <Link
                    to={`/profile/${project.creator.id}`}
                    className="text-foreground font-medium hover:text-primary underline-offset-4 hover:underline"
                  >
                    {project.creator.name}
                  </Link>
                ) : (
                  project.creator.name
                )}
              </p>
              <Button className="w-full" disabled={buying || !project.price} onClick={handleBuy}>
                <DollarSign className="mr-2 h-4 w-4" />
                {buying ? "Đang xử lý..." : `Mua project — ${(project.price ?? 0).toLocaleString("vi-VN")}₫`}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectDetails;
