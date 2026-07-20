import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, ShieldCheck, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { apiFetch, isAuthenticated } from "@/lib/api";

interface OrderResponseData {
  id: number;
  projectId: number;
  projectTitle: string;
  buyerId: number;
  buyerName: string;
  sellerId?: number;
  sellerName?: string;
  amount: number;
  platformFee: number;
  sellerAmount: number;
  status: string;
  createdAt: string;
  paidAt?: string;
  completedAt?: string;
}

const Checkout = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Đăng nhập để tiếp tục thanh toán");
      navigate("/login");
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await apiFetch(`/api/orders/${orderId}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body?.message || "Không thể tải thông tin đơn hàng");
        setOrder(body.data);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Lỗi tải đơn hàng");
        navigate("/explore");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  const handlePay = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const res = await apiFetch(`/api/orders/${order.id}/mock-pay`, {
        method: "PATCH",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || "Thanh toán thất bại");
      toast.success("Thanh toán thành công! Trạng thái: PAID");
      navigate("/profile?tab=purchases");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Thanh toán thất bại");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background">
      <Navbar />
      <div className="flex-1 container max-w-4xl py-10 px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại chi tiết dự án
        </button>

        <h1 className="text-3xl font-display font-extrabold tracking-tight mb-8">Thanh toán đơn hàng</h1>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {/* Payment Methods */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Phương thức thanh toán
              </h2>

              <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 flex items-start gap-4">
                <div className="mt-0.5 rounded-full bg-primary p-1.5 text-primary-foreground">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Thanh toán thử nghiệm (Mock Escrow)</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tiền của bạn sẽ được giữ an toàn trên hệ thống. Admin sẽ tiến hành kiểm tra source code và bàn giao cho bạn trước khi tiền được chuyển cho người bán.
                  </p>
                </div>
              </div>
            </div>

            {/* Note info */}
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6 flex gap-4">
              <HelpCircle className="h-6 w-6 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <h4 className="font-bold text-yellow-700 dark:text-yellow-400">Nguyên tắc bảo vệ người mua</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Platform đóng vai trò trung gian giữ tiền. Link GitHub của dự án sẽ không hiển thị ngay sau khi thanh toán mock. Chỉ khi Admin kiểm tra xong và nhấn Bàn giao (Order = COMPLETED), giao dịch mới hoàn tất.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold pb-2 border-b">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Tên dự án</span>
                  <span className="font-semibold block truncate">{order.projectTitle}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Mã đơn hàng</span>
                  <span className="font-mono text-xs">#{order.id}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Giá gốc</span>
                  <span>{order.amount.toLocaleString("vi-VN")}₫</span>
                </div>

                {order.platformFee > 0 && (
                  <div className="flex justify-between py-1 text-xs text-muted-foreground border-t border-dashed pt-2">
                    <span>Phí nền tảng (Seller chịu 5%)</span>
                    <span>{order.platformFee.toLocaleString("vi-VN")}₫</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 flex justify-between items-baseline font-bold text-lg">
                <span>Tổng thanh toán</span>
                <span className="text-primary">{order.amount.toLocaleString("vi-VN")}₫</span>
              </div>

              <Button
                className="w-full h-11 text-sm font-semibold mt-4"
                onClick={handlePay}
                disabled={paying || order.status !== "PENDING_PAYMENT"}
              >
                {paying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : order.status !== "PENDING_PAYMENT" ? (
                  "Đã thanh toán"
                ) : (
                  "Xác nhận thanh toán Mock"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
