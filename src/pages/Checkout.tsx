import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft, ShoppingCart, Shield, User, Building2,
  Clock, Info, Loader2, CreditCard, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { isAuthenticated, adaptApiProject } from "@/lib/api";
import type { ApiProject, ApiResponse } from "@/types/api";
import type { Project } from "@/data/mockData";

const LICENSE_LABEL: Record<string, string> = {
  PERSONAL: "Cá nhân (Personal)",
  COMMERCIAL: "Thương mại (Commercial)",
  EXCLUSIVE: "Độc quyền (Exclusive)",
};

const PLATFORM_FEE_RATE = 0.05; // 5%

const Checkout = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Bạn cần đăng nhập để tiến hành mua");
      navigate("/login");
      return;
    }

    if (!projectId) { setNotFound(true); setIsLoading(false); return; }

    fetch(`/api/projects/${projectId}`)
      .then(async (res) => {
        if (res.status === 404) { setNotFound(true); return; }
        const body: ApiResponse<ApiProject> = await res.json();
        if (body.data) setProject(adaptApiProject(body.data));
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [projectId, navigate]);

  const handleConfirmPurchase = async () => {
    setIsConfirming(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsConfirming(false);
    toast.info("Tính năng thanh toán đang chờ Backend Order/Payment API. Liên hệ người bán để giao dịch.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold">Không tìm thấy dự án</h1>
          <Link to="/explore" className="mt-4 inline-block text-primary hover:underline">← Quay lại Marketplace</Link>
        </div>
      </div>
    );
  }

  const price = project.price ?? 0;
  const platformFee = Math.round(price * PLATFORM_FEE_RATE);
  const total = price + platformFee;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-3xl py-10">
        <Link to={`/project/${projectId}`} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Quay lại trang dự án
        </Link>

        <h1 className="mb-6 font-display text-3xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-7 w-7 text-primary" />
          Thanh toán
        </h1>

        {/* API notice */}
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-300/50 bg-amber-50/80 dark:bg-amber-900/20 dark:border-amber-700/50 p-3 text-sm text-amber-800 dark:text-amber-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>Demo:</strong> Backend chưa có Order/Payment API. Nút xác nhận chưa tạo đơn hàng thật.
            Sau khi BE có <code className="rounded bg-amber-100 dark:bg-amber-900/40 px-1 text-xs">POST /api/orders</code>, chỉ cần nối vào là hoạt động.
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left: Summary + Payment */}
          <div className="lg:col-span-3 space-y-5">
            {/* Order summary */}
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <h2 className="font-semibold">Thông tin đơn hàng</h2>

              <div className="flex gap-4">
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt={project.title} className="h-20 w-28 rounded-lg object-cover border shrink-0" />
                ) : (
                  <div className="h-20 w-28 rounded-lg border bg-muted/50 flex items-center justify-center shrink-0">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold leading-snug">{project.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {project.licenseType && (
                      <Badge variant="secondary" className="text-xs">
                        {LICENSE_LABEL[project.licenseType] ?? project.licenseType}
                      </Badge>
                    )}
                    <span className="tag tag-muted">{project.category}</span>
                  </div>
                </div>
              </div>

              {/* Seller */}
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {project.creator.avatar?.slice(0, 2) ?? "?"}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Người bán: </span>
                  <span className="font-medium">{project.creator.name}</span>
                </div>
                {project.sellerType && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    {project.sellerType === "INDIVIDUAL"
                      ? <><User className="h-3 w-3" /> Cá nhân</>
                      : <><Building2 className="h-3 w-3" /> Công ty</>
                    }
                  </span>
                )}
              </div>

              {project.supportDays != null && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" />
                  {project.supportDays > 0
                    ? `Được hỗ trợ ${project.supportDays} ngày sau mua`
                    : "Không có hỗ trợ sau mua"}
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <h2 className="font-semibold">Phương thức thanh toán</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <div className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${paymentMethod === "wallet" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                  onClick={() => setPaymentMethod("wallet")}>
                  <RadioGroupItem value="wallet" id="wallet" />
                  <Label htmlFor="wallet" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Wallet className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Ví Project Graveyard</p>
                      <p className="text-xs text-muted-foreground">Số dư: 4.500.000₫ (demo)</p>
                    </div>
                  </Label>
                </div>
                <div className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${paymentMethod === "bank" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                  onClick={() => setPaymentMethod("bank")}>
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Chuyển khoản ngân hàng</p>
                      <p className="text-xs text-muted-foreground">VietQR / Chuyển khoản thủ công</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Right: Price breakdown */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border bg-card p-5 space-y-4 sticky top-20">
              <h2 className="font-semibold">Tổng thanh toán</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giá bán</span>
                  <span className="font-medium">{price.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí nền tảng (5%)</span>
                  <span className="font-medium">{platformFee.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-base font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{total.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-xs text-green-700 dark:text-green-400">
                <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>Giao dịch được bảo vệ. Hoàn tiền nếu source code không đúng mô tả.</span>
              </div>

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleConfirmPurchase}
                disabled={isConfirming}
              >
                <ShoppingCart className="h-4 w-4" />
                {isConfirming ? "Đang xử lý..." : `Xác nhận mua — ${total.toLocaleString("vi-VN")}₫`}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Bằng cách mua, bạn đồng ý với{" "}
                <span className="text-primary cursor-pointer hover:underline">điều khoản sử dụng</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
