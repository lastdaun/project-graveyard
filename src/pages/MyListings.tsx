import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, PlusCircle, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiFetch, isAuthenticated } from "@/lib/api";
import { adaptApiProject } from "@/lib/api";
import type { ApiProject, ApiResponse, ApiReviewStatus } from "@/types/api";
import type { Project } from "@/data/mockData";
import { toast } from "sonner";

const REVIEW_BADGE: Record<ApiReviewStatus, { label: string; cls: string }> = {
  DRAFT: { label: "Bản nháp", cls: "bg-muted text-muted-foreground border-muted" },
  PENDING_REVIEW: { label: "Chờ duyệt", cls: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400" },
  APPROVED: { label: "Đã duyệt", cls: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400" },
  REJECTED: { label: "Bị từ chối", cls: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400" },
};

const LICENSE_LABEL: Record<string, string> = {
  PERSONAL: "Personal",
  COMMERCIAL: "Commercial",
  EXCLUSIVE: "Exclusive",
};

const MyListings = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const fetchMyListings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiFetch("/api/projects/my");
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            navigate("/login");
            return;
          }
          throw new Error("Không thể tải danh sách tin đăng");
        }
        const body: ApiResponse<ApiProject[]> = await res.json();
        setProjects((body.data ?? []).map(adaptApiProject));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyListings();
  }, [navigate]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá tin đăng này?")) return;
    try {
      const res = await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xoá thất bại");
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Đã xoá tin đăng");
    } catch {
      toast.error("Không thể xoá tin đăng");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-4xl py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Tin đăng của tôi</h1>
            <p className="mt-1 text-muted-foreground">Quản lý các project/source code bạn đang bán</p>
          </div>
          <Link to="/post">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Đăng bán mới
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border bg-muted/30 p-16 text-center">
            <p className="text-lg font-medium">Chưa có tin đăng nào</p>
            <p className="mt-1 text-sm text-muted-foreground">Bắt đầu bằng cách đăng project đầu tiên của bạn</p>
            <Link to="/post" className="mt-4 inline-block">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Đăng bán ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const reviewStatus = (project.reviewStatus ?? "PENDING_REVIEW") as ApiReviewStatus;
              const badge = REVIEW_BADGE[reviewStatus];

              return (
                <div
                  key={project.id}
                  className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={badge.cls}>
                          {badge.label}
                        </Badge>
                        {project.licenseType && (
                          <Badge variant="secondary" className="text-xs">
                            {LICENSE_LABEL[project.licenseType] ?? project.licenseType}
                          </Badge>
                        )}
                        <span className="tag tag-muted">{project.category}</span>
                      </div>

                      <h3 className="font-display text-lg font-semibold leading-tight">{project.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{project.description}</p>

                      {project.rejectionReason && reviewStatus === "REJECTED" && (
                        <div className="mt-2 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-sm text-destructive">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span><strong>Lý do từ chối:</strong> {project.rejectionReason}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {project.price != null && project.price > 0 && (
                        <span className="font-display text-xl font-bold text-primary">
                          {project.price.toLocaleString("vi-VN")}₫
                        </span>
                      )}
                      {project.soldCount != null && project.soldCount > 0 && (
                        <span className="text-xs text-muted-foreground">Đã bán: {project.soldCount}</span>
                      )}
                      <div className="flex gap-2 mt-1">
                        <Link to={`/project/${project.id}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Xem
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(project.id)}
                        >
                          Xoá
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
                    <span>Đăng ngày: {project.createdAt ? new Date(project.createdAt).toLocaleDateString("vi-VN") : "—"}</span>
                    {project.supportDays != null && (
                      <span>Hỗ trợ: {project.supportDays > 0 ? `${project.supportDays} ngày` : "Không"}</span>
                    )}
                    {project.techStack.length > 0 && (
                      <span>Stack: {project.techStack.slice(0, 3).join(", ")}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyListings;
