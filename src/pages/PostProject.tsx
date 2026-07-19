import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import PricingCalculator from "@/components/PricingCalculator";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertTriangle, Lock } from "lucide-react";
import { apiFetch, isAuthenticated } from "@/lib/api";

const STATUS_MAP: Record<string, string> = {
  "Ý tưởng": "IDEA",
  "Nguyên mẫu": "PROTOTYPE",
  "Đang phát triển": "DEVELOPING",
};

const CATEGORY_MAP: Record<string, string> = {
  IT: "IT",
  "Startup IT": "STARTUP",
};

const PostProject = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Đang phát triển");
  const [techStack, setTechStack] = useState("");
  const [price, setPrice] = useState("");
  const [priceLow, setPriceLow] = useState(0);
  const [priceSuggested, setPriceSuggested] = useState(0);
  const [priceHigh, setPriceHigh] = useState(0);
  const [valuationScore, setValuationScore] = useState(0);
  const [priceMode, setPriceMode] = useState<"recommended" | "custom" | "">("");
  const [customPrice, setCustomPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [completionPercent, setCompletionPercent] = useState("");
  const [completedParts, setCompletedParts] = useState("");
  const [missingParts, setMissingParts] = useState("");
  const [currentStage, setCurrentStage] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [imageUrlsText, setImageUrlsText] = useState("");
  const [hasFullSource, setHasFullSource] = useState(true);
  const [hasReadme, setHasReadme] = useState(false);
  const [hasDbSchema, setHasDbSchema] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      toast.error("Bạn cần đăng nhập để đăng dự án");
      navigate("/login");
      return;
    }

    if (!category || !completionPercent || !completedParts || !missingParts || !currentStage) {
      toast.error("Vui lòng điền đầy đủ thông tin project chưa hoàn thiện");
      return;
    }

    if (!githubUrl.trim()) {
      toast.error("GitHub URL là bắt buộc (chỉ Admin thấy khi duyệt)");
      return;
    }

    const imageList = imageUrlsText
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);

    if (imageList.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 hình ảnh project");
      return;
    }

    if (!price) {
      toast.error("Vui lòng chọn hoặc nhập giá mong muốn");
      return;
    }

    const techArray = techStack
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const percent = Number(completionPercent) || 0;
    const payload = {
      title,
      description,
      category: CATEGORY_MAP[category] ?? category.toUpperCase(),
      status: STATUS_MAP[status] ?? "DEVELOPING",
      collaborationMode: "SELL_USAGE_RIGHTS",
      techStack: techArray,
      skillsNeeded: techArray,
      teamSize: 1,
      progress: percent,
      listingType: "USER_INCOMPLETE_PROJECT",
      completionStatus: "INCOMPLETE",
      completionPercent: percent,
      completedParts,
      missingParts,
      currentStage,
      githubUrl: githubUrl.trim(),
      imageUrls: imageList,
      demoUrl: demoUrl || null,
      price: Number(price),
      estimatedPriceLow: priceLow || null,
      estimatedPriceSuggested: priceSuggested || null,
      estimatedPriceHigh: priceHigh || null,
      valuationScore: valuationScore || null,
      valuationConfidence: percent >= 70 ? "HIGH" : percent >= 40 ? "MEDIUM" : "LOW",
      valuationNote: `Gợi ý giá mềm cho project ${percent}% hoàn thiện`,
    };

    setIsSubmitting(true);
    try {
      const response = await apiFetch("/api/projects", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.status === 401 || response.status === 403) {
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        const msg = data?.message || data?.error || "Đăng dự án thất bại";
        throw new Error(msg);
      }

      toast.success("Đã gửi project chờ Admin duyệt");
      navigate("/profile?tab=listings");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Đã xảy ra lỗi khi kết nối máy chủ";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceApply = (basePrice: number) => {
    const percent = Number(completionPercent) || 50;
    let factor = percent / 100;
    if (demoUrl) factor += 0.08;
    if (hasFullSource) factor += 0.05;
    if (hasReadme) factor += 0.03;
    if (hasDbSchema) factor += 0.04;
    // Soft pricing — don't go too high
    factor = Math.min(factor, 0.95);

    const suggested = Math.round(basePrice * factor);
    const low = Math.round(suggested * 0.7);
    const high = Math.round(suggested * 1.25);
    const score = Math.min(100, Math.round(percent + (demoUrl ? 10 : 0) + (hasReadme ? 5 : 0)));

    setPriceLow(low);
    setPriceSuggested(suggested);
    setPriceHigh(high);
    setValuationScore(score);
    setPriceMode("");
    setPrice("");
    setCustomPrice("");
  };

  const handleUseRecommended = () => {
    setPrice(String(priceSuggested));
    setPriceMode("recommended");
    toast.success(t("post.price.applied"));
  };

  const handleUseCustom = () => setPriceMode("custom");

  const handleCustomPriceConfirm = () => {
    setPrice(customPrice);
    toast.success(t("post.price.applied"));
  };

  const customExceeds30 =
    customPrice && priceSuggested > 0 && Number(customPrice) > priceSuggested * 1.3;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-2xl py-10">
        <h1 className="mb-2 font-display text-3xl font-bold">Đăng project chưa hoàn thiện</h1>
        <p className="mb-8 text-muted-foreground">
          User chỉ đăng project chưa hoàn thiện. Admin sẽ duyệt trước khi public. GitHub link chỉ Admin thấy.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Tên project</Label>
            <Input id="title" placeholder="vd: Marketplace CRUD app" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Mô tả</Label>
            <Textarea id="desc" placeholder="Mô tả project, mục tiêu, stack..." rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Chọn category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">IT / Phần mềm</SelectItem>
                  <SelectItem value="Startup IT">Startup IT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Giai đoạn (status)</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ý tưởng">Ý tưởng</SelectItem>
                  <SelectItem value="Nguyên mẫu">Nguyên mẫu</SelectItem>
                  <SelectItem value="Đang phát triển">Đang phát triển</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tech">Tech stack</Label>
            <Input id="tech" placeholder="React, Spring Boot, PostgreSQL" value={techStack} onChange={(e) => setTechStack(e.target.value)} />
          </div>

          <div className="rounded-xl border bg-muted/20 p-5 space-y-4">
            <h2 className="font-display font-semibold">Tình trạng hoàn thiện</h2>
            <div className="space-y-2">
              <Label htmlFor="percent">% hoàn thiện</Label>
              <Input id="percent" type="number" placeholder="vd: 60" min="1" max="99" value={completionPercent} onChange={(e) => setCompletionPercent(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Giai đoạn hiện tại</Label>
              <Select value={currentStage} onValueChange={setCurrentStage}>
                <SelectTrigger><SelectValue placeholder="Chọn giai đoạn" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prototype">Prototype</SelectItem>
                  <SelectItem value="MVP">MVP</SelectItem>
                  <SelectItem value="Developing">Đang phát triển</SelectItem>
                  <SelectItem value="AlmostDone">Gần xong</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="completedParts">Phần đã làm</Label>
              <Textarea id="completedParts" placeholder="Auth, CRUD sản phẩm, UI cơ bản..." value={completedParts} onChange={(e) => setCompletedParts(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="missingParts">Phần còn thiếu</Label>
              <Textarea id="missingParts" placeholder="Payment, admin panel, deploy..." value={missingParts} onChange={(e) => setMissingParts(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/50 p-5">
            <Label htmlFor="githubUrl" className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> GitHub URL (riêng tư — chỉ Admin thấy)
            </Label>
            <Input id="githubUrl" placeholder="https://github.com/you/project" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} required />
            <p className="text-xs text-muted-foreground">Buyer và public không thấy link này.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="demoUrl">Demo URL (nếu có)</Label>
            <Input id="demoUrl" placeholder="https://demo.example.com" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} />
          </div>

          <div className="space-y-2 rounded-xl border bg-muted/20 p-5">
            <Label htmlFor="imageUrls">Hình ảnh project (bắt buộc)</Label>
            <Input id="imageUrls" placeholder="https://.../img1.png, https://.../img2.png" value={imageUrlsText} onChange={(e) => setImageUrlsText(e.target.value)} required />
            <p className="text-xs text-muted-foreground mt-1">Nhập ít nhất 1 link ảnh, phân cách bằng dấu phẩy</p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-5 space-y-3">
            <h2 className="font-display font-semibold">Thông tin định giá</h2>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={hasFullSource} onChange={(e) => setHasFullSource(e.target.checked)} />
              Có source đầy đủ
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={hasReadme} onChange={(e) => setHasReadme(e.target.checked)} />
              Có README
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={hasDbSchema} onChange={(e) => setHasDbSchema(e.target.checked)} />
              Có database/schema
            </label>
          </div>

          <div className="rounded-xl border bg-muted/30 p-5 space-y-4">
            <h2 className="font-display font-semibold">Bộ tính giá & giá mong muốn</h2>
            {priceSuggested > 0 ? (
              <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Giá bán nhanh</p>
                    <p className="font-semibold">{priceLow.toLocaleString("vi-VN")}₫</p>
                  </div>
                  <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-3">
                    <p className="text-xs text-muted-foreground">Giá đề xuất</p>
                    <p className="font-display text-lg font-bold">{priceSuggested.toLocaleString("vi-VN")}₫</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Giá cao có thể thử</p>
                    <p className="font-semibold">{priceHigh.toLocaleString("vi-VN")}₫</p>
                  </div>
                </div>

                {!price && (
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={handleUseRecommended} className="flex-1">
                      Dùng giá đề xuất
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={handleUseCustom} className="flex-1">
                      Nhập giá mong muốn
                    </Button>
                  </div>
                )}

                {priceMode === "custom" && !price && (
                  <div className="space-y-2">
                    <Label>Giá mong muốn (VND)</Label>
                    <div className="flex gap-2">
                      <Input type="number" placeholder="vd: 5000000" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} />
                      <Button type="button" size="sm" onClick={handleCustomPriceConfirm} disabled={!customPrice}>OK</Button>
                    </div>
                    {customExceeds30 && (
                      <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
                        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                        <p className="text-xs text-warning">Giá cao hơn đề xuất &gt;30%. Nên cân nhắc để dễ bán.</p>
                      </div>
                    )}
                  </div>
                )}

                {price && (
                  <div className="rounded-xl border bg-card p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Giá mong muốn</p>
                      <p className="font-display text-xl font-bold">{Number(price).toLocaleString("vi-VN")}₫</p>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={() => { setPrice(""); setPriceSuggested(0); setPriceMode(""); }}>
                      Tính lại
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <PricingCalculator onApply={handlePriceApply} />
            )}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang gửi..." : "Gửi chờ duyệt"}
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default PostProject;
