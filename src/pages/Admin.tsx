import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Clock, AlertTriangle, CheckCircle, XCircle,
  Shield, Ban, Eye, Settings, Save, Users, Wallet, TrendingUp, ArrowUpRight, Info,
  Loader2, Building2, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Cell, PieChart, Pie } from "recharts";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePricingConfig, type PricingConfig } from "@/contexts/PricingConfigContext";
import { apiFetch } from "@/lib/api";
import type { ApiProject, ApiResponse } from "@/types/api";

const sidebarIds = ["overview", "pending", "reported", "users", "transactions", "pricingConfig"] as const;

interface PendingProject {
  id: number;
  title: string;
  creator: { fullName: string };
  createdAt: string;
  price?: number;
  progress: number;
  handoverType?: string;
  projectStage?: string;
  completionPercent?: number;
  estimatedPriceLow?: number;
  estimatedPriceSuggested?: number;
  estimatedPriceHigh?: number;
  valuationConfidence?: string;
}

const reportedProjectsData = [
  { id: "r1", name: "Get Rich Quick Course", reason: "Spam", reports: 12 },
  { id: "r2", name: "Fake Diploma Generator", reason: "Nội dung không phù hợp", reports: 8 },
  { id: "r3", name: "Random Lorem Ipsum", reason: "Không phải dự án thật", reports: 3 },
];

const mockStudents = [
  { id: "u1", name: "Nguyễn Văn An", email: "an.nv@fpt.edu.vn", type: "Premium", status: "verified" },
  { id: "u2", name: "Trần Thị Bích", email: "bich.tt@fpt.edu.vn", type: "Free", status: "verified" },
  { id: "u3", name: "Lê Hoàng Dũng", email: "dung.lh@fpt.edu.vn", type: "Free", status: "unverified" },
  { id: "u4", name: "Phạm Minh Châu", email: "chau.pm@fpt.edu.vn", type: "Premium", status: "verified" },
  { id: "u5", name: "Võ Thanh Hà", email: "ha.vt@fpt.edu.vn", type: "Free", status: "unverified" },
  { id: "u6", name: "Đặng Quốc Bảo", email: "bao.dq@fpt.edu.vn", type: "Premium", status: "verified" },
];

const mockWithdrawals = [
  { id: "GD-20260301", requester: "Nguyễn Văn An", amount: 2_500_000, bank: "Vietcombank - 1234***789", status: "pending" },
  { id: "GD-20260302", requester: "Trần Thị Bích", amount: 1_200_000, bank: "MB Bank - 9876***321", status: "completed" },
  { id: "GD-20260303", requester: "Phạm Minh Châu", amount: 3_800_000, bank: "Techcombank - 5678***012", status: "pending" },
  { id: "GD-20260304", requester: "Đặng Quốc Bảo", amount: 950_000, bank: "ACB - 1122***445", status: "completed" },
  { id: "GD-20260305", requester: "Lê Hoàng Dũng", amount: 4_200_000, bank: "BIDV - 3344***667", status: "pending" },
];

const revenueData = [
  { month: "T1", revenue: 12_500_000 },
  { month: "T2", revenue: 18_200_000 },
  { month: "T3", revenue: 15_800_000 },
  { month: "T4", revenue: 22_100_000 },
  { month: "T5", revenue: 19_600_000 },
  { month: "T6", revenue: 28_400_000 },
];

const categoryData = [
  { name: "IT & Phần mềm", value: 65, fill: "hsl(var(--primary))" },
  { name: "Thiết kế", value: 35, fill: "hsl(var(--accent))" },
];

const revenueChartConfig = {
  revenue: { label: "Doanh thu", color: "hsl(var(--primary))" },
};

const categoryChartConfig = {
  it: { label: "IT & Phần mềm", color: "hsl(var(--primary))" },
  design: { label: "Thiết kế", color: "hsl(var(--accent))" },
};

const IT_LABELS: Record<string, string> = {
  landing: "Landing page",
  website_full: "Website (full)",
  web_app: "Web app (CRUD)",
  mobile_app: "Mobile app",
  ai_ml: "AI / ML",
};


const COMPLEXITY_LABELS: Record<string, string> = {
  a: "Simple", b: "Intermediate", c: "Multi-feature", d: "Real-time", e: "AI/Scalable",
};

const INNOVATION_LABELS: Record<string, string> = {
  a: "Template", b: "Improve", c: "New Idea", d: "Unique",
};

const HANDOVER_LABEL: Record<string, string> = {
  SELL_SOURCE_CODE: "Bán source code",
  TRANSFER_OWNERSHIP: "Chuyển nhượng",
  FIND_COFOUNDER: "Tìm Co-founder",
  FIND_CONTRIBUTOR: "Tìm Contributor",
  PROFIT_SHARING: "Chia lợi nhuận",
};

const Admin = () => {
  const { t } = useLanguage();
  const { config, setConfig } = usePricingConfig();
  const [section, setSection] = useState("overview");
  const [pending, setPending] = useState<PendingProject[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [rejectDialogId, setRejectDialogId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [reported, setReported] = useState(reportedProjectsData);
  const [students, setStudents] = useState(mockStudents);
  const [withdrawals, setWithdrawals] = useState(mockWithdrawals);

  const [editConfig, setEditConfig] = useState<PricingConfig>({ ...config, itBase: { ...config.itBase }, designBase: { ...config.designBase }, complexityPts: { ...config.complexityPts }, innovationPts: { ...config.innovationPts }, multiplierBrackets: config.multiplierBrackets.map((b) => ({ ...b })) });

  useEffect(() => {
    if (section === "pending") {
      setPendingLoading(true);
      apiFetch("/api/admin/projects/pending")
        .then((r) => r.json())
        .then((body: ApiResponse<ApiProject[]>) => {
          setPending((body.data ?? []).map((p) => ({
            id: p.id,
            title: p.title,
            creator: { fullName: p.creator?.fullName ?? "Unknown" },
            createdAt: p.createdAt,
            price: p.price,
            progress: p.progress,
            handoverType: p.handoverType,
            projectStage: p.projectStage,
            completionPercent: p.completionPercent,
            estimatedPriceLow: p.estimatedPriceLow,
            estimatedPriceSuggested: p.estimatedPriceSuggested,
            estimatedPriceHigh: p.estimatedPriceHigh,
            valuationConfidence: p.valuationConfidence,
          })));
        })
        .catch(() => toast.error("Không thể tải danh sách chờ duyệt"))
        .finally(() => setPendingLoading(false));
    }
  }, [section]);

  const sidebarItems = [
    { label: t("admin.overview"), icon: LayoutDashboard, id: "overview" as const },
    { label: "Chờ duyệt (thật)", icon: Clock, id: "pending" as const },
    { label: t("admin.reported"), icon: AlertTriangle, id: "reported" as const },
    { label: t("admin.users"), icon: Users, id: "users" as const },
    { label: t("admin.transactions"), icon: Wallet, id: "transactions" as const },
    { label: t("admin.pricingConfig"), icon: Settings, id: "pricingConfig" as const },
  ];

  const handleApprove = async (id: number) => {
    try {
      const res = await apiFetch(`/api/admin/projects/${id}/approve`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      setPending((prev) => prev.filter((p) => p.id !== id));
      toast.success("Đã duyệt project!");
    } catch {
      toast.error("Duyệt thất bại");
    }
  };

  const handleReject = async (id: number, reason: string) => {
    if (!reason.trim()) { toast.error("Vui lòng nhập lý do từ chối"); return; }
    try {
      const res = await apiFetch(`/api/admin/projects/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error();
      setPending((prev) => prev.filter((p) => p.id !== id));
      setRejectDialogId(null);
      setRejectReason("");
      toast.error("Đã từ chối project");
    } catch {
      toast.error("Từ chối thất bại");
    }
  };

  const handleKeep = (id: string) => {
    setReported((prev) => prev.filter((p) => p.id !== id));
    toast.success(t("admin.reported.keep") + "!");
  };

  const handleTakeDown = (id: string) => {
    setReported((prev) => prev.filter((p) => p.id !== id));
    toast.error(t("admin.reported.takedown") + "!");
  };

  const handleBan = (id: string) => {
    setReported((prev) => prev.filter((p) => p.id !== id));
    toast.error(t("admin.reported.ban") + "!");
  };

  const handleBanUser = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    toast.error(t("admin.users.banned"));
  };

  const handleApproveWithdrawal = (id: string) => {
    setWithdrawals((prev) => prev.map((w) => w.id === id ? { ...w, status: "completed" } : w));
    toast.success(t("admin.txn.approved"));
  };

  const handleSaveConfig = () => {
    setConfig(editConfig);
    toast.success(t("admin.pricing.saved"));
  };

  const updateItBase = (key: string, val: number) => setEditConfig((c) => ({ ...c, itBase: { ...c.itBase, [key]: val } }));
  const updateComplexity = (key: string, val: number) => setEditConfig((c) => ({ ...c, complexityPts: { ...c.complexityPts, [key]: val } }));
  const updateInnovation = (key: string, val: number) => setEditConfig((c) => ({ ...c, innovationPts: { ...c.innovationPts, [key]: val } }));
  const updateCheckPt = (val: number) => setEditConfig((c) => ({ ...c, checkPt: val }));
  const updateMultiplier = (idx: number, val: number) => setEditConfig((c) => ({ ...c, multiplierBrackets: c.multiplierBrackets.map((b, i) => i === idx ? { ...b, value: val } : b) }));

  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-6">
          <Link to="/" className="font-sans text-lg font-bold">{t("admin.title")}</Link>
          <div className="flex items-center gap-2">
            <Link to="/admin/company-projects/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Đăng project công ty
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">{t("admin.back")}</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-60 shrink-0 border-r bg-muted/30 md:block">
          <nav className="sticky top-14 space-y-1 p-4">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors active:scale-[0.98] ${
                  section === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 lg:p-8">
          {/* API Status Banner */}
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-300/50 bg-amber-50/80 dark:bg-amber-900/20 dark:border-amber-700/50 p-3 text-sm text-amber-800 dark:text-amber-300">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>Lưu ý:</strong> Backend chưa có Admin API (approve/reject project). Dữ liệu hiện tại là <strong>mock demo</strong>.
              Cần thêm: <code className="rounded bg-amber-100 dark:bg-amber-900/40 px-1 text-xs">GET /api/admin/projects/pending</code>,{" "}
              <code className="rounded bg-amber-100 dark:bg-amber-900/40 px-1 text-xs">PUT /api/admin/projects/{"{id}"}/approve</code>,{" "}
              <code className="rounded bg-amber-100 dark:bg-amber-900/40 px-1 text-xs">PUT /api/admin/projects/{"{id}"}/reject</code>
            </span>
          </div>

          <div className="mb-6 md:hidden">
            <Tabs value={section} onValueChange={setSection}>
              <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
                {sidebarItems.map((item) => (
                  <TabsTrigger key={item.id} value={item.id} className="text-xs">{item.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* ===== OVERVIEW ===== */}
          {section === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-sans text-2xl font-bold">{t("admin.overview.title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t("admin.overview.sub")}</p>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <button onClick={() => setSection("pending")} className="rounded-xl border bg-card p-5 text-left transition-all hover:shadow-md active:scale-[0.98]">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-primary border-primary/30 text-xs">
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />+8%
                    </Badge>
                  </div>
                  <p className="mt-3 text-2xl font-bold tabular-nums">{pending.length}</p>
                  <p className="text-xs text-muted-foreground">Chờ duyệt</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">{t("admin.overview.vsLastMonth")}</p>
                </button>

                <button onClick={() => setSection("reported")} className="rounded-xl border bg-card p-5 text-left transition-all hover:shadow-md active:scale-[0.98]">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />-5%
                    </Badge>
                  </div>
                  <p className="mt-3 text-2xl font-bold tabular-nums">{reported.length}</p>
                  <p className="text-xs text-muted-foreground">{t("admin.reported")}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">{t("admin.overview.vsLastMonth")}</p>
                </button>

                <div className="rounded-xl border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                    <Badge variant="outline" className="text-accent border-accent/30 text-xs">
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />+12%
                    </Badge>
                  </div>
                  <p className="mt-3 text-2xl font-bold tabular-nums">{totalRevenue.toLocaleString("vi-VN")}₫</p>
                  <p className="text-xs text-muted-foreground">{t("admin.overview.totalRevenue")}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">{t("admin.overview.vsLastMonth")}</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border bg-card p-5">
                  <h3 className="font-sans font-semibold mb-4">{t("admin.overview.revenueChart")}</h3>
                  <ChartContainer config={revenueChartConfig} className="h-[250px] w-full">
                    <BarChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
                    </BarChart>
                  </ChartContainer>
                </div>

                <div className="rounded-xl border bg-card p-5">
                  <h3 className="font-sans font-semibold mb-4">{t("admin.overview.categoryChart")}</h3>
                  <ChartContainer config={categoryChartConfig} className="h-[250px] w-full">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        strokeWidth={2}
                        stroke="hsl(var(--background))"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="flex justify-center gap-6 mt-2">
                    {categoryData.map((c) => (
                      <div key={c.name} className="flex items-center gap-2 text-sm">
                        <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: c.fill }} />
                        <span className="text-muted-foreground">{c.name}</span>
                        <span className="font-semibold">{c.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== PENDING (REAL API) ===== */}
          {section === "pending" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-sans text-2xl font-bold">Duyệt project người dùng</h1>
                  <p className="text-sm text-muted-foreground mt-1">Project ABANDONED_PROJECT đang chờ duyệt — dữ liệu thật từ DB</p>
                </div>
                <Badge variant="secondary">{pending.length} chờ duyệt</Badge>
              </div>

              {pendingLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pending.length === 0 ? (
                <div className="rounded-xl border bg-card p-12 text-center">
                  <CheckCircle className="mx-auto h-10 w-10 text-accent mb-3" />
                  <p className="font-semibold">Không có project nào đang chờ duyệt</p>
                  <p className="text-sm text-muted-foreground mt-1">Tất cả bài đăng đã được xử lý</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pending.map((p) => (
                    <div key={p.id} className="rounded-xl border bg-card p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{p.projectStage ?? "—"}</Badge>
                            {p.handoverType && (
                              <Badge variant="outline" className="text-xs">{HANDOVER_LABEL[p.handoverType] ?? p.handoverType}</Badge>
                            )}
                          </div>
                          <h3 className="font-semibold">{p.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {p.creator.fullName} · {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                            {p.completionPercent != null && ` · ${p.completionPercent}% hoàn thiện`}
                          </p>
                          {p.price && (
                            <p className="text-sm font-medium text-primary mt-0.5">
                              Giá mong muốn: {p.price.toLocaleString("vi-VN")}₫
                            </p>
                          )}
                          {p.estimatedPriceSuggested && (
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                              <span className="text-muted-foreground">
                                Gợi ý hệ thống: <span className="font-medium text-foreground">{p.estimatedPriceLow?.toLocaleString("vi-VN")}₫ – {p.estimatedPriceHigh?.toLocaleString("vi-VN")}₫</span>
                              </span>
                              {p.valuationConfidence && (
                                <Badge variant="outline" className={`text-[10px] py-0 ${
                                  p.valuationConfidence === "Cao" ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300"
                                  : p.valuationConfidence === "Trung bình" ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300"
                                  : "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300"
                                }`}>
                                  {p.valuationConfidence}
                                </Badge>
                              )}
                              {p.price && p.estimatedPriceSuggested && p.price > p.estimatedPriceSuggested * 1.5 && (
                                <Badge variant="outline" className="text-[10px] py-0 bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300">
                                  Giá cao hơn gợi ý
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1" onClick={() => handleApprove(p.id)}>
                            <CheckCircle className="h-3.5 w-3.5" /> Duyệt
                          </Button>
                          <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-1"
                            onClick={() => { setRejectDialogId(p.id); setRejectReason(""); }}>
                            <XCircle className="h-3.5 w-3.5" /> Từ chối
                          </Button>
                          <Link to={`/project/${p.id}`} target="_blank">
                            <Button size="sm" variant="ghost" className="gap-1">
                              <Eye className="h-3.5 w-3.5" /> Xem
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reject dialog */}
              {rejectDialogId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="rounded-xl border bg-card p-6 w-full max-w-md shadow-xl">
                    <h3 className="font-semibold text-lg mb-2">Lý do từ chối</h3>
                    <p className="text-sm text-muted-foreground mb-3">Người đăng sẽ thấy lý do này trong Tin đăng của tôi</p>
                    <textarea
                      className="w-full rounded-lg border bg-background p-3 text-sm resize-none"
                      rows={4}
                      placeholder="vd: Mô tả chưa rõ phần đã làm và phần còn thiếu..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setRejectDialogId(null)}>Hủy</Button>
                      <Button variant="destructive" onClick={() => handleReject(rejectDialogId, rejectReason)}>Xác nhận từ chối</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== REPORTED ===== */}
          {section === "reported" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-sans text-2xl font-bold">{t("admin.reported.title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t("admin.reported.sub")}</p>
              </div>
              {reported.length === 0 ? (
                <div className="rounded-xl border bg-card p-12 text-center">
                  <Shield className="mx-auto h-10 w-10 text-accent mb-3" />
                  <p className="font-semibold">{t("admin.reported.empty")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t("admin.reported.emptySub")}</p>
                </div>
              ) : (
                <div className="rounded-xl border bg-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.pending.name")}</TableHead>
                        <TableHead>{t("admin.reported.reason")}</TableHead>
                        <TableHead>{t("admin.reported.reports")}</TableHead>
                        <TableHead className="text-right">{t("admin.pending.action")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reported.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>{p.reason}</TableCell>
                          <TableCell className="tabular-nums">{p.reports}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => handleKeep(p.id)}>
                                <Eye className="mr-1 h-3.5 w-3.5" /> {t("admin.reported.keep")}
                              </Button>
                              <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => handleTakeDown(p.id)}>
                                <XCircle className="mr-1 h-3.5 w-3.5" /> {t("admin.reported.takedown")}
                              </Button>
                              <Button size="sm" variant="outline" className="border-destructive/50 bg-destructive/5 text-destructive hover:bg-destructive/15" onClick={() => handleBan(p.id)}>
                                <Ban className="mr-1 h-3.5 w-3.5" /> {t("admin.reported.ban")}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* ===== USER MANAGEMENT ===== */}
          {section === "users" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-sans text-2xl font-bold">{t("admin.users.title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t("admin.users.sub")}</p>
              </div>
              <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.users.name")}</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>{t("admin.users.accountType")}</TableHead>
                      <TableHead>{t("admin.users.status")}</TableHead>
                      <TableHead className="text-right">{t("admin.pending.action")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-muted-foreground">{s.email}</TableCell>
                        <TableCell>
                          <Badge variant={s.type === "Premium" ? "default" : "secondary"}>
                            {s.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={s.status === "verified" ? "bg-accent/10 text-accent border-accent/30" : "bg-destructive/10 text-destructive border-destructive/30"}>
                            {s.status === "verified" ? t("admin.users.verified") : t("admin.users.unverified")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => handleBanUser(s.id)}>
                            <Ban className="mr-1 h-3.5 w-3.5" /> {t("admin.users.ban")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* ===== TRANSACTION MANAGEMENT ===== */}
          {section === "transactions" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-sans text-2xl font-bold">{t("admin.txn.title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t("admin.txn.sub")}</p>
              </div>
              <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.txn.id")}</TableHead>
                      <TableHead>{t("admin.txn.requester")}</TableHead>
                      <TableHead>{t("admin.txn.amount")}</TableHead>
                      <TableHead>{t("admin.txn.bank")}</TableHead>
                      <TableHead>{t("admin.txn.status")}</TableHead>
                      <TableHead className="text-right">{t("admin.pending.action")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="font-mono text-xs">{w.id}</TableCell>
                        <TableCell className="font-medium">{w.requester}</TableCell>
                        <TableCell className="tabular-nums font-semibold">{w.amount.toLocaleString("vi-VN")}₫</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{w.bank}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={w.status === "completed" ? "bg-accent/10 text-accent border-accent/30" : "bg-primary/10 text-primary border-primary/30"}>
                            {w.status === "completed" ? t("admin.txn.completed") : t("admin.txn.pending")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {w.status === "pending" ? (
                            <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => handleApproveWithdrawal(w.id)}>
                              <CheckCircle className="mr-1 h-3.5 w-3.5" /> {t("admin.txn.approve")}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">{t("admin.txn.done")}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* ===== PRICING CONFIG ===== */}
          {section === "pricingConfig" && (
            <div className="space-y-8">
              <div>
                <h1 className="font-sans text-2xl font-bold">{t("admin.pricing.title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t("admin.pricing.sub")}</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border bg-card p-5 space-y-4">
                  <h3 className="font-sans font-semibold">{t("admin.pricing.itPrices")}</h3>
                  {Object.entries(editConfig.itBase).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-3">
                      <Label className="w-36 text-sm shrink-0">{IT_LABELS[key]}</Label>
                      <Input type="number" value={val} onChange={(e) => updateItBase(key, Number(e.target.value))} className="tabular-nums" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border bg-card p-5 space-y-4">
                <h3 className="font-sans font-semibold">{t("admin.pricing.scoringWeights")}</h3>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">{t("admin.pricing.complexity")}</Label>
                    {Object.entries(editConfig.complexityPts).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-3">
                        <Label className="w-28 text-sm shrink-0">{COMPLEXITY_LABELS[key]}</Label>
                        <Input type="number" value={val} onChange={(e) => updateComplexity(key, Number(e.target.value))} className="tabular-nums w-24" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">{t("admin.pricing.innovation")}</Label>
                    {Object.entries(editConfig.innovationPts).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-3">
                        <Label className="w-28 text-sm shrink-0">{INNOVATION_LABELS[key]}</Label>
                        <Input type="number" value={val} onChange={(e) => updateInnovation(key, Number(e.target.value))} className="tabular-nums w-24" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Label className="text-sm shrink-0">{t("admin.pricing.deliverables")} / {t("admin.pricing.quality")} / {t("admin.pricing.market")}</Label>
                  <Input type="number" value={editConfig.checkPt} onChange={(e) => updateCheckPt(Number(e.target.value))} className="tabular-nums w-24" />
                  <span className="text-xs text-muted-foreground">pts</span>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-5 space-y-4">
                <h3 className="font-sans font-semibold">{t("admin.pricing.multipliers")}</h3>
                <div className="space-y-3">
                  {editConfig.multiplierBrackets.map((b, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Label className="w-32 text-sm shrink-0 tabular-nums">{t("admin.pricing.scoreRange")}: {b.min}–{b.max}</Label>
                      <Input type="number" step="0.25" value={b.value} onChange={(e) => updateMultiplier(i, Number(e.target.value))} className="tabular-nums w-24" />
                      <span className="text-sm text-muted-foreground">×</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveConfig} className="gap-2">
                <Save className="h-4 w-4" /> {t("admin.pricing.save")}
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
