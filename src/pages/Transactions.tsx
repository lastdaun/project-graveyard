import { useState, useEffect, useCallback } from "react";
import { Wallet, TrendingUp, TrendingDown, FileText, ArrowUpRight, ArrowDownLeft, QrCode, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

type TxStatus = "completed" | "pending" | "failed";
type TxType = "income" | "expense";

interface Transaction {
  id: string;
  date: string;
  description: { vi: string; en: string };
  amount: number;
  type: TxType;
  status: TxStatus;
}

const initialTransactions: Transaction[] = [
  { id: "TRX-9823", date: "20/03/2026", description: { vi: "Bán quyền sử dụng: App quản lý chi tiêu", en: "Sold usage rights: Expense Tracker App" }, amount: 12500000, type: "income", status: "completed" },
  { id: "TRX-9801", date: "18/03/2026", description: { vi: "Phí đăng dự án nổi bật", en: "Featured project listing fee" }, amount: 50000, type: "expense", status: "completed" },
  { id: "TRX-9784", date: "15/03/2026", description: { vi: "Bán quyền sử dụng: Dashboard UI Kit", en: "Sold usage rights: Dashboard UI Kit" }, amount: 3750000, type: "income", status: "completed" },
  { id: "TRX-9770", date: "12/03/2026", description: { vi: "Nâng cấp Premium (tháng 3)", en: "Premium upgrade (March)" }, amount: 125000, type: "expense", status: "completed" },
  { id: "TRX-9755", date: "10/03/2026", description: { vi: "Chia sẻ lợi nhuận: EcoTracker", en: "Profit share: EcoTracker" }, amount: 2000000, type: "income", status: "pending" },
  { id: "TRX-9740", date: "08/03/2026", description: { vi: "Mua quyền sử dụng: Motion Graphics Pack", en: "Bought usage rights: Motion Graphics Pack" }, amount: 875000, type: "expense", status: "completed" },
  { id: "TRX-9722", date: "05/03/2026", description: { vi: "Rút tiền về tài khoản ngân hàng", en: "Withdrawal to bank account" }, amount: 5000000, type: "expense", status: "failed" },
  { id: "TRX-9710", date: "01/03/2026", description: { vi: "Bán quyền sử dụng: Landing Page Template", en: "Sold usage rights: Landing Page Template" }, amount: 375000, type: "income", status: "completed" },
];

const banks = [
  "Vietcombank", "VietinBank", "BIDV", "Techcombank", "MB Bank",
  "ACB", "VPBank", "Sacombank", "TPBank", "Agribank",
];

const quickAmounts = [50000, 100000, 500000];

const Transactions = () => {
  const { t } = useLanguage();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [tab, setTab] = useState("all");

  const [balance, setBalance] = useState(4500000);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Top-up state
  const [topUpStep, setTopUpStep] = useState<"form" | "qr" | "success">("form");
  const [topUpAmount, setTopUpAmount] = useState<number>(0);
  const [topUpMethod, setTopUpMethod] = useState("");
  const [countdown, setCountdown] = useState(599);

  const totalEarned = transactions.filter(tx => tx.type === "income" && tx.status === "completed").reduce((s, tx) => s + tx.amount, 0);
  const totalSpent = transactions.filter(tx => tx.type === "expense" && tx.status === "completed").reduce((s, tx) => s + tx.amount, 0);

  const filtered = tab === "all"
    ? transactions
    : tab === "income"
      ? transactions.filter((tx) => tx.type === "income")
      : transactions.filter((tx) => tx.type === "expense");

  // Countdown timer for QR step
  useEffect(() => {
    if (topUpStep !== "qr") return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [topUpStep]);

  const fmtCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleGenerateCode = () => {
    if (topUpAmount > 0 && topUpMethod) {
      setCountdown(599);
      setTopUpStep("qr");
    }
  };

  const handleSimulateSuccess = useCallback(() => {
    setTopUpStep("success");
    setBalance((prev) => prev + topUpAmount);

    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1).toString().padStart(2, "0")}/${today.getFullYear()}`;
    const newTx: Transaction = {
      id: `TRX-${Math.floor(Math.random() * 9000) + 1000}`,
      date: dateStr,
      description: { vi: "Nạp tiền vào ví", en: "Wallet Top Up" },
      amount: topUpAmount,
      type: "income",
      status: "completed",
    };
    setTransactions((prev) => [newTx, ...prev]);

    setTimeout(() => {
      setTopUpOpen(false);
      setTopUpStep("form");
      setTopUpAmount(0);
      setTopUpMethod("");
    }, 2000);
  }, [topUpAmount]);

  const handleTopUpClose = (open: boolean) => {
    if (!open) {
      setTopUpOpen(false);
      if (topUpStep !== "success") {
        setTopUpStep("form");
        setTopUpAmount(0);
        setTopUpMethod("");
      }
    }
  };

  const statusBadge = (status: TxStatus) => {
    const map: Record<TxStatus, { label: string; cls: string }> = {
      completed: { label: t("tx.status.completed"), cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
      pending: { label: t("tx.status.pending"), cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
      failed: { label: t("tx.status.failed"), cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    };
    const s = map[status];
    return <Badge variant="outline" className={`border-0 ${s.cls}`}>{s.label}</Badge>;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-6xl py-10">
        <h1 className="mb-2 font-display text-3xl font-bold">{t("tx.title")}</h1>
        <p className="mb-4 text-muted-foreground">{t("tx.sub")}</p>

        <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-300/50 bg-amber-50/80 dark:bg-amber-900/20 dark:border-amber-700/50 p-3 text-sm text-amber-800 dark:text-amber-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>Demo:</strong> Dữ liệu ví và giao dịch hiện tại là mock. Backend chưa có Order/Wallet/Transaction API.
            Tính năng thanh toán thật sẽ được tích hợp khi backend hoàn thiện.
          </span>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("tx.balance")}</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{fmt(balance)}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="gap-1.5" onClick={() => setTopUpOpen(true)}>
                  <ArrowDownLeft className="h-3.5 w-3.5" />
                  {t("tx.topup")}
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setWithdrawOpen(true)}>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {t("tx.withdraw")}
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("tx.earned")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{fmt(totalEarned)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("tx.earned.sub")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("tx.spent")}</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{fmt(totalSpent)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("tx.spent.sub")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("tx.history")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">{t("tx.tab.all")}</TabsTrigger>
                <TabsTrigger value="income">{t("tx.tab.income")}</TabsTrigger>
                <TabsTrigger value="expense">{t("tx.tab.expense")}</TabsTrigger>
              </TabsList>

              <TabsContent value={tab}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("tx.col.id")}</TableHead>
                      <TableHead>{t("tx.col.date")}</TableHead>
                      <TableHead>{t("tx.col.desc")}</TableHead>
                      <TableHead className="text-right">{t("tx.col.amount")}</TableHead>
                      <TableHead>{t("tx.col.status")}</TableHead>
                      <TableHead className="text-center">{t("tx.col.action")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-xs">#{tx.id}</TableCell>
                        <TableCell className="text-sm">{tx.date}</TableCell>
                        <TableCell className="max-w-[240px] text-sm">{tx.description.vi}</TableCell>
                        <TableCell className={`text-right font-semibold ${tx.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          {tx.type === "income" ? "+" : "−"}{fmt(tx.amount)}
                        </TableCell>
                        <TableCell>{statusBadge(tx.status)}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Footer />

      {/* Withdrawal Modal */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("tx.withdraw.title")}</DialogTitle>
            <DialogDescription>{t("tx.withdraw.sub")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>{t("tx.withdraw.amount")}</Label>
              <Input type="number" placeholder="1.000.000" className="mt-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">{t("tx.withdraw.available")}: {fmt(balance)}</p>
            </div>
            <div>
              <Label>{t("tx.withdraw.bank")}</Label>
              <Select>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t("tx.withdraw.bank.ph")} />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("tx.withdraw.account")}</Label>
              <Input placeholder="0123456789" className="mt-1.5" />
            </div>
            <p className="rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
              {t("tx.withdraw.note")}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>{t("tx.withdraw.cancel")}</Button>
            <Button onClick={() => setWithdrawOpen(false)}>{t("tx.withdraw.confirm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top Up Modal */}
      <Dialog open={topUpOpen} onOpenChange={handleTopUpClose}>
        <DialogContent className="sm:max-w-md">
          {topUpStep === "form" && (
            <>
              <DialogHeader>
                <DialogTitle>{t("tx.topup.title")}</DialogTitle>
                <DialogDescription>{t("tx.topup.sub")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label>{t("tx.topup.amount")}</Label>
                  <Input
                    type="number"
                    placeholder="100000"
                    className="mt-1.5"
                    value={topUpAmount || ""}
                    onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  />
                  <div className="mt-2 flex gap-2">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setTopUpAmount(amt)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          topUpAmount === amt
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        }`}
                      >
                        {fmt(amt)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>{t("tx.topup.method")}</Label>
                  <Select value={topUpMethod} onValueChange={setTopUpMethod}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder={t("tx.topup.method.ph")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="momo">{t("tx.topup.momo")}</SelectItem>
                      <SelectItem value="vnpay">{t("tx.topup.vnpay")}</SelectItem>
                      <SelectItem value="bank">{t("tx.topup.bank")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTopUpOpen(false)}>{t("tx.withdraw.cancel")}</Button>
                <Button onClick={handleGenerateCode} disabled={!topUpAmount || !topUpMethod}>
                  {t("tx.topup.generate")}
                </Button>
              </DialogFooter>
            </>
          )}

          {topUpStep === "qr" && (
            <>
              <DialogHeader>
                <DialogTitle>{t("tx.topup.checkout")}</DialogTitle>
                <DialogDescription>{t("tx.topup.scan")}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                {/* Mock QR Code */}
                <div className="flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/50">
                  <QrCode className="h-24 w-24 text-muted-foreground" />
                </div>

                <div className="space-y-1 text-center text-sm">
                  <p><span className="text-muted-foreground">{t("tx.col.amount")}:</span> <span className="font-semibold">{fmt(topUpAmount)}</span></p>
                  <p><span className="text-muted-foreground">{t("tx.topup.memo")}:</span> <span className="font-mono text-xs">NAPTIEN_UIA_{Math.floor(Math.random() * 900 + 100)}</span></p>
                </div>

                <p className="text-sm text-muted-foreground">
                  {t("tx.topup.expires")} <span className="font-mono font-semibold text-foreground">{fmtCountdown(countdown)}</span>
                </p>

                <Button variant="secondary" className="mt-2" onClick={handleSimulateSuccess}>
                  {t("tx.topup.simulate")}
                </Button>
              </div>
            </>
          )}

          {topUpStep === "success" && (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-semibold">{t("tx.topup.success")}</p>
              <p className="text-sm text-muted-foreground">+{fmt(topUpAmount)}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
