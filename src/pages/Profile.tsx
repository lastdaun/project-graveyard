import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin, Github, Globe, Mail, Phone, Edit2,
  FileText, Clock, CheckCircle2, Building2,
  ChevronRight, Users, ShieldCheck, Loader2,
  BookOpen, Layers, PlusCircle, ExternalLink, AlertCircle, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiFetch, adaptApiProject } from "@/lib/api";
import type { Project } from "@/data/mockData";
import type { ApiProject, ApiResponse, ApiReviewStatus } from "@/types/api";
import { toast } from "sonner";

// ── helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "?";
}

// ── sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number | string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border bg-card p-4 text-center">
      <Icon className={`h-5 w-5 ${color}`} />
      <span className="font-display text-2xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function QuickAction({ icon: Icon, label, to, color }: { icon: React.ElementType; label: string; to: string; color: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <span className="font-medium">{label}</span>
      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

const REVIEW_BADGE: Record<ApiReviewStatus, { label: string; cls: string }> = {
  DRAFT:          { label: "Bản nháp",    cls: "bg-muted text-muted-foreground border-muted" },
  PENDING_REVIEW: { label: "Chờ duyệt",  cls: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400" },
  APPROVED:       { label: "Đã duyệt",   cls: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400" },
  REJECTED:       { label: "Bị từ chối", cls: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400" },
};

// ── USER PROFILE ─────────────────────────────────────────────────────────────

function UserProfile({ user }: { user: Record<string, unknown> }) {
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const skills: string[] = Array.isArray(user.skills) ? user.skills as string[] : [];

  useEffect(() => {
    apiFetch("/api/projects/my")
      .then((r) => r.json())
      .then((body: ApiResponse<ApiProject[]>) => {
        if (body.success && Array.isArray(body.data)) {
          setMyProjects(body.data.map(adaptApiProject));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá tin đăng này?")) return;
    try {
      const res = await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMyProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Đã xoá tin đăng");
    } catch {
      toast.error("Không thể xoá tin đăng");
    }
  };

  const approved = myProjects.filter((p) => p.reviewStatus === "APPROVED");
  const pending  = myProjects.filter((p) => p.reviewStatus === "PENDING_REVIEW");

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={FileText}     label="Tin đã đăng"    value={myProjects.length} color="text-primary" />
        <StatCard icon={CheckCircle2} label="Đã được duyệt"  value={approved.length}   color="text-green-500" />
        <StatCard icon={Clock}        label="Chờ duyệt"       value={pending.length}    color="text-amber-500" />
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Kỹ năng / Tech stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => <span key={s} className="tag tag-primary">{s}</span>)}
          </div>
        </section>
      )}

      {/* My listings — full version */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Tin đăng của tôi
          </h2>
          <Link to="/post">
            <Button size="sm" className="gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" /> Đăng bán mới
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : myProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            <FileText className="mx-auto mb-2 h-8 w-8 opacity-40" />
            <p className="font-medium">Chưa có tin đăng nào</p>
            <p className="mt-1 text-sm">Bắt đầu bằng cách đăng project đầu tiên của bạn</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myProjects.map((project) => {
              const reviewStatus = (project.reviewStatus ?? "PENDING_REVIEW") as ApiReviewStatus;
              const badge = REVIEW_BADGE[reviewStatus];
              return (
                <div key={project.id} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={badge.cls}>{badge.label}</Badge>
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
                      <div className="flex gap-2 mt-1">
                        <Link to={`/project/${project.id}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <ExternalLink className="h-3.5 w-3.5" /> Xem
                          </Button>
                        </Link>
                        <Button
                          variant="outline" size="sm"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
                    <span>Đăng ngày: {project.createdAt ? new Date(project.createdAt).toLocaleDateString("vi-VN") : "—"}</span>
                    {project.techStack.length > 0 && (
                      <span>Stack: {project.techStack.slice(0, 3).join(", ")}</span>
                    )}
                    {project.progress > 0 && (
                      <span className="flex items-center gap-1.5">
                        Tiến độ:
                        <Progress value={project.progress} className="inline-block h-1.5 w-16" />
                        {project.progress}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Portfolio / Links */}
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" /> Hồ sơ / Sản phẩm cá nhân
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(user.githubUrl as string) ? (
            <a href={user.githubUrl as string} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40">
              <Github className="h-5 w-5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.githubUrl as string}</p>
                <p className="text-xs text-muted-foreground">GitHub</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
          ) : null}
          {(user.website as string) ? (
            <a href={user.website as string} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40">
              <Globe className="h-5 w-5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.website as string}</p>
                <p className="text-xs text-muted-foreground">Website cá nhân</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
          ) : null}
          {!(user.githubUrl as string) && !(user.website as string) && (
            <div className="sm:col-span-2 rounded-xl border border-dashed p-6 text-center text-muted-foreground">
              <Globe className="mx-auto mb-2 h-7 w-7 opacity-40" />
              <p className="text-sm">Chưa có liên kết portfolio. Cập nhật trong phần chỉnh sửa hồ sơ.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ── ADMIN PROFILE ─────────────────────────────────────────────────────────────

function AdminProfile() {
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [companyCount, setCompanyCount] = useState<number | null>(null);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/admin/projects/pending").then((r) => r.json()),
      apiFetch("/api/admin/company-projects").then((r) => r.json()),
    ])
      .then(([pendingBody, companyBody]) => {
        const pList: ApiProject[] = Array.isArray(pendingBody?.data) ? pendingBody.data : [];
        const cList: ApiProject[] = Array.isArray(companyBody?.data) ? companyBody.data : [];
        setPendingCount(pList.length);
        setCompanyCount(cList.length);
        setPendingProjects(pList.slice(0, 3).map(adaptApiProject));
      })
      .catch(() => {
        setPendingCount(0);
        setCompanyCount(0);
      })
      .finally(() => setLoadingStats(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon={Clock} label="Project chờ duyệt"
          value={loadingStats ? "…" : pendingCount ?? 0}
          color="text-amber-500" />
        <StatCard icon={Building2} label="Project công ty"
          value={loadingStats ? "…" : companyCount ?? 0}
          color="text-blue-500" />
        <StatCard icon={CheckCircle2} label="Đã xử lý hôm nay"
          value="—" color="text-green-500" />
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" /> Truy cập nhanh
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <QuickAction icon={CheckCircle2} label="Duyệt project đang chờ" to="/admin" color="bg-amber-500" />
          <QuickAction icon={Building2} label="Đăng bài công ty" to="/admin/company-projects/new" color="bg-blue-500" />
          <QuickAction icon={Layers} label="Quản lý tất cả project" to="/admin" color="bg-primary" />
          <QuickAction icon={Users} label="Khám phá marketplace" to="/explore" color="bg-emerald-500" />
        </div>
      </section>

      {/* Pending preview */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" /> Project đang chờ duyệt
          </h2>
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              Vào admin <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        {loadingStats ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : pendingProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
            <CheckCircle2 className="mx-auto mb-2 h-7 w-7 opacity-40" />
            <p className="text-sm">Không có project nào đang chờ duyệt.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingProjects.map((p) => (
              <div key={p.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{p.title}</p>
                  <p className="text-sm text-muted-foreground">{p.creator.name} · {p.category}</p>
                </div>
                <Badge className="bg-amber-500/10 text-amber-600 text-xs shrink-0">Chờ duyệt</Badge>
              </div>
            ))}
            {(pendingCount ?? 0) > 3 && (
              <p className="text-center text-sm text-muted-foreground">
                +{(pendingCount ?? 0) - 3} project khác đang chờ
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/login"); return; }
    try { setUser(JSON.parse(stored)); } catch { navigate("/login"); }
  }, [navigate]);

  if (!user) return null;

  const isAdmin = user.role === "ADMIN";
  const name = (user.fullName as string) || "Người dùng";
  const avatarText = initials(name);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-3xl py-10">

        {/* ── Header ── */}
        <div className="mb-8 rounded-2xl border bg-card p-6">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="relative">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {avatarText}
              </div>
              {isAdmin && (
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl font-bold">{name}</h1>
                <Badge variant={isAdmin ? "default" : "secondary"} className={isAdmin ? "bg-amber-500 text-white" : ""}>
                  {isAdmin ? "Quản trị viên" : "Thành viên"}
                </Badge>
              </div>
              {(user.email as string) && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {user.email as string}
                </div>
              )}
              {(user.location as string) && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {user.location as string}
                </div>
              )}
              {(user.phone as string) && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {user.phone as string}
                </div>
              )}
              {(user.bio as string) && (
                <p className="mt-1 text-sm text-muted-foreground">{user.bio as string}</p>
              )}
            </div>

            <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
              <Edit2 className="h-3.5 w-3.5" /> Chỉnh sửa
            </Button>
          </div>
        </div>

        {/* ── Role-specific content ── */}
        {isAdmin ? <AdminProfile /> : <UserProfile user={user} />}
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
