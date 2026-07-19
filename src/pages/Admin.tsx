import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Clock, CheckCircle, XCircle, Wallet, Plus, ExternalLink, Loader2, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { apiFetch, adaptApiProject, isAdmin, isAuthenticated } from "@/lib/api";
import type { ApiOrder, ApiProject, ApiResponse } from "@/types/api";
import type { Project } from "@/data/mockData";

type Section = "pending" | "approved" | "rejected" | "orders";

const Admin = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("pending");
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
    { id: "pending" as const, label: "Chờ duyệt", icon: Clock, count: pending.length },
    { id: "approved" as const, label: "Đã duyệt", icon: CheckCircle, count: approved.length },
    { id: "rejected" as const, label: "Từ chối", icon: XCircle, count: rejected.length },
    { id: "orders" as const, label: "Orders", icon: Wallet, count: orders.length },
  ];

  const list =
    section === "pending" ? pending :
    section === "approved" ? approved :
    section === "rejected" ? rejected : [];

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
              <Badge variant="secondary" className="text-xs">{s.count}</Badge>
            </button>
          ))}
        </aside>

        <main>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
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
