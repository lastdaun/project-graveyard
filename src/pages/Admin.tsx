import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Clock, CheckCircle, XCircle, Wallet, Plus, ExternalLink, Loader2, Shield,
  LayoutDashboard, Building2, Users, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { apiFetch, adaptApiProject, isAdmin, isAuthenticated } from "@/lib/api";
import type { ApiOrder, ApiProject, ApiResponse } from "@/types/api";
import type { Project } from "@/data/mockData";

type Section = "overview" | "pending" | "approved" | "rejected" | "orders";

const reviewChartConfig = {
  pending: { label: "Chờ duyệt", color: "hsl(38 92% 50%)" },
  approved: { label: "Đã duyệt", color: "hsl(142 71% 45%)" },
  rejected: { label: "Từ chối", color: "hsl(0 72% 51%)" },
};

const listingChartConfig = {
  company: { label: "Công ty", color: "hsl(221 83% 53%)" },
  community: { label: "Cộng đồng", color: "hsl(262 83% 58%)" },
};

const Admin = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");
  const [pending, setPending] = useState<Project[]>([]);
  const [approved, setApproved] = useState<Project[]>([]);
  const [rejected, setRejected] = useState<Project[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Project | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      toast.error("Chỉ Admin mới truy cập được");
      navigate("/login");
    }
  }, [navigate]);

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, aRes, rRes, oRes] = await Promise.all([
        apiFetch("/api/admin/projects/pending"),
        apiFetch("/api/admin/projects?reviewStatus=APPROVED"),
        apiFetch("/api/admin/projects?reviewStatus=REJECTED"),
        apiFetch("/api/admin/orders"),
      ]);

      if (pRes.status === 403 || aRes.status === 403) {
        toast.error("Không có quyền Admin");
        navigate("/");
        return;
      }

      if (!aRes.ok) {
        const err = await aRes.json().catch(() => null);
        toast.error(err?.message || "Không tải được project đã duyệt");
      }
      if (!rRes.ok) {
        const err = await rRes.json().catch(() => null);
        toast.error(err?.message || "Không tải được project từ chối");
      }

      const pBody: ApiResponse<ApiProject[]> = await pRes.json();
      const aBody: ApiResponse<ApiProject[]> = aRes.ok ? await aRes.json() : { data: [] } as ApiResponse<ApiProject[]>;
      const rBody: ApiResponse<ApiProject[]> = rRes.ok ? await rRes.json() : { data: [] } as ApiResponse<ApiProject[]>;
      const oBody: ApiResponse<ApiOrder[]> = oRes.ok ? await oRes.json() : { data: [] } as ApiResponse<ApiOrder[]>;

      setPending((pBody.data ?? []).map(adaptApiProject));
      setApproved((aBody.data ?? []).map(adaptApiProject));
      setRejected((rBody.data ?? []).map(adaptApiProject));
      setOrders(oBody.data ?? []);
    } catch {
      toast.error("Không tải được dữ liệu admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated() && isAdmin()) load();
  }, []);

  const stats = useMemo(() => {
    const companyCount = approved.filter((p) => p.listingType === "COMPANY_PROJECT").length;
    const communityCount = approved.filter((p) => p.listingType !== "COMPANY_PROJECT").length;
    const paidOrders = orders.filter((o) =>
      ["PAID", "PROCESSING_HANDOVER", "COMPLETED"].includes(o.status)
    );
    const revenue = paidOrders.reduce((sum, o) => sum + (o.amount ?? 0), 0);
    return {
      companyCount,
      communityCount,
      revenue,
      totalProjects: pending.length + approved.length + rejected.length,
    };
  }, [pending, approved, rejected, orders]);

  const reviewChartData = useMemo(
    () => [
      { name: "Chờ duyệt", key: "pending", value: pending.length, fill: "var(--color-pending)" },
      { name: "Đã duyệt", key: "approved", value: approved.length, fill: "var(--color-approved)" },
      { name: "Từ chối", key: "rejected", value: rejected.length, fill: "var(--color-rejected)" },
    ],
    [pending.length, approved.length, rejected.length]
  );

  const listingChartData = useMemo(
    () => [
      { name: "Công ty", key: "company", value: stats.companyCount, fill: "var(--color-company)" },
      { name: "Cộng đồng", key: "community", value: stats.communityCount, fill: "var(--color-community)" },
    ],
    [stats.companyCount, stats.communityCount]
  );

  const openDetail = async (id: string) => {
    try {
      const res = await apiFetch(`/api/admin/projects/${id}`);
      const body: ApiResponse<ApiProject> = await res.json();
      if (!res.ok) throw new Error(body?.message || "Lỗi");
      setSelected(adaptApiProject(body.data));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await apiFetch(`/api/admin/projects/${id}/approve`, { method: "PATCH" });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || "Duyệt thất bại");
      toast.success("Đã duyệt project");
      setSelected(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const openReject = (id: string) => {
    setRejectId(id);
    setRejectReason("");
    setRejectOpen(true);
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) {
      toast.error("Nhập lý do từ chối");
      return;
    }
    try {
      const res = await apiFetch(`/api/admin/projects/${rejectId}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || "Từ chối thất bại");
      toast.success("Đã từ chối project");
      setRejectOpen(false);
      setSelected(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const completeOrder = async (id: number) => {
    try {
      const res = await apiFetch(`/api/admin/orders/${id}/complete`, { method: "PATCH" });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || "Lỗi");
      toast.success("Đã hoàn tất bàn giao");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const sidebar = [
    { id: "overview" as const, label: "Dashboard", icon: LayoutDashboard, count: null as number | null },
    { id: "pending" as const, label: "Chờ duyệt", icon: Clock, count: pending.length },
    { id: "approved" as const, label: "Đã duyệt", icon: CheckCircle, count: approved.length },
    { id: "rejected" as const, label: "Từ chối", icon: XCircle, count: rejected.length },
    { id: "orders" as const, label: "Orders", icon: Wallet, count: orders.length },
  ];

  const list =
    section === "pending" ? pending :
    section === "approved" ? approved :
    section === "rejected" ? rejected : [];

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Tổng quan hệ thống Project Graveyard</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => setSection("pending")}
          className="rounded-xl border bg-card p-4 text-left hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Chờ duyệt</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold">{pending.length}</p>
        </button>
        <button
          type="button"
          onClick={() => setSection("approved")}
          className="rounded-xl border bg-card p-4 text-left hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Đã duyệt</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold">{approved.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.companyCount} công ty · {stats.communityCount} cộng đồng
          </p>
        </button>
        <button
          type="button"
          onClick={() => setSection("rejected")}
          className="rounded-xl border bg-card p-4 text-left hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Từ chối</span>
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-3xl font-bold">{rejected.length}</p>
        </button>
        <button
          type="button"
          onClick={() => setSection("orders")}
          className="rounded-xl border bg-card p-4 text-left hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Doanh thu (đã thanh toán)</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">{stats.revenue.toLocaleString("vi-VN")}₫</p>
          <p className="text-xs text-muted-foreground mt-1">{orders.length} orders</p>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <Building2 className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Project công ty</p>
            <p className="text-xl font-semibold">{stats.companyCount}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Project cộng đồng (public)</p>
            <p className="text-xl font-semibold">{stats.communityCount}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-4">Trạng thái duyệt</h2>
          {reviewChartData.every((d) => d.value === 0) ? (
            <p className="text-sm text-muted-foreground py-10 text-center">Chưa có dữ liệu</p>
          ) : (
            <ChartContainer config={reviewChartConfig} className="h-[220px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie data={reviewChartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {reviewChartData.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-4">Project đã duyệt theo loại</h2>
          {listingChartData.every((d) => d.value === 0) ? (
            <p className="text-sm text-muted-foreground py-10 text-center">Chưa có dữ liệu</p>
          ) : (
            <ChartContainer config={listingChartConfig} className="h-[220px] w-full">
              <BarChart data={listingChartData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={6}>
                  {listingChartData.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Chờ duyệt gần đây</h2>
            <Button size="sm" variant="ghost" onClick={() => setSection("pending")}>Xem tất cả</Button>
          </div>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">Không có project chờ duyệt</p>
          ) : (
            <div className="space-y-2">
              {pending.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.creator.name}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => openDetail(p.id)}>Xem</Button>
                    <Button size="sm" onClick={() => handleApprove(p.id)}>Duyệt</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Orders gần đây</h2>
            <Button size="sm" variant="ghost" onClick={() => setSection("orders")}>Xem tất cả</Button>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có order</p>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="rounded-lg border p-3">
                  <p className="font-medium truncate">#{o.id} · {o.project?.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.buyer?.fullName} · {(o.amount ?? 0).toLocaleString("vi-VN")}₫ · {o.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b bg-background">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold">
            <Shield className="h-5 w-5 text-primary" /> Admin
          </div>
          <div className="flex gap-2">
            <Link to="/admin/company-projects/new">
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Đăng project công ty</Button>
            </Link>
            <Link to="/"><Button size="sm" variant="outline">Về trang chủ</Button></Link>
          </div>
        </div>
      </div>

      <div className="container py-8 grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-1">
          {sidebar.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left ${
                section === s.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <s.icon className="h-4 w-4" />
              <span className="flex-1">{s.label}</span>
              {s.count != null && (
                <Badge variant="secondary" className="text-xs">{s.count}</Badge>
              )}
            </button>
          ))}
        </aside>

        <main>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : section === "overview" ? (
            renderOverview()
          ) : section === "orders" ? (
            <div className="space-y-3">
              <h1 className="font-display text-2xl font-bold mb-4">Orders</h1>
              {orders.length === 0 ? (
                <p className="text-muted-foreground">Chưa có order</p>
              ) : orders.map((o) => (
                <div key={o.id} className="rounded-xl border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">#{o.id} · {o.project?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Buyer: {o.buyer?.fullName} · {o.amount?.toLocaleString("vi-VN")}₫ · {o.status}
                    </p>
                  </div>
                  {(o.status === "PAID" || o.status === "PROCESSING_HANDOVER") && (
                    <Button size="sm" onClick={() => completeOrder(o.id)}>Hoàn tất bàn giao</Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <h1 className="font-display text-2xl font-bold mb-4">
                {sidebar.find((s) => s.id === section)?.label}
              </h1>
              {list.length === 0 ? (
                <p className="text-muted-foreground">Không có project</p>
              ) : list.map((p) => (
                <div key={p.id} className="rounded-xl border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.creator.name} · {p.completionPercent ?? p.progress}% ·{" "}
                      {p.price != null ? `${p.price.toLocaleString("vi-VN")}₫` : "—"}
                    </p>
                    {p.rejectionReason && (
                      <p className="text-sm text-destructive">Lý do: {p.rejectionReason}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openDetail(p.id)}>Chi tiết</Button>
                    {section === "pending" && (
                      <>
                        <Button size="sm" onClick={() => handleApprove(p.id)}>Duyệt</Button>
                        <Button size="sm" variant="destructive" onClick={() => openReject(p.id)}>Từ chối</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                {selected.imageUrls?.[0] && (
                  <img src={selected.imageUrls[0]} alt="" className="w-full rounded-lg max-h-48 object-cover" />
                )}
                <p>{selected.description}</p>
                <p><strong>% hoàn thiện:</strong> {selected.completionPercent ?? selected.progress}%</p>
                <p><strong>Đã làm:</strong> {selected.completedParts || "—"}</p>
                <p><strong>Còn thiếu:</strong> {selected.missingParts || "—"}</p>
                <p><strong>Giá mong muốn:</strong> {selected.price?.toLocaleString("vi-VN") ?? "—"}₫</p>
                {(selected.estimatedPriceLow || selected.estimatedPriceSuggested) && (
                  <p>
                    <strong>Giá gợi ý:</strong>{" "}
                    {selected.estimatedPriceLow?.toLocaleString("vi-VN")} –{" "}
                    {selected.estimatedPriceSuggested?.toLocaleString("vi-VN")} –{" "}
                    {selected.estimatedPriceHigh?.toLocaleString("vi-VN")}₫
                  </p>
                )}
                {selected.githubUrl && (
                  <a href={selected.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline">
                    GitHub <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              {selected.reviewStatus === "PENDING_REVIEW" && (
                <DialogFooter className="gap-2">
                  <Button variant="destructive" onClick={() => openReject(selected.id)}>Từ chối</Button>
                  <Button onClick={() => handleApprove(selected.id)}>Duyệt</Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lý do từ chối</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Rejection reason</Label>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Huỷ</Button>
            <Button variant="destructive" onClick={handleReject}>Xác nhận từ chối</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
