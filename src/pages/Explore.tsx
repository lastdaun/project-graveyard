import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ApiProject, ApiResponse, ApiPage } from "@/types/api";
import { adaptApiProject } from "@/lib/api";
import type { Project } from "@/data/mockData";

const CATEGORY_OPTIONS = ["Tất cả", "IT", "Startup IT"];
const STATUS_OPTIONS = ["Tất cả", "Ý tưởng", "Nguyên mẫu", "Đang phát triển"];

const CATEGORY_API_MAP: Record<string, string> = {
  IT: "IT",
  "Startup IT": "STARTUP",
};

const STATUS_API_MAP: Record<string, string> = {
  "Ý tưởng": "IDEA",
  "Nguyên mẫu": "PROTOTYPE",
  "Đang phát triển": "DEVELOPING",
};

const Explore = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [status, setStatus] = useState("Tất cả");

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
        if (status !== "Tất cả") params.set("status", STATUS_API_MAP[status] ?? status.toUpperCase());
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
  }, [search, category, status]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">{t("explore.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("explore.sub")}</p>
        </div>

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
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t("explore.status")} />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
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
