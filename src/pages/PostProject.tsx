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
import type { CollaborationMode } from "@/data/mockData";
import PricingCalculator from "@/components/PricingCalculator";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertTriangle } from "lucide-react";
import { apiFetch, isAuthenticated } from "@/lib/api";

const COLLAB_MODE_MAP: Record<string, string> = {
  "Free Collaboration": "FREE_COLLABORATION",
  "Profit Sharing": "PROFIT_SHARING",
  "Sell Usage Rights": "SELL_USAGE_RIGHTS",
  "Find Co-founder": "FIND_COFOUNDER",
};

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
  const [status, setStatus] = useState(""); // mapping to progress / projectStatus
  const [skills, setSkills] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [collabMode, setCollabMode] = useState<CollaborationMode | "">("");
  const [price, setPrice] = useState("");
  const [aiPrice, setAiPrice] = useState(0);
  const [priceMode, setPriceMode] = useState<"recommended" | "custom" | "">("");
  const [customPrice, setCustomPrice] = useState("");
  const [equitySplit, setEquitySplit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Fields from Sprint 2 / Flow new requirements
  const [completionStatus, setCompletionStatus] = useState<"COMPLETED" | "INCOMPLETE" | "">("");
  const [completionPercent, setCompletionPercent] = useState("");
  const [completedParts, setCompletedParts] = useState("");
  const [missingParts, setMissingParts] = useState("");
  const [currentStage, setCurrentStage] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [imageUrlsText, setImageUrlsText] = useState(""); // comma separated for temporary URLs

  // For completed projects details
  const [completedFeatures, setCompletedFeatures] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [handoverInstructions, setHandoverInstructions] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      toast.error("Bạn cần đăng nhập để đăng dự án");
      navigate("/login");
      return;
    }

    if (!category || !status || !collabMode || !completionStatus) {
      toast.error("Vui lòng điền đầy đủ danh mục, trạng thái, hình thức hợp tác và tình trạng hoàn thiện");
      return;
    }

    const imageList = imageUrlsText
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);

    if (imageList.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 hình ảnh để admin dễ duyệt và buyer dễ đánh giá project.");
      return;
    }

    if (collabMode === "Sell Usage Rights" && !price) {
      toast.error("Vui lòng chọn hoặc nhập giá bán cho dự án");
      return;
    }

    const skillsArray = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Build descriptions or notes based on completeness
    let finalDesc = description;
    if (completionStatus === "COMPLETED") {
      finalDesc += `\n\n**Tính năng hoàn thành:**\n${completedFeatures}\n\n**Hướng dẫn bàn giao:**\n${handoverInstructions}`;
    }

    const payload: Record<string, unknown> = {
      title,
      description: finalDesc,
      category: CATEGORY_MAP[category] ?? category.toUpperCase(),
      status: STATUS_MAP[status] ?? status.toUpperCase(),
      collaborationMode: COLLAB_MODE_MAP[collabMode] ?? collabMode,
      skillsNeeded: skillsArray,
      teamSize: Number(teamSize) || 1,
      progress: completionStatus === "COMPLETED" ? 100 : Number(completionPercent) || 50,
      listingType: "USER_PROJECT",
      completionStatus,
      completionPercent: completionStatus === "COMPLETED" ? 100 : Number(completionPercent) || null,
      completedParts: completionStatus === "INCOMPLETE" ? completedParts : null,
      missingParts: completionStatus === "INCOMPLETE" ? missingParts : null,
      currentStage: completionStatus === "INCOMPLETE" ? currentStage : "COMPLETED",
      githubUrl: githubUrl || null,
      imageUrls: imageList,
      demoUrl: demoUrl || null,
      supportDays: 7, // default support
    };

    if (collabMode === "Sell Usage Rights" && price) {
      payload.price = Number(price);
    }

    if (collabMode === "Profit Sharing" && equitySplit) {
      payload.equitySplit = Number(equitySplit);
    }

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

      toast.success(t("post.success"));
      navigate("/explore");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Đã xảy ra lỗi khi kết nối máy chủ";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceApply = (p: number) => {
    // Adjust pricing based on Completion Status (Phase 12 pricing logic)
    // completedFactor = 1.1, incompleteFactor = completionPercent% (e.g. 0.6 if 60%)
    let factor = 1.0;
    if (completionStatus === "COMPLETED") {
      factor = 1.1;
    } else if (completionStatus === "INCOMPLETE") {
      factor = (Number(completionPercent) || 50) / 100;
    }
    const adjustedPrice = Math.round(p * factor);
    setAiPrice(adjustedPrice);
    setPriceMode("");
    setPrice("");
    setCustomPrice("");
  };

  const handleUseRecommended = () => {
    setPrice(String(aiPrice));
    setPriceMode("recommended");
    toast.success(t("post.price.applied"));
  };

  const handleUseCustom = () => {
    setPriceMode("custom");
  };

  const handleCustomPriceConfirm = () => {
    setPrice(customPrice);
    toast.success(t("post.price.applied"));
  };

  const customExceeds30 = customPrice && aiPrice > 0 && Number(customPrice) > aiPrice * 1.3;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-2xl py-10">
        <h1 className="mb-2 font-display text-3xl font-bold">{t("post.title")}</h1>
        <p className="mb-8 text-muted-foreground">{t("post.sub")}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">{t("post.name")}</Label>
            <Input id="title" placeholder={t("post.name.ph")} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">{t("post.desc")}</Label>
            <Textarea id="desc" placeholder={t("post.desc.ph")} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("post.category")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder={t("post.category.ph")} /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="IT">IT / Phần mềm</SelectItem>
                    <SelectItem value="Startup IT">Startup IT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("post.status")}</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue placeholder={t("post.status.ph")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ý tưởng">{t("status.idea")}</SelectItem>
                  <SelectItem value="Nguyên mẫu">{t("status.prototype")}</SelectItem>
                  <SelectItem value="Đang phát triển">{t("status.developing")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Completion Status Selection */}
          <div className="rounded-xl border bg-muted/20 p-5 space-y-4">
            <div className="space-y-2">
              <Label>{t("post.completionStatus")}</Label>
              <Select value={completionStatus} onValueChange={(v) => setCompletionStatus(v as "COMPLETED" | "INCOMPLETE")}>
                <SelectTrigger><SelectValue placeholder={t("post.completionStatus.ph")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPLETED">{t("post.completionStatus.completed")}</SelectItem>
                  <SelectItem value="INCOMPLETE">{t("post.completionStatus.incomplete")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {completionStatus === "INCOMPLETE" && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="percent">{t("post.completionPercent")} (%)</Label>
                  <Input id="percent" type="number" placeholder="vd: 60" min="1" max="99" value={completionPercent} onChange={(e) => setCompletionPercent(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="completedParts">{t("post.completedParts")}</Label>
                  <Textarea id="completedParts" placeholder={t("post.completedParts.ph")} value={completedParts} onChange={(e) => setCompletedParts(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="missingParts">{t("post.missingParts")}</Label>
                  <Textarea id="missingParts" placeholder={t("post.missingParts.ph")} value={missingParts} onChange={(e) => setMissingParts(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>{t("post.currentStage")}</Label>
                  <Select value={currentStage} onValueChange={setCurrentStage}>
                    <SelectTrigger><SelectValue placeholder={t("post.currentStage.ph")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prototype">Prototype</SelectItem>
                      <SelectItem value="MVP">MVP</SelectItem>
                      <SelectItem value="Developing">Đang phát triển</SelectItem>
                      <SelectItem value="AlmostDone">Gần xong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {completionStatus === "COMPLETED" && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="features">Tính năng đã hoàn thành</Label>
                  <Textarea id="features" placeholder="Mô tả các tính năng cốt lõi đã chạy ổn định..." value={completedFeatures} onChange={(e) => setCompletedFeatures(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demoUrl">Demo URL</Label>
                  <Input id="demoUrl" placeholder="https://example.com/demo" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Hướng dẫn cài đặt / bàn giao</Label>
                  <Textarea id="instructions" placeholder="Hướng dẫn deploy hoặc chạy thử code..." value={handoverInstructions} onChange={(e) => setHandoverInstructions(e.target.value)} required />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubUrl">{t("post.githubUrl")}</Label>
            <Input id="githubUrl" placeholder={t("post.githubUrl.ph")} value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">{t("post.skills")}</Label>
            <Input id="skills" placeholder={t("post.skills.ph")} value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team">{t("post.team")}</Label>
            <Input id="team" type="number" placeholder="vd: 3" min="1" max="20" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} />
          </div>

          {/* Image URLs input temporary */}
          <div className="space-y-2 rounded-xl border bg-muted/20 p-5">
            <Label htmlFor="imageUrls">{t("post.imageUrls")}</Label>
            <Input id="imageUrls" placeholder={t("post.imageUrl.ph")} value={imageUrlsText} onChange={(e) => setImageUrlsText(e.target.value)} required />
            <p className="text-xs text-muted-foreground mt-1">Vui lòng nhập ít nhất 1 link ảnh (phân cách bằng dấu phẩy nếu nhiều ảnh)</p>
          </div>

          {/* Collaboration Mode */}
          <div className="rounded-xl border bg-muted/30 p-5 space-y-4">
            <h2 className="font-display font-semibold">{t("post.collab.title")}</h2>
            <div className="space-y-2">
              <Label>{t("post.collab.question")}</Label>
              <Select value={collabMode} onValueChange={(v) => { setCollabMode(v as CollaborationMode); setPrice(""); setAiPrice(0); setPriceMode(""); setCustomPrice(""); }}>
                <SelectTrigger><SelectValue placeholder={t("post.collab.ph")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free Collaboration">{t("post.collab.free")}</SelectItem>
                  <SelectItem value="Profit Sharing">{t("post.collab.profit")}</SelectItem>
                  <SelectItem value="Sell Usage Rights">{t("post.collab.sell")}</SelectItem>
                  <SelectItem value="Find Co-founder">{t("post.collab.cofounder")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {collabMode === "Sell Usage Rights" && (
              <div className="space-y-2">
                <Label>{t("post.pricing.label")}</Label>
                {aiPrice > 0 ? (
                  <div className="space-y-3">
                    <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
                      <p className="text-xs text-muted-foreground">{t("post.pricing.recommended")}</p>
                      <p className="font-display text-xl font-bold">{aiPrice.toLocaleString("vi-VN")}₫</p>
                    </div>

                    {!price && (
                      <div className="flex gap-2">
                        <Button type="button" size="sm" onClick={handleUseRecommended} className="flex-1">
                          {t("post.price.use_recommended")}
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={handleUseCustom} className="flex-1">
                          {t("post.price.custom")}
                        </Button>
                      </div>
                    )}

                    {priceMode === "custom" && !price && (
                      <div className="space-y-2">
                        <Label>{t("post.price.custom_label")}</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="vd: 15000000"
                            value={customPrice}
                            onChange={(e) => setCustomPrice(e.target.value)}
                          />
                          <Button type="button" size="sm" onClick={handleCustomPriceConfirm} disabled={!customPrice}>
                            OK
                          </Button>
                        </div>
                        {customExceeds30 && (
                          <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
                            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                            <p className="text-xs text-warning">{t("post.price.warning")}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {price && (
                      <div className="rounded-xl border bg-card p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">{priceMode === "custom" ? t("post.price.custom") : t("post.price.use_recommended")}</p>
                          <p className="font-display text-xl font-bold">{Number(price).toLocaleString("vi-VN")}₫</p>
                        </div>
                        <Button type="button" size="sm" variant="outline" onClick={() => { setPrice(""); setAiPrice(0); setPriceMode(""); setCustomPrice(""); }}>
                          {t("post.pricing.recalc")}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <PricingCalculator onApply={handlePriceApply} />
                )}
              </div>
            )}

            {collabMode === "Profit Sharing" && (
              <div className="space-y-2">
                <Label htmlFor="equity">{t("post.equity.label")}</Label>
                <Input id="equity" type="number" placeholder="vd: 60" min="1" max="99" value={equitySplit} onChange={(e) => setEquitySplit(e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  {t("post.equity.you")} {equitySplit || "—"}% · {t("post.equity.them")} {equitySplit ? 100 - Number(equitySplit) : "—"}%
                </p>
              </div>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng..." : t("post.submit")}
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default PostProject;
