import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiFetch, getUserRole } from "@/lib/api";

const CATEGORY_OPTIONS = [
  { label: "IT / Phần mềm", value: "IT" },
  { label: "Startup IT", value: "STARTUP" },
];

const AdminCompanyProjectForm = () => {
  const navigate = useNavigate();
  const role = getUserRole();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [techStack, setTechStack] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [priceRaw, setPriceRaw] = useState("");
  const [priceDisplay, setPriceDisplay] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyContactEmail, setCompanyContactEmail] = useState("");
  const [companyContactPhone, setCompanyContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setPriceRaw(digits);
    if (digits) {
      setPriceDisplay(Number(digits).toLocaleString("vi-VN") + " ₫");
    } else {
      setPriceDisplay("");
    }
  };

  if (role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Không có quyền truy cập</h1>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">← Trang chủ</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !companyName || !companyContactEmail) {
      toast.error("Vui lòng điền danh mục, tên công ty và email liên hệ");
      return;
    }

    const techArray = techStack.split(",").map((s) => s.trim()).filter(Boolean);

    const payload: Record<string, unknown> = {
      title,
      description,
      category,
      techStack: techArray,
      demoUrl: demoUrl.trim() || null,
      companyName,
      companyWebsite: companyWebsite.trim() || null,
      companyContactEmail,
      companyContactPhone: companyContactPhone.trim() || null,
    };
    if (priceRaw) {
      payload.price = Number(priceRaw);
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch("/api/admin/company-projects", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Tạo bài thất bại");

      toast.success("Đã đăng project công ty thành công!");
      navigate("/admin");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-6">
          <Link to="/" className="font-sans text-lg font-bold">Project Graveyard Admin</Link>
          <Link to="/">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Trang chủ</Button>
          </Link>
        </div>
      </header>

      <div className="container max-w-2xl py-10">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Đăng project công ty</h1>
            <p className="mt-1 text-muted-foreground">Bài đăng sẽ được duyệt ngay và hiển thị ở mục "Project từ công ty"</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company info */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Thông tin công ty
            </h2>

            <div className="space-y-2">
              <Label htmlFor="companyName">Tên công ty <span className="text-destructive">*</span></Label>
              <Input id="companyName" placeholder="ABC Software JSC" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Email liên hệ <span className="text-destructive">*</span></Label>
                <Input id="companyEmail" type="email" placeholder="sales@abc.com" value={companyContactEmail} onChange={(e) => setCompanyContactEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyPhone">Số điện thoại</Label>
                <Input id="companyPhone" placeholder="0901234567" value={companyContactPhone} onChange={(e) => setCompanyContactPhone(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Website công ty</Label>
              <Input id="companyWebsite" type="url" placeholder="https://abc.com" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} />
            </div>
          </div>

          {/* Project info */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold">Thông tin project</h2>

            <div className="space-y-2">
              <Label htmlFor="title">Tên project / sản phẩm <span className="text-destructive">*</span></Label>
              <Input id="title" placeholder="vd: E-commerce System cho doanh nghiệp vừa và nhỏ" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Mô tả <span className="text-destructive">*</span></Label>
              <Textarea id="desc" placeholder="Mô tả chi tiết về sản phẩm/project của công ty, tính năng, use case..." rows={5} value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Danh mục <span className="text-destructive">*</span></Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá bán (VNĐ)</Label>
                <Input
                  id="price"
                  placeholder="vd: 80000000"
                  value={priceDisplay || priceRaw}
                  onChange={handlePriceChange}
                  onFocus={() => setPriceDisplay("")}
                  onBlur={() => {
                    if (priceRaw) setPriceDisplay(Number(priceRaw).toLocaleString("vi-VN") + " ₫");
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tech">Tech Stack</Label>
              <Input id="tech" placeholder="vd: React, Spring Boot, PostgreSQL (cách nhau dấu phẩy)" value={techStack} onChange={(e) => setTechStack(e.target.value)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="demo">Link Demo</Label>
                <Input id="demo" placeholder="https://demo.abc.com" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} />
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
            <Plus className="h-4 w-4" />
            {isSubmitting ? "Đang tạo..." : "Đăng project công ty"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminCompanyProjectForm;
