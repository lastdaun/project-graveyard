import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Loader2, Trash2, Eye, CreditCard, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { apiFetch, adaptApiProject, getStoredUser, isAuthenticated } from "@/lib/api";
import type { ApiMyProject, ApiOrder, ApiPage, ApiProject, ApiResponse, ApiUser } from "@/types/api";
import type { Project } from "@/data/mockData";

type ProfileTab = "profile" | "listings" | "purchases";

function adaptMyProject(p: ApiMyProject): Project {
  return {
    id: String(p.id),
    title: p.title,
    description: p.description,
    category: p.category === "STARTUP" ? "Startup" : "IT",
    status: "Đang phát triển",
    skillsNeeded: [],
    techStack: p.techStack ?? [],
    creator: { name: "", avatar: "" },
    teamSize: 1,
    currentMembers: 1,
    progress: p.completionPercent ?? 0,
    imageUrls: p.imageUrls,
    imageUrl: p.imageUrls?.[0],
    createdAt: p.createdAt,
    collaborationMode: "Sell Usage Rights",
    price: p.price,
    listingType: p.listingType,
    completionStatus: p.completionStatus,
    completionPercent: p.completionPercent,
    completedParts: p.completedParts,
    missingParts: p.missingParts,
    currentStage: p.currentStage,
    reviewStatus: p.reviewStatus,
    rejectionReason: p.rejectionReason,
    approved: p.approved,
  };
}

const reviewBadge: Record<string, string> = {
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
};

const reviewLabel: Record<string, string> = {
  PENDING_REVIEW: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
};

const orderLabel: Record<string, string> = {
  PENDING_PAYMENT: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  PROCESSING_HANDOVER: "Đang bàn giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã huỷ",
  REFUNDED: "Hoàn tiền",
};

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const storedUser = getStoredUser();

  const isOwnProfile = !userId || String(storedUser?.id) === userId;
  const viewingOther = !isOwnProfile;

  const rawTab = (searchParams.get("tab") as ProfileTab) || "profile";
  const activeTab: ProfileTab =
    viewingOther && rawTab === "purchases" ? "profile" : rawTab;

  const [profileUser, setProfileUser] = useState<ApiUser | null>(null);
  const [listings, setListings] = useState<Project[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    avatar: "",
    bio: "",
    skills: "",
  });

  useEffect(() => {
    setAvatarBroken(false);
  }, [profileUser?.avatar]);

  useEffect(() => {
    if (isOwnProfile && !isAuthenticated()) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        if (isOwnProfile) {
          const res = await apiFetch("/api/users/me");
          if (res.status === 401) {
            navigate("/login");
            return;
          }
          const body: ApiResponse<ApiUser> = await res.json();
          setProfileUser(body.data ?? (storedUser as ApiUser));
        } else {
          const res = await fetch(`/api/users/${userId}`);
          const body: ApiResponse<ApiUser> = await res.json();
          if (!res.ok) throw new Error(body?.message || "Không tìm thấy user");
          setProfileUser(body.data);
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Không tải được hồ sơ");
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [userId, isOwnProfile, navigate]);

  useEffect(() => {
    if (!profileUser || activeTab !== "listings") return;

    const loadListings = async () => {
      setLoadingListings(true);
      try {
        if (isOwnProfile) {
          const res = await apiFetch("/api/projects/my");
          const body: ApiResponse<ApiMyProject[]> = await res.json();
          if (!res.ok) throw new Error(body?.message || "Không tải tin đăng");
          setListings((body.data ?? []).map(adaptMyProject));
        } else {
          const res = await fetch(`/api/projects?creatorId=${userId}&size=50`);
          const body: ApiResponse<ApiPage<ApiProject>> = await res.json();
          if (!res.ok) throw new Error(body?.message || "Không tải project");
          setListings((body.data?.content ?? []).map(adaptApiProject));
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Lỗi tải tin đăng");
      } finally {
        setLoadingListings(false);
      }
    };

    loadListings();
  }, [activeTab, profileUser, isOwnProfile, userId]);

  useEffect(() => {
    if (!isOwnProfile || activeTab !== "purchases") return;

    const loadOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await apiFetch("/api/orders/my-purchases");
        const body: ApiResponse<ApiOrder[]> = await res.json();
        if (!res.ok) throw new Error(body?.message || "Không tải đơn mua");
        setOrders(body.data ?? []);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Lỗi tải đơn mua");
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, [activeTab, isOwnProfile]);

  const setTab = (tab: string) => {
    setSearchParams(tab === "profile" ? {} : { tab });
  };

  const openEdit = () => {
    if (!profileUser) return;
    setEditForm({
      fullName: profileUser.fullName ?? "",
      avatar: profileUser.avatar ?? "",
      bio: profileUser.bio ?? "",
      skills: (profileUser.skills ?? []).join(", "),
    });
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.fullName.trim()) {
      toast.error("Tên không được trống");
      return;
    }
    setSaving(true);
    try {
      const skills = editForm.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await apiFetch("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({
          fullName: editForm.fullName.trim(),
          avatar: editForm.avatar.trim() || null,
          bio: editForm.bio.trim(),
          skills,
        }),
      });
      const body: ApiResponse<ApiUser> = await res.json();
      if (!res.ok) throw new Error(body?.message || "Cập nhật thất bại");
      setProfileUser(body.data);
      const stored = getStoredUser();
      if (stored && body.data) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...stored,
            fullName: body.data.fullName,
            email: body.data.email,
            role: body.data.role,
          })
        );
      }
      toast.success("Đã cập nhật hồ sơ");
      setEditOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xoá project này?")) return;
    try {
      const res = await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xoá thất bại");
      toast.success("Đã xoá");
      setListings((prev) => prev.filter((p) => p.id !== id));
      setProfileUser((prev) =>
        prev
          ? {
              ...prev,
              projectsPosted: Math.max(0, (prev.projectsPosted ?? 1) - 1),
              projectsApproved:
                prev.projectsApproved != null &&
                listings.find((p) => p.id === id)?.reviewStatus === "APPROVED"
                  ? Math.max(0, prev.projectsApproved - 1)
                  : prev.projectsApproved,
            }
          : prev
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi xoá");
    }
  };

  const handleMockPay = async (orderId: number) => {
    try {
      const res = await apiFetch(`/api/orders/${orderId}/mock-pay`, { method: "PATCH" });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || "Thanh toán thất bại");
      toast.success("Thanh toán mock thành công");
      const refresh = await apiFetch("/api/orders/my-purchases");
      const refreshBody: ApiResponse<ApiOrder[]> = await refresh.json();
      setOrders(refreshBody.data ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi thanh toán");
    }
  };

  const displayName = profileUser?.fullName || "User";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const stats = [
    { label: "Project đã đăng", value: profileUser?.projectsPosted ?? 0 },
    { label: "Đã được duyệt", value: profileUser?.projectsApproved ?? 0 },
    { label: "Đơn mua", value: profileUser?.purchaseOrders ?? 0 },
    { label: "Đơn bán", value: profileUser?.salesOrders ?? 0 },
  ];

  if (loadingProfile) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-4xl py-10">
        <div className="mb-8 rounded-2xl border bg-card p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {profileUser?.avatar && !avatarBroken ? (
              <img
                src={profileUser.avatar}
                alt={displayName}
                className="h-24 w-24 shrink-0 rounded-full object-cover border"
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {userInitials}
              </div>
            )}

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold">{displayName}</h1>
                <Badge variant="secondary">{profileUser?.role ?? "USER"}</Badge>
              </div>
              <p className="text-muted-foreground break-all">{profileUser?.email}</p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Bio: </span>
                {profileUser?.bio?.trim() || "Chưa có bio."}
              </p>
              <div>
                <p className="text-sm font-medium mb-2">Kỹ năng / Tech stack</p>
                {(profileUser?.skills?.length ?? 0) > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileUser!.skills!.map((skill) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa cập nhật kỹ năng.</p>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <div className="flex flex-col gap-2 sm:items-stretch">
                <Button variant="outline" size="sm" onClick={openEdit}>
                  <Pencil className="h-4 w-4 mr-1" /> Chỉnh sửa hồ sơ
                </Button>
                <Link to="/post">
                  <Button size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-1" /> Đăng project
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border bg-muted/30 px-3 py-3 text-center">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
            <TabsTrigger value="listings">
              {viewingOther ? "Project đã duyệt" : "Tin đăng của tôi"}
            </TabsTrigger>
            {isOwnProfile && <TabsTrigger value="purchases">Đơn mua</TabsTrigger>}
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="rounded-xl border p-5 space-y-3 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <p><span className="text-muted-foreground">Tên:</span> {displayName}</p>
                <p><span className="text-muted-foreground">Email:</span> {profileUser?.email}</p>
                <p><span className="text-muted-foreground">Role:</span> {profileUser?.role ?? "USER"}</p>
                <p>
                  <span className="text-muted-foreground">Project đã đăng / duyệt:</span>{" "}
                  {profileUser?.projectsPosted ?? 0} / {profileUser?.projectsApproved ?? 0}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Bio</p>
                <p>{profileUser?.bio?.trim() || "Chưa có bio."}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-2">Kỹ năng / Tech stack</p>
                {(profileUser?.skills?.length ?? 0) > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileUser!.skills!.map((skill) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Chưa cập nhật.</p>
                )}
              </div>
              {!isOwnProfile && (
                <p className="text-muted-foreground pt-2">
                  Tab tin đăng chỉ hiển thị project đã được Admin duyệt.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="listings">
            {loadingListings ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              </div>
            ) : listings.length === 0 ? (
              <div className="rounded-xl border py-12 text-center text-muted-foreground">
                {isOwnProfile ? (
                  <>
                    Chưa có tin đăng.{" "}
                    <Link to="/post" className="text-primary underline">
                      Đăng ngay
                    </Link>
                  </>
                ) : (
                  "Chưa có project đã duyệt."
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{p.title}</h3>
                        {isOwnProfile && p.reviewStatus && (
                          <Badge className={reviewBadge[p.reviewStatus] ?? "bg-muted"}>
                            {reviewLabel[p.reviewStatus] ?? p.reviewStatus}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {p.completionPercent ?? p.progress}% hoàn thiện
                        {p.price != null && ` · ${p.price.toLocaleString("vi-VN")}₫`}
                      </p>
                      {isOwnProfile && p.reviewStatus === "REJECTED" && p.rejectionReason && (
                        <p className="text-sm text-destructive">
                          Lý do từ chối: {p.rejectionReason}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {(!isOwnProfile || p.reviewStatus === "APPROVED") && (
                        <Link to={`/project/${p.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" /> Xem
                          </Button>
                        </Link>
                      )}
                      {isOwnProfile && (
                        <Button variant="outline" size="sm" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Xoá
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="purchases">
              {loadingOrders ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-xl border py-12 text-center text-muted-foreground">
                  Chưa có đơn mua.{" "}
                  <Link to="/explore" className="text-primary underline">
                    Khám phá
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{o.project?.title}</h3>
                          <Badge variant="secondary">{orderLabel[o.status] ?? o.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Đơn #{o.id} · {o.amount?.toLocaleString("vi-VN")}₫
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/project/${o.project?.id}`}>
                          <Button variant="outline" size="sm">
                            Xem project
                          </Button>
                        </Link>
                        {o.status === "PENDING_PAYMENT" && (
                          <Button size="sm" onClick={() => handleMockPay(o.id)}>
                            <CreditCard className="h-4 w-4 mr-1" /> Thanh toán mock
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Tên</Label>
              <Input
                id="fullName"
                value={editForm.fullName}
                onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                placeholder="https://... (link ảnh trực tiếp)"
                value={editForm.avatar}
                onChange={(e) => setEditForm((f) => ({ ...f, avatar: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Phải là link file ảnh trực tiếp (thường kết thúc bằng .jpg/.png/.webp/.svg),
                không dùng link trang Vecteezy/Google. Ví dụ:{" "}
                <code className="text-[11px]">https://api.dicebear.com/7.x/avataaars/svg?seed=Tai</code>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={3}
                value={editForm.bio}
                onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Kỹ năng / Tech stack</Label>
              <Input
                id="skills"
                placeholder="React, Spring Boot, PostgreSQL"
                value={editForm.skills}
                onChange={(e) => setEditForm((f) => ({ ...f, skills: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Tách bằng dấu phẩy</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Huỷ</Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Profile;
