import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Building2, Phone, Mail, Globe, Tag } from "lucide-react";
import { apiFetch, isAuthenticated } from "@/lib/api";

function formatVND(raw: string): string {
  const num = raw.replace(/\D/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("vi-VN");
}

const PostCompanyProject = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [priceRaw, setPriceRaw] = useState("");
  const [priceDisplay, setPriceDisplay] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/login"); return; }
    try {
      const u = JSON.parse(stored);
      if (u.role !== "ADMIN") {
        toast.error("Chỉ ADMIN mới được đăng bài này");
        navigate("/post");
      }
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setPriceRaw(raw);
    setPriceDisplay(raw ? Number(raw).toLocaleString("vi-VN") : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      toast.error("Bạn cần đăng nhập");
      navigate("/login");
      return;
    }

    if (!companyName.trim()) {
      toast.error("Vui lòng nhập tên công ty");
      return;
    }

    const techArr = techStack.split(",").map((s) => s.trim()).filter(Boolean);

    const payload: Record<string, unknown> = {
      title,
      description,
      category: "IT",
      status: "DEVELOPING",
      techStack: techArr,
      skillsNeeded: [],
      teamSize: 1,
      progress: 100,
      listingType: "COMPANY_SHOWCASE",
      collaborationMode: "SELL_USAGE_RIGHTS",
      companyName: companyName.trim(),
      contactEmail: contactEmail.trim() || null,
      contactPhone: contactPhone.trim() || null,
      demoUrl: website.trim() || null,
    };

    if (priceRaw) {
      payload.price = Number(priceRaw);
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch("/api/projects", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        toast.error("Phiên đăng nhập hết hạn");
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Đăng thất bại");

      toast.success("Đã đăng dự án công ty thành công!");
      navigate("/explore");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-2xl py-10">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Badge className="gap-1 bg-blue-500/15 text-blue-600 hover:bg-blue-500/20">
              <Building2 className="h-3.5 w-3.5" /> Bài đăng Công ty
            </Badge>
            <Badge variant="outline" className="text-xs">Tự động duyệt</Badge>
          </div>
          <h1 className="font-display text-3xl font-bold">Đăng dự án cho Công ty</h1>
          <p className="mt-2 text-muted-foreground">
            Giới thiệu sản phẩm / dự án của công ty bạn lên marketplace. Bài đăng sẽ được duyệt tự động.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Info */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-display font-semibold text-base">Thông tin dự án</h2>

            <div className="space-y-2">
              <Label htmlFor="title">Tên dự án / sản phẩm *</Label>
              <Input
                id="title"
                placeholder="vd: EduPlatform – Nền tảng học trực tuyến"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Mô tả *</Label>
              <Textarea
                id="desc"
                placeholder="Mô tả tính năng, vấn đề giải quyết, đối tượng sử dụng..."
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tech">Tech Stack</Label>
              <Input
                id="tech"
                placeholder="vd: React, Node.js, PostgreSQL (phân cách bằng dấu phẩy)"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
              />
            </div>
          </div>

          {/* Price */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-display font-semibold text-base flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" /> Giá bán
            </h2>
            <div className="space-y-2">
              <Label htmlFor="price">Giá (VNĐ)</Label>
              <div className="relative">
                <Input
                  id="price"
                  inputMode="numeric"
                  placeholder="vd: 80000000"
                  value={priceDisplay}
                  onChange={handlePriceChange}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">đ</span>
              </div>
              {priceRaw && (
                <p className="text-sm font-semibold text-primary">
                  {Number(priceRaw).toLocaleString("vi-VN")}₫
                </p>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-display font-semibold text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Thông tin liên hệ công ty
            </h2>

            <div className="space-y-2">
              <Label htmlFor="company">Tên công ty *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="company"
                  placeholder="vd: ABC Technology JSC"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email liên hệ</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@company.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="vd: 0901234567"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website / Link demo</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="website"
                  placeholder="vd: https://company.com hoặc demo.company.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng..." : "Đăng dự án công ty"}
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default PostCompanyProject;
