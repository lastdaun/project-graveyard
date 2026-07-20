import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiFetch, isAdmin, isAuthenticated } from "@/lib/api";
import { useEffect } from "react";

const AdminCompanyProject = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("IT");
  const [techStack, setTechStack] = useState("");
  const [imageUrlsText, setImageUrlsText] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      toast.error("Chỉ Admin mới truy cập được");
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const imageUrls = imageUrlsText.split(",").map((u) => u.trim()).filter(Boolean);
    if (imageUrls.length === 0) {
      toast.error("Cần ít nhất 1 hình ảnh");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch("/api/admin/company-projects", {
        method: "POST",
        body: JSON.stringify({
          companyName,
          companyWebsite: companyWebsite || null,
          companyEmail: companyEmail || null,
          companyPhone: companyPhone || null,
          title,
          description,
          category,
          techStack: techStack.split(",").map((s) => s.trim()).filter(Boolean),
          imageUrls,
          demoUrl: demoUrl || null,
          price: Number(price),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || "Tạo thất bại");
      toast.success("Đã đăng project công ty (public ngay)");
      navigate(`/project/${body.data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-2xl py-10">
        <Link to="/admin" className="text-sm text-muted-foreground hover:underline">← Admin</Link>
        <h1 className="mt-4 mb-2 font-display text-3xl font-bold">Đăng project công ty / hoàn thiện</h1>
        <p className="mb-8 text-muted-foreground">Project sẽ public ngay, không cần duyệt.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl border p-5 space-y-4">
            <h2 className="font-semibold">Thông tin công ty</h2>
            <div className="space-y-2">
              <Label>Tên công ty</Label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="https://" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Email liên hệ</Label>
                <Input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tên project</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="STARTUP">Startup IT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tech stack</Label>
            <Input value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, NestJS..." />
          </div>
          <div className="space-y-2">
            <Label>Hình ảnh (URL, phân cách dấu phẩy)</Label>
            <Input value={imageUrlsText} onChange={(e) => setImageUrlsText(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Demo URL</Label>
            <Input value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Giá bán (VND)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Đang đăng..." : "Đăng project công ty"}
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AdminCompanyProject;
