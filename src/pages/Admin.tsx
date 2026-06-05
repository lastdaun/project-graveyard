import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Clock, AlertTriangle, Skull, CheckCircle, XCircle,
  Shield, Ban, Eye, Settings, Save, Users, Wallet, TrendingUp, ArrowUpRight,
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

const sidebarIds = ["overview", "pending", "reported", "users", "transactions", "pricingConfig"] as const;

const pendingProjectsData = [
  { id: "p1", name: "AI Tutor Bot", creator: "Liam Torres", date: "2026-03-18", requestedPrice: 16_250_000, aiPrice: 12_500_000 },
  { id: "p2", name: "Campus Carpool", creator: "Priya Gupta", date: "2026-03-17", requestedPrice: null, aiPrice: null },
  { id: "p3", name: "Lecture Summarizer", creator: "Erik Holm", date: "2026-03-16", requestedPrice: 2_100_000, aiPrice: 1_200_000 },
  { id: "p4", name: "Dorm Swap", creator: "Chloe Martin", date: "2026-03-15", requestedPrice: 400_000, aiPrice: 375_000 },
];

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

const DESIGN_LABELS: Record<string, string> = {
  social_post: "Social post / banner",
  logo_branding: "Logo / Branding",
  ui_ux_full: "UI/UX full app",
  motion_video: "Motion video",
  "3d_model": "3D model / render",
};

const COMPLEXITY_LABELS: Record<string, string> = {
  a: "Simple", b: "Intermediate", c: "Multi-feature", d: "Real-time", e: "AI/Scalable",
};

const INNOVATION_LABELS: Record<string, string> = {
  a: "Template", b: "Improve", c: "New Idea", d: "Unique",
};

const Admin = () => {
  const { t } = useLanguage();
  const { config, setConfig } = usePricingConfig();
  const [section, setSection] = useState("overview");
  const [pending, setPending] = useState(pendingProjectsData);
  const [reported, setReported] = useState(reportedProjectsData);
  const [students, setStudents] = useState(mockStudents);
  const [withdrawals, setWithdrawals] = useState(mockWithdrawals);

  const [editConfig, setEditConfig] = useState<PricingConfig>({ ...config, itBase: { ...config.itBase }, designBase: { ...config.designBase }, complexityPts: { ...config.complexityPts }, innovationPts: { ...config.innovationPts }, multiplierBrackets: config.multiplierBrackets.map((b) => ({ ...b })) });

  const sidebarItems = [
    { label: t("admin.overview"), icon: LayoutDashboard, id: "overview" as const },
    { label: t("admin.pending"), icon: Clock, id: "pending" as const },
    { label: t("admin.reported"), icon: AlertTriangle, id: "reported" as const },
    { label: t("admin.users"), icon: Users, id: "users" as const },
    { label: t("admin.transactions"), icon: Wallet, id: "transactions" as const },
    { label: t("admin.pricingConfig"), icon: Settings, id: "pricingConfig" as const },
  ];

  const handleApprove = (id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
    toast.success(t("admin.pending.approve") + "!");
  };

  const handleReject = (id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
    toast.error(t("admin.pending.reject") + "!");
  };

  const handleForceAI = (id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
    toast.success(t("admin.pending.forceAI") + " ✓");
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
  const updateDesignBase = (key: string, val: number) => setEditConfig((c) => ({ ...c, designBase: { ...c.designBase, [key]: val } }));
  const updateComplexity = (key: string, val: number) => setEditConfig((c) => ({ ...c, complexityPts: { ...c.complexityPts, [key]: val } }));
  const updateInnovation = (key: string, val: number) => setEditConfig((c) => ({ ...c, innovationPts: { ...c.innovationPts, [key]: val } }));
  const updateCheckPt = (val: number) => setEditConfig((c) => ({ ...c, checkPt: val }));
  const updateMultiplier = (idx: number, val: number) => setEditConfig((c) => ({ ...c, multiplierBrackets: c.multiplierBrackets.map((b, i) => i === idx ? { ...b, value: val } : b) }));

  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-sans text-lg font-bold">
            <Skull className="h-5 w-5 text-primary" />
            <span>{t("admin.title")}</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">{t("admin.back")}</Button>
          </Link>
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
                  <p className="text-xs text-muted-foreground">{t("admin.pending")}</p>
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

          {/* ===== PENDING ===== */}
          {section === "pending" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-sans text-2xl font-bold">{t("admin.pending.title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t("admin.pending.sub")}</p>
              </div>
              {pending.length === 0 ? (
                <div className="rounded-xl border bg-card p-12 text-center">
                  <CheckCircle className="mx-auto h-10 w-10 text-accent mb-3" />
                  <p className="font-semibold">{t("admin.pending.empty")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t("admin.pending.emptySub")}</p>
                </div>
              ) : (
                <div className="rounded-xl border bg-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.pending.name")}</TableHead>
                        <TableHead>{t("admin.pending.creator")}</TableHead>
                        <TableHead>{t("admin.pending.date")}</TableHead>
                        <TableHead>{t("admin.pending.requested")}</TableHead>
                        <TableHead>{t("admin.pending.aiPrice")}</TableHead>
                        <TableHead>{t("admin.pending.variance")}</TableHead>
                        <TableHead className="text-right">{t("admin.pending.action")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pending.map((p) => {
                        const variance = p.requestedPrice && p.aiPrice ? Math.round(((p.requestedPrice - p.aiPrice) / p.aiPrice) * 100) : null;
                        const isOver30 = variance !== null && variance > 30;
                        return (
                          <TableRow key={p.id} className={isOver30 ? "bg-primary/5" : ""}>
                            <TableCell className="font-medium">{p.name}</TableCell>
                            <TableCell>{p.creator}</TableCell>
                            <TableCell className="tabular-nums">{p.date}</TableCell>
                            <TableCell className="tabular-nums">
                              {p.requestedPrice ? `${p.requestedPrice.toLocaleString("vi-VN")}₫` : "—"}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {p.aiPrice ? `${p.aiPrice.toLocaleString("vi-VN")}₫` : "—"}
                            </TableCell>
                            <TableCell>
                              {variance !== null ? (
                                <Badge variant="outline" className={isOver30 ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-accent/10 text-accent border-accent/30"}>
                                  {variance > 0 ? "+" : ""}{variance}%
                                </Badge>
                              ) : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2 flex-wrap">
                                {isOver30 ? (
                                  <>
                                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => handleApprove(p.id)}>
                                      {t("admin.pending.approvePrice")}
                                    </Button>
                                    <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10" onClick={() => handleForceAI(p.id)}>
                                      {t("admin.pending.forceAI")}
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => handleApprove(p.id)}>
                                      <CheckCircle className="mr-1 h-3.5 w-3.5" /> {t("admin.pending.approve")}
                                    </Button>
                                    <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => handleReject(p.id)}>
                                      <XCircle className="mr-1 h-3.5 w-3.5" /> {t("admin.pending.reject")}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
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
                <div className="rounded-xl border bg-card p-5 space-y-4">
                  <h3 className="font-sans font-semibold">{t("admin.pricing.designPrices")}</h3>
                  {Object.entries(editConfig.designBase).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-3">
                      <Label className="w-36 text-sm shrink-0">{DESIGN_LABELS[key]}</Label>
                      <Input type="number" value={val} onChange={(e) => updateDesignBase(key, Number(e.target.value))} className="tabular-nums" />
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
