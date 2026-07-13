import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { apiFetch, isAuthenticated } from "@/lib/api";
import { Info, GitBranch, AlertTriangle } from "lucide-react";
import {
  ProjectValuationAssistant,
  calculateValuation,
  PROJECT_TYPE_OPTIONS,
  CODE_STATUS_OPTIONS,
  type ValuationInput,
  type ProjectType,
  type CodeStatus,
} from "@/components/ProjectValuationAssistant";

const CATEGORY_MAP: Record<string, string> = {
  IT: "IT",
  Startup: "STARTUP",
};

const HANDOVER_OPTIONS = [
  { label: "Bán source code", value: "SELL_SOURCE_CODE" },
  { label: "Chuyển nhượng toàn bộ ownership", value: "TRANSFER_OWNERSHIP" },
  { label: "Tìm đồng sáng lập (Co-founder)", value: "FIND_COFOUNDER" },
  { label: "Tìm người đóng góp (Contributor)", value: "FIND_CONTRIBUTOR" },
  { label: "Chia sẻ lợi nhuận (Profit Sharing)", value: "PROFIT_SHARING" },
];

const STAGE_OPTIONS = [
  { label: "Ý tưởng — chưa code", value: "IDEA" },
  { label: "Prototype — đã có giao diện thô", value: "PROTOTYPE" },
  { label: "MVP — chạy được tính năng cốt lõi", value: "MVP" },
  { label: "Đang phát triển — còn dang dở", value: "IN_DEVELOPMENT" },
  { label: "Gần xong — >80% hoàn thiện", value: "NEARLY_COMPLETED" },
  { label: "Hoàn thiện — 100% nhưng muốn bán/chuyển nhượng", value: "COMPLETED" },
];

// ── Checkbox helper ────────────────────────────────────────────────────────────
const CheckRow = ({
  id, label, checked, onChange,
}: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label
    htmlFor={id}
    className="flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5"
  >
    <input
      id={id}
      type="checkbox"
      className="h-4 w-4 accent-primary"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    {label}
  </label>
);

const PostProject = () => {
  const navigate = useNavigate();

  // Basic
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [techStack, setTechStack] = useState("");
  const [completionPercent, setCompletionPercent] = useState(50);
  const [projectStage, setProjectStage] = useState("");
  const [completedParts, setCompletedParts] = useState("");
  const [missingParts, setMissingParts] = useState("");
  const [handoverType, setHandoverType] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [price, setPrice] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Valuation inputs
  const [projectType, setProjectType] = useState<ProjectType | "">("");
  const [hasDemo, setHasDemo] = useState(false);
  const [hasSourceCode, setHasSourceCode] = useState(false);
  const [hasDatabase, setHasDatabase] = useState(false);
  const [hasReadme, setHasReadme] = useState(false);
  const [hasApiDocs, setHasApiDocs] = useState(false);
  const [hasScreenshots, setHasScreenshots] = useState(false);
  const [hasTestAccount, setHasTestAccount] = useState(false);
  const [codeStatus, setCodeStatus] = useState<CodeStatus | "">("");

  const showPrice = handoverType === "SELL_SOURCE_CODE" || handoverType === "TRANSFER_OWNERSHIP";

  const valuationInput: ValuationInput = useMemo(() => ({
    projectType,
    completionPercent,
    projectStage,
    hasDemo,
    hasSourceCode,
    hasDatabase,
    hasReadme,
    hasApiDocs,
    hasScreenshots,
    hasTestAccount,
    codeStatus,
    handoverType,
  }), [projectType, completionPercent, projectStage, hasDemo, hasSourceCode,
      hasDatabase, hasReadme, hasApiDocs, hasScreenshots, hasTestAccount, codeStatus, handoverType]);

  const valuation = useMemo(() => calculateValuation(valuationInput), [valuationInput]);

  // Price warning logic
  const priceNum = price ? Number(price) : 0;
  const priceWarning: "high" | "low" | null = useMemo(() => {
    if (!showPrice || !priceNum || !valuation) return null;
    if (priceNum > valuation.estimatedPriceSuggested * 1.5) return "high";
    if (priceNum < valuation.estimatedPriceSuggested * 0.6) return "low";
    return null;
  }, [showPrice, priceNum, valuation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      toast.error("Bạn cần đăng nhập để đăng project");
      navigate("/login");
      return;
    }

    if (!category || !projectStage || !handoverType) {
      toast.error("Vui lòng điền đầy đủ: danh mục, giai đoạn dự án và hình thức chuyển giao");
      return;
    }

    if (showPrice && price && Number(price) < 1) {
      toast.error("Giá phải lớn hơn 0");
      return;
    }

    const techArray = techStack.split(",").map((s) => s.trim()).filter(Boolean);

    const payload: Record<string, unknown> = {
      title,
      description,
      category: CATEGORY_MAP[category] ?? category.toUpperCase(),
      status: "DEVELOPING",
      techStack: techArray,
      teamSize: 1,
      progress: completionPercent,
      collaborationMode: "FIND_COFOUNDER",
      projectStage,
      completionPercent,
      completedParts: completedParts.trim() || null,
      missingParts: missingParts.trim() || null,
      handoverType,
      lookingFor: lookingFor.trim() || null,
    };

    if (showPrice && price) payload.price = Number(price);
    if (demoUrl.trim()) payload.demoUrl = demoUrl.trim();

    // Valuation fields
    if (valuation) {
      payload.estimatedPriceLow       = valuation.estimatedPriceLow;
      payload.estimatedPriceSuggested  = valuation.estimatedPriceSuggested;
      payload.estimatedPriceHigh       = valuation.estimatedPriceHigh;
      payload.valuationScore           = valuation.valuationScore;
      payload.valuationConfidence      = valuation.valuationConfidence;
      payload.valuationNote            = valuation.valuationNote;
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
      if (!response.ok) throw new Error(data?.message || "Đăng project thất bại");

      toast.success("Đã gửi duyệt! Admin xem xét và duyệt trước khi hiển thị công khai.");
      navigate("/my-listings");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi khi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-2xl py-10">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <GitBranch className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Đăng project bỏ dở</h1>
            <p className="mt-1 text-muted-foreground">Chia sẻ project chưa hoàn thành — tìm người mua, đồng sáng lập, hoặc contributor</p>
          </div>
        </div>

        <div className="mb-6 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-primary">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Sau khi gửi, bài đăng sẽ ở trạng thái <strong>Chờ duyệt</strong>. Admin xem xét và duyệt trước khi hiển thị công khai.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── Basic info ─────────────────────────────────────────────────── */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold">Thông tin cơ bản</h2>

            <div className="space-y-2">
              <Label htmlFor="title">Tên project <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                placeholder="vd: Ticket Resell Platform — nền tảng bán lại vé"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Mô tả project <span className="text-destructive">*</span></Label>
              <Textarea
                id="desc"
                placeholder="Giải thích project là gì, đã làm được gì, dùng để làm gì..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Danh mục <span className="text-destructive">*</span></Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT / Phần mềm</SelectItem>
                    <SelectItem value="Startup">Startup IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Giai đoạn dự án <span className="text-destructive">*</span></Label>
                <Select value={projectStage} onValueChange={setProjectStage}>
                  <SelectTrigger><SelectValue placeholder="Chọn giai đoạn" /></SelectTrigger>
                  <SelectContent>
                    {STAGE_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Mức độ hoàn thiện: <span className="font-semibold text-primary">{completionPercent}%</span></Label>
              <Slider
                value={[completionPercent]}
                onValueChange={([v]) => setCompletionPercent(v)}
                min={0}
                max={100}
                step={5}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tech">Tech Stack</Label>
              <Input
                id="tech"
                placeholder="vd: React, Spring Boot, PostgreSQL (cách nhau bằng dấu phẩy)"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
              />
            </div>
          </div>

          {/* ── Project state details ───────────────────────────────────────── */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold">Chi tiết tình trạng project</h2>

            <div className="space-y-2">
              <Label htmlFor="done">Phần đã hoàn thành</Label>
              <Textarea
                id="done"
                placeholder="vd: Auth, ticket listing, search, database schema, API endpoints"
                rows={3}
                value={completedParts}
                onChange={(e) => setCompletedParts(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="missing">Phần còn thiếu / chưa làm</Label>
              <Textarea
                id="missing"
                placeholder="vd: Payment integration, realtime chat, admin dashboard, deployment"
                rows={3}
                value={missingParts}
                onChange={(e) => setMissingParts(e.target.value)}
              />
            </div>
          </div>

          {/* ── Valuation section ──────────────────────────────────────────── */}
          <div className="rounded-xl border bg-card p-5 space-y-5">
            <div>
              <h2 className="font-semibold">Bộ gợi ý giá</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Trả lời để nhận gợi ý giá phù hợp với tình trạng project</p>
            </div>

            {/* Project type */}
            <div className="space-y-2">
              <Label>Loại project</Label>
              <Select value={projectType} onValueChange={(v) => setProjectType(v as ProjectType)}>
                <SelectTrigger><SelectValue placeholder="Chọn loại project" /></SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Demo / source checklist */}
            <div className="space-y-2">
              <Label>Tình trạng bàn giao</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                <CheckRow id="hasDemo"        label="Có demo chạy được"       checked={hasDemo}        onChange={setHasDemo} />
                <CheckRow id="hasSourceCode"  label="Có source code đầy đủ"   checked={hasSourceCode}  onChange={setHasSourceCode} />
                <CheckRow id="hasDatabase"    label="Có database / schema"     checked={hasDatabase}    onChange={setHasDatabase} />
                <CheckRow id="hasReadme"      label="Có README / setup guide"  checked={hasReadme}      onChange={setHasReadme} />
                <CheckRow id="hasApiDocs"     label="Có API docs / Postman"    checked={hasApiDocs}     onChange={setHasApiDocs} />
                <CheckRow id="hasScreenshots" label="Có screenshot / video"    checked={hasScreenshots} onChange={setHasScreenshots} />
                <CheckRow id="hasTestAccount" label="Có tài khoản test"        checked={hasTestAccount} onChange={setHasTestAccount} />
              </div>
            </div>

            {/* Code status */}
            <div className="space-y-2">
              <Label>Tình trạng code</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {CODE_STATUS_OPTIONS.map((o) => (
                  <label
                    key={o.value}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 ${codeStatus === o.value ? "border-primary/50 bg-primary/5 font-medium text-primary" : ""}`}
                  >
                    <input
                      type="radio"
                      name="codeStatus"
                      className="accent-primary"
                      checked={codeStatus === o.value}
                      onChange={() => setCodeStatus(o.value as CodeStatus)}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Valuation result */}
            <ProjectValuationAssistant
              input={valuationInput}
              onUseSuggestedPrice={(p) => {
                setPrice(String(p));
                if (!handoverType) setHandoverType("SELL_SOURCE_CODE");
              }}
            />
          </div>

          {/* ── Handover & price ───────────────────────────────────────────── */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold">Hình thức & mong muốn</h2>

            <div className="space-y-2">
              <Label>Bạn đang tìm gì? <span className="text-destructive">*</span></Label>
              <Select value={handoverType} onValueChange={setHandoverType}>
                <SelectTrigger><SelectValue placeholder="Chọn hình thức chuyển giao" /></SelectTrigger>
                <SelectContent>
                  {HANDOVER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="looking">Mô tả thêm về người/team bạn muốn tìm</Label>
              <Textarea
                id="looking"
                placeholder="vd: Tìm developer có kinh nghiệm React, hoặc startup muốn mua lại để tiếp tục phát triển"
                rows={3}
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
              />
            </div>

            {showPrice && (
              <div className="space-y-2">
                <Label htmlFor="price">Giá mong muốn (VNĐ) — để trống nếu thương lượng</Label>
                {valuation && (
                  <p className="text-xs text-muted-foreground">
                    Gợi ý: {valuation.estimatedPriceLow.toLocaleString("vi-VN")}₫ – {valuation.estimatedPriceHigh.toLocaleString("vi-VN")}₫
                  </p>
                )}
                <Input
                  id="price"
                  type="number"
                  placeholder="vd: 5000000"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={priceWarning === "high" ? "border-amber-400 focus-visible:ring-amber-400" : priceWarning === "low" ? "border-blue-400 focus-visible:ring-blue-400" : ""}
                />
                {price && Number(price) > 0 && (
                  <p className="text-sm font-medium text-primary">
                    {Number(price).toLocaleString("vi-VN")}₫
                  </p>
                )}

                {/* Price warnings */}
                {priceWarning === "high" && (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50/80 dark:bg-amber-900/20 dark:border-amber-700/50 p-3 text-xs text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>Giá bạn nhập cao hơn khá nhiều so với mức gợi ý. Project vẫn có thể bán được nếu bạn bổ sung demo, tài liệu hoặc cam kết hỗ trợ sau bàn giao.</span>
                  </div>
                )}
                {priceWarning === "low" && (
                  <div className="flex items-start gap-2 rounded-lg border border-blue-300/60 bg-blue-50/80 dark:bg-blue-900/20 dark:border-blue-700/50 p-3 text-xs text-blue-800 dark:text-blue-300">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>Giá này thấp hơn mức gợi ý. Project có thể dễ bán hơn, nhưng bạn nên cân nhắc công sức đã bỏ ra.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Optional ───────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="demo">Link Demo / GitHub (tuỳ chọn)</Label>
              <Input
                id="demo"
                placeholder="https://demo.example.com hoặc https://github.com/..."
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang gửi..." : "Gửi đăng duyệt"}
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default PostProject;
