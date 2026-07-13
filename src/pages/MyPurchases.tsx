import { Link } from "react-router-dom";
import { ShoppingBag, Download, Star, AlertCircle, Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

type OrderStatus = "PAID" | "COMPLETED" | "DISPUTED" | "REFUNDED";

interface MockPurchase {
  id: string;
  projectId: string;
  projectName: string;
  seller: string;
  price: number;
  licenseType: string;
  status: OrderStatus;
  purchasedAt: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string }> = {
  PAID: { label: "Đã thanh toán", cls: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400" },
  COMPLETED: { label: "Hoàn thành", cls: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400" },
  DISPUTED: { label: "Đang khiếu nại", cls: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400" },
  REFUNDED: { label: "Đã hoàn tiền", cls: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400" },
};

const LICENSE_LABEL: Record<string, string> = {
  PERSONAL: "Personal",
  COMMERCIAL: "Commercial",
  EXCLUSIVE: "Exclusive",
};

const mockPurchases: MockPurchase[] = [
  {
    id: "ORD-001",
    projectId: "1",
    projectName: "E-commerce Website Source Code",
    seller: "Nguyễn Dev",
    price: 1500000,
    licenseType: "COMMERCIAL",
    status: "COMPLETED",
    purchasedAt: "2026-06-15",
  },
  {
    id: "ORD-002",
    projectId: "2",
    projectName: "Admin Dashboard React Template",
    seller: "Trần Frontend",
    price: 750000,
    licenseType: "PERSONAL",
    status: "PAID",
    purchasedAt: "2026-06-20",
  },
];

const MyPurchases = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-4xl py-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Đơn mua của tôi</h1>
            <p className="mt-1 text-muted-foreground">Các source code và project bạn đã mua</p>
          </div>
        </div>

        {/* API notice */}
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-300/50 bg-amber-50/80 dark:bg-amber-900/20 dark:border-amber-700/50 p-3 text-sm text-amber-800 dark:text-amber-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>Demo:</strong> Dữ liệu đơn mua đang là mock. Backend chưa có Order/Download/Dispute API.
            Cần thêm: <code className="rounded bg-amber-100 dark:bg-amber-900/40 px-1 text-xs">GET /api/orders/my-purchases</code>,{" "}
            <code className="rounded bg-amber-100 dark:bg-amber-900/40 px-1 text-xs">GET /api/orders/{"{id}"}/download</code>
          </span>
        </div>

        {mockPurchases.length === 0 ? (
          <div className="rounded-xl border bg-muted/30 p-16 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Chưa có đơn mua nào</p>
            <p className="mt-1 text-sm text-muted-foreground">Khám phá marketplace để tìm source code phù hợp</p>
            <Link to="/explore" className="mt-4 inline-block">
              <Button>Khám phá ngay</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {mockPurchases.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status];
              return (
                <div key={order.id} className="rounded-xl border bg-card p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={statusCfg.cls}>
                          {statusCfg.label}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {LICENSE_LABEL[order.licenseType] ?? order.licenseType}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground">#{order.id}</span>
                      </div>

                      <h3 className="font-display text-lg font-semibold">{order.projectName}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">Người bán: {order.seller}</p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="font-display text-xl font-bold text-primary">
                        {order.price.toLocaleString("vi-VN")}₫
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.purchasedAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => toast.info("Tính năng tải file đang chờ Backend Order/Download API")}
                      disabled={order.status !== "COMPLETED" && order.status !== "PAID"}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Tải source code
                    </Button>
                    <Link to={`/project/${order.projectId}`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Xem trang dự án
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => toast.info("Tính năng đánh giá đang chờ backend")}
                    >
                      <Star className="h-3.5 w-3.5" />
                      Đánh giá
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-orange-300/50 text-orange-600 hover:bg-orange-50 dark:text-orange-400"
                      onClick={() => toast.info("Tính năng khiếu nại đang chờ backend")}
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      Khiếu nại
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyPurchases;
