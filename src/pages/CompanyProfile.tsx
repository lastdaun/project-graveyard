import { useState } from "react";
import { Building2, Globe, Mail, Phone, FileText, CheckCircle2, Clock, XCircle, Info, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

const STATUS_CONFIG: Record<VerificationStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  PENDING: {
    label: "Đang chờ xác minh",
    icon: <Clock className="h-4 w-4" />,
    cls: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  VERIFIED: {
    label: "Đã xác minh",
    icon: <CheckCircle2 className="h-4 w-4" />,
    cls: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400",
  },
  REJECTED: {
    label: "Bị từ chối",
    icon: <XCircle className="h-4 w-4" />,
    cls: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400",
  },
};

const CompanyProfile = () => {
  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [verificationStatus] = useState<VerificationStatus>("PENDING");
  const [isSaving, setIsSaving] = useState(false);

  const statusCfg = STATUS_CONFIG[verificationStatus];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !taxCode || !contactEmail) {
      toast.error("Vui lòng điền tên công ty, mã số thuế và email liên hệ");
      return;
    }
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    toast.success("Đã lưu hồ sơ công ty (demo — chưa nối backend)");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-2xl py-10">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Hồ sơ công ty</h1>
            <p className="mt-1 text-muted-foreground">Thông tin công ty để đăng bán project hộ trên nền tảng</p>
          </div>
        </div>

        {/* API notice */}
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-300/50 bg-amber-50/80 dark:bg-amber-900/20 dark:border-amber-700/50 p-3 text-sm text-amber-800 dark:text-amber-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>Demo:</strong> Backend chưa có CompanyProfile API. Dữ liệu nhập hiện chưa được lưu thật.
            Cần thêm: <code className="rounded bg-amber-100 dark:bg-amber-900/40 px-1 text-xs">POST /api/companies</code>,{" "}
            <code className="rounded bg-amber-100 dark:bg-amber-900/40 px-1 text-xs">GET /api/companies/me</code>
          </span>
        </div>

        {/* Verification status */}
        <div className="mb-6 rounded-xl border bg-card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Trạng thái xác minh</p>
            <p className="text-xs text-muted-foreground mt-0.5">Admin xác minh thông tin công ty trước khi cho phép đăng bán hộ</p>
          </div>
          <Badge variant="outline" className={`flex items-center gap-1.5 ${statusCfg.cls}`}>
            {statusCfg.icon}
            {statusCfg.label}
          </Badge>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Thông tin cơ bản
            </h2>

            <div className="space-y-2">
              <Label htmlFor="companyName">Tên công ty <span className="text-destructive">*</span></Label>
              <Input
                id="companyName"
                placeholder="CÔNG TY TNHH ABC TECHNOLOGY"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxCode">Mã số thuế (MST) <span className="text-destructive">*</span></Label>
              <Input
                id="taxCode"
                placeholder="0123456789"
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Admin dùng MST để xác minh tư cách pháp nhân</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả công ty</Label>
              <Textarea
                id="description"
                placeholder="Mô tả lĩnh vực hoạt động, dịch vụ chính của công ty..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Thông tin liên hệ
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email liên hệ <span className="text-destructive">*</span></span>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contact@company.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Số điện thoại</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">
                <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Website</span>
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="https://company.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>

          {/* Requirements info */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 font-semibold text-primary">
              <FileText className="h-4 w-4" />
              Để được xác minh công ty, bạn cần
            </div>
            <ul className="space-y-1.5 text-muted-foreground list-none pl-0">
              {[
                "Cung cấp MST hợp lệ",
                "Email công ty (domain riêng được ưu tiên)",
                "Mô tả rõ ràng về lĩnh vực hoạt động",
                "Admin xem xét trong 1–3 ngày làm việc",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? "Đang lưu..." : "Lưu hồ sơ công ty"}
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CompanyProfile;
