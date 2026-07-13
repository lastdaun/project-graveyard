import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Loader2, Building2, GitBranch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ApiProject, ApiResponse, ApiPage } from "@/types/api";
import { adaptApiProject } from "@/lib/api";
import type { Project } from "@/data/mockData";

const CATEGORY_OPTIONS = ["Tất cả", "IT", "Startup IT"];

const CATEGORY_API_MAP: Record<string, string> = {
  IT: "IT",
  "Startup IT": "STARTUP",
};

type ListingTab = "ALL" | "COMPANY_SHOWCASE" | "ABANDONED_PROJECT";

const TAB_CONFIG: { value: ListingTab; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "ALL", label: "Tất cả", icon: Search, desc: "Tất cả project trên nền tảng" },
  { value: "COMPANY_SHOWCASE", label: "Project từ công ty", icon: Building2, desc: "Giải pháp & sản phẩm từ công ty phần mềm" },
  { value: "ABANDONED_PROJECT", label: "Project bỏ dở", icon: GitBranch, desc: "Dự án dang dở tìm người tiếp tục" },
];

const Explore = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get("type") as ListingTab) || "ALL";

  const [activeTab, setActiveTab] = useState<ListingTab>(initialType);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (category !== "Tất cả") params.set("category", CATEGORY_API_MAP[category] ?? category.toUpperCase());
        if (activeTab !== "ALL") params.set("listingType", activeTab);
        params.set("size", "50");

        const res = await fetch(`/api/projects?${params.toString()}`);
        if (!res.ok) throw new Error("Không thể tải danh sách dự án");

        const body: ApiResponse<ApiPage<ApiProject>> = await res.json();
        setProjects((body.data?.content ?? []).map(adaptApiProject));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchProjects, 300);
    return () => clearTimeout(debounce);
  }, [search, category, activeTab]);

  const currentTab = TAB_CONFIG.find((t) => t.value === activeTab)!;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold">Khám phá Marketplace</h1>
          <p className="mt-1 text-muted-foreground">{currentTab.desc}</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ListingTab)} className="mb-6">
          <TabsList className="h-auto gap-1 p-1">
            {TAB_CONFIG.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("explore.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t("explore.category")} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg font-medium text-destructive">{error}</p>
            <p className="text-sm">Vui lòng kiểm tra kết nối và thử lại</p>
          </div>
        ) : projects.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">{projects.length} kết quả</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </>
        ) : (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg font-medium">{t("explore.empty")}</p>
            <p className="text-sm">{t("explore.empty.sub")}</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Explore;
