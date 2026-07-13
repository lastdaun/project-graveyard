import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Mail, Phone, Calendar, Flag, ShoppingCart, ExternalLink,
  Clock, Shield, Loader2, Building2, GitBranch, Globe, MessageCircle,
} from "lucide-react";
import { PriceComparisonBadge } from "@/components/ProjectValuationAssistant";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Project } from "@/data/mockData";
import { toast } from "sonner";
import type { ApiProject, ApiResponse } from "@/types/api";
import { adaptApiProject, isAuthenticated } from "@/lib/api";

const STATUS_COLOR: Record<string, string> = {
  "Ý tưởng": "tag-warning",
  "Nguyên mẫu": "tag-primary",
  "Đang phát triển": "tag-accent",
};

const LICENSE_LABEL: Record<string, string> = {
  PERSONAL: "Cá nhân (Personal)",
  COMMERCIAL: "Thương mại (Commercial)",
  EXCLUSIVE: "Độc quyền (Exclusive)",
};

const HANDOVER_LABEL: Record<string, string> = {
  SELL_SOURCE_CODE: "Bán source code",
  TRANSFER_OWNERSHIP: "Chuyển nhượng toàn bộ",
  FIND_COFOUNDER: "Tìm Co-founder",
  FIND_CONTRIBUTOR: "Tìm Contributor",
  PROFIT_SHARING: "Chia lợi nhuận",
};

const STAGE_LABEL: Record<string, string> = {
  IDEA: "Ý tưởng",
  PROTOTYPE: "Prototype",
  MVP: "MVP",
  IN_DEVELOPMENT: "Đang phát triển",
  NEARLY_COMPLETED: "Gần xong (>80%)",
  COMPLETED: "Hoàn thiện",
};

const REPORT_REASONS = [
  "Nội dung không hợp lệ",
  "Thông tin không đúng mô tả",
  "Lừa đảo / gian lận",
];

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

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
    toast.success(`Đã gửi báo cáo: "${reason}"`);
    setReportOpen(false);
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
          <h1 className="text-2xl font-bold">Không tìm thấy dự án</h1>
          <Link to="/explore" className="mt-4 inline-block text-primary hover:underline">← Quay lại Marketplace</Link>
        </div>
      </div>
    );
  }

  const isCompany = project.listingType === "COMPANY_SHOWCASE";
  const isAbandoned = project.listingType === "ABANDONED_PROJECT";
  const canBuyDirectly = isAbandoned
    && (project.handoverType === "SELL_SOURCE_CODE" || project.handoverType === "TRANSFER_OWNERSHIP")
    && project.price != null && project.price > 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10">
        <Link to="/explore" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Quay lại Marketplace
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ===== Main Content ===== */}
          <div className="lg:col-span-2 space-y-6">
            {project.imageUrl && (
              <div className="overflow-hidden rounded-xl border">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full max-h-72 object-cover"
                  onError={(e) => { (e.currentTarget as HTMLElement).parentElement!.style.display = "none"; }}
                />
              </div>
            )}

            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {isCompany && (
                  <Badge className="gap-1 bg-primary/10 text-primary border-primary/30 hover:bg-primary/10">
                    <Building2 className="h-3 w-3" /> Project công ty
                  </Badge>
                )}
                {isAbandoned && (
                  <Badge variant="outline" className="gap-1">
                    <GitBranch className="h-3 w-3" /> Project bỏ dở
                  </Badge>
                )}
                <span className={`tag ${STATUS_COLOR[project.status] ?? "tag-muted"}`}>{project.status}</span>
                <span className="tag tag-muted">{project.category}</span>
                {project.licenseType && (
                  <Badge variant="secondary">{LICENSE_LABEL[project.licenseType]}</Badge>
                )}
                {project.handoverType && (
                  <Badge variant="outline" className="text-xs">{HANDOVER_LABEL[project.handoverType]}</Badge>
                )}

                {/* Report */}
                <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                  <DialogTrigger asChild>
                    <button className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                      <Flag className="h-3.5 w-3.5" /> Báo cáo
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Báo cáo bài đăng</DialogTitle>
                      <DialogDescription>Chọn lý do báo cáo "{project.title}"</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 pt-2">
                      {REPORT_REASONS.map((r) => (
                        <button key={r} onClick={() => handleReport(r)}
                          className="w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-destructive/5 hover:border-destructive/30 hover:text-destructive">
                          {r}
                        </button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <h1 className="font-display text-3xl font-bold">{project.title}</h1>
            </div>

            {/* Company info block */}
            {isCompany && project.companyName && (
              <div className="rounded-xl border bg-primary/5 border-primary/20 p-5 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <Building2 className="h-4 w-4" /> {project.companyName}
                </div>
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  {project.companyWebsite && (
                    <a href={project.companyWebsite} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-primary transition-colors">
                      <Globe className="h-3.5 w-3.5" /> {project.companyWebsite}
                    </a>
                  )}
                  {project.companyContactEmail && (
                    <a href={`mailto:${project.companyContactEmail}`}
                      className="flex items-center gap-1.5 hover:text-primary transition-colors">
                      <Mail className="h-3.5 w-3.5" /> {project.companyContactEmail}
                    </a>
                  )}
                  {project.companyContactPhone && (
                    <a href={`tel:${project.companyContactPhone}`}
                      className="flex items-center gap-1.5 hover:text-primary transition-colors">
                      <Phone className="h-3.5 w-3.5" /> {project.companyContactPhone}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="mb-2 font-semibold">Mô tả</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{project.description}</p>
            </div>

            {/* Abandoned project details */}
            {isAbandoned && (
              <>
                <div>
                  <h2 className="mb-2 font-semibold">Tiến độ hoàn thành</h2>
                  <div className="mb-1 flex justify-between text-sm text-muted-foreground">
                    <span>{project.projectStage ? STAGE_LABEL[project.projectStage] : project.status}</span>
                    <span>{project.completionPercent ?? project.progress}%</span>
                  </div>
                  <Progress value={project.completionPercent ?? project.progress} className="h-2" />
                </div>

                {project.completedParts && (
                  <div>
                    <h2 className="mb-2 font-semibold text-green-600 dark:text-green-400">✓ Phần đã làm xong</h2>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{project.completedParts}</p>
                  </div>
                )}

                {project.missingParts && (
                  <div>
                    <h2 className="mb-2 font-semibold text-orange-600 dark:text-orange-400">✗ Phần còn thiếu</h2>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{project.missingParts}</p>
                  </div>
                )}

                {project.lookingFor && (
                  <div>
                    <h2 className="mb-2 font-semibold">Đang tìm</h2>
                    <p className="text-sm text-muted-foreground">{project.lookingFor}</p>
                  </div>
                )}
              </>
            )}

            {/* Tech stack */}
            {project.techStack.length > 0 && (
              <div>
                <h2 className="mb-3 font-semibold">Tech Stack</h2>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="rounded-lg border bg-card px-3 py-1.5 text-sm font-medium font-mono">{tech}</span>
                  ))}
                </div>
              </div>
            )}

            {/* License */}
            {project.licenseType && (
              <div className="rounded-xl border bg-muted/30 p-5 space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Shield className="h-4 w-4 text-primary" /> Giấy phép sử dụng
                </div>
                <p className="font-medium">{LICENSE_LABEL[project.licenseType]}</p>
              </div>
            )}
          </div>

          {/* ===== Sidebar ===== */}
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-6 space-y-4 sticky top-20">

              {/* COMPANY_SHOWCASE CTA */}
              {isCompany && (
                <>
                  {project.priceRange && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Khoảng giá</p>
                      <p className="font-display text-xl font-bold text-primary">{project.priceRange}</p>
                    </div>
                  )}
                  <Button className="w-full gap-2" size="lg"
                    onClick={() => {
                      if (project.companyContactEmail) {
                        window.location.href = `mailto:${project.companyContactEmail}?subject=Quan tâm đến: ${project.title}`;
                      } else {
                        toast.info("Liên hệ công ty qua thông tin bên trên");
                      }
                    }}>
                    <Mail className="h-4 w-4" /> Liên hệ công ty
                  </Button>
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" className="w-full gap-2">
                        <ExternalLink className="h-4 w-4" /> Xem Demo
                      </Button>
                    </a>
                  )}
                </>
              )}

              {/* ABANDONED_PROJECT CTA */}
              {isAbandoned && (
                <>
                  {project.price != null && project.price > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-sm text-muted-foreground">Giá mong muốn</p>
                      <p className="font-display text-3xl font-bold text-primary">
                        {project.price.toLocaleString("vi-VN")}₫
                      </p>
                      {/* Valuation badge */}
                      {project.estimatedPriceLow != null && project.estimatedPriceHigh != null && (
                        <div className="flex flex-wrap items-center gap-2">
                          <PriceComparisonBadge
                            userPrice={project.price}
                            suggestedLow={project.estimatedPriceLow}
                            suggestedHigh={project.estimatedPriceHigh}
                          />
                          <span className="text-xs text-muted-foreground">
                            Gợi ý: {project.estimatedPriceLow.toLocaleString("vi-VN")}₫ – {project.estimatedPriceHigh.toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                      )}
                      {project.soldCount != null && project.soldCount > 0 && (
                        <p className="text-xs text-muted-foreground">Đã bán: {project.soldCount} lượt</p>
                      )}
                    </div>
                  )}

                  {canBuyDirectly && (
                    <Button className="w-full gap-2" size="lg" onClick={() => {
                      if (!isAuthenticated()) { toast.error("Đăng nhập để mua"); navigate("/login"); return; }
                      navigate(`/checkout/${id}`);
                    }}>
                      <ShoppingCart className="h-4 w-4" />
                      {project.price ? `Mua ngay — ${project.price.toLocaleString("vi-VN")}₫` : "Mua ngay"}
                    </Button>
                  )}

                  <Button variant={canBuyDirectly ? "outline" : "default"} className="w-full gap-2"
                    onClick={() => toast.info("Tính năng Chat đang phát triển (Phase 9)")}>
                    <MessageCircle className="h-4 w-4" /> Chat với người đăng
                  </Button>

                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" className="w-full gap-2">
                        <ExternalLink className="h-4 w-4" /> Xem Demo / GitHub
                      </Button>
                    </a>
                  )}
                </>
              )}

              {/* Fallback (no listingType yet) */}
              {!isCompany && !isAbandoned && (
                <Button className="w-full" onClick={() => toast.info("Liên hệ người đăng")}>
                  <Mail className="mr-2 h-4 w-4" /> Liên hệ
                </Button>
              )}
            </div>

            {/* Info sidebar */}
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-sm">
                  {project.creator.avatar?.slice(0, 2) ?? "?"}
                </div>
                <div>
                  <p className="font-semibold">{project.creator.name}</p>
                  <p className="text-xs text-muted-foreground">{isCompany ? "Admin" : "Người đăng"}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground divide-y">
                <div className="flex items-center gap-2 pb-2">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Đăng ngày {project.createdAt ? new Date(project.createdAt).toLocaleDateString("vi-VN") : "—"}</span>
                </div>
                {project.supportDays != null && (
                  <div className="flex items-center gap-2 py-2">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>{project.supportDays > 0 ? `Hỗ trợ ${project.supportDays} ngày sau mua` : "Không có hỗ trợ sau mua"}</span>
                  </div>
                )}
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
